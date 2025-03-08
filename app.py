from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pydantic import BaseModel
from typing import Optional
import os
from pathlib import Path
from werkzeug.utils import secure_filename
import traceback
import io
import requests
import pickle
import json
# Google Drive imports
from google.oauth2 import credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from googleapiclient.errors import HttpError

# RAG components
from backend.rag.ocr_processing import process_uploads, pdf_to_text
from backend.rag.vector_store import create_vector_store
from backend.rag.query_gemini import GeminiQuery
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.docstore.document import Document

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Base directory and configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Configuration
CONFIG = {
    'UPLOAD_FOLDER': os.path.join(BASE_DIR, 'uploads'),
    'TEXT_FOLDER': os.path.join(BASE_DIR, 'text'),
    'RAG_FOLDER': os.path.join(BASE_DIR, 'rag'),
    'ALLOWED_EXTENSIONS': {'pdf', 'txt', 'docx', 'xlsx', 'pptx'}
}

# Constants for Google Drive
GOOGLE_MIME_TYPES = {
    'application/vnd.google-apps.document': ('application/pdf', '.pdf'),
    'application/vnd.google-apps.spreadsheet': ('application/pdf', '.pdf'),
    'application/vnd.google-apps.presentation': ('application/pdf', '.pdf'),
    'application/vnd.google-apps.drawing': ('application/pdf', '.pdf'),
}

# Ensure directories exist
for folder in [CONFIG['UPLOAD_FOLDER'], CONFIG['TEXT_FOLDER'], CONFIG['RAG_FOLDER']]:
    os.makedirs(folder, exist_ok=True)

# Pydantic model for request validation
class DriveRequest(BaseModel):
    folder_id: str
    credentials: Optional[dict] = None

# Helper Functions
def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in CONFIG['ALLOWED_EXTENSIONS']

# Google Drive Helper Functions
def download_regular_file(service, file_id: str, file_name: str) -> str:
    try:
        print(f"Downloading regular file: {file_name} (ID: {file_id})")
        request = service.files().get_media(fileId=file_id)
        file_path = os.path.join(CONFIG['UPLOAD_FOLDER'], file_name)

        with io.FileIO(file_path, 'wb') as file:
            downloader = MediaIoBaseDownload(file, request)
            done = False
            while not done:
                status, done = downloader.next_chunk()
                print(f"Download progress: {int(status.progress() * 100)}%")

        print(f"File successfully downloaded to: {file_path}")
        return file_path
    except Exception as e:
        print(f"Error downloading regular file {file_name}: {str(e)}")
        return None

def download_google_file(service, file_id: str, file_name: str, mime_type: str) -> str:
    try:
        print(f"Downloading Google Workspace file: {file_name} (ID: {file_id})")

        if mime_type in GOOGLE_MIME_TYPES:
            export_mime_type, extension = GOOGLE_MIME_TYPES[mime_type]
            request = service.files().export_media(fileId=file_id, mimeType=export_mime_type)

            if not file_name.endswith(extension):
                file_name += extension

            file_path = os.path.join(CONFIG['UPLOAD_FOLDER'], file_name)

            with io.FileIO(file_path, 'wb') as file:
                downloader = MediaIoBaseDownload(file, request)
                done = False
                while not done:
                    status, done = downloader.next_chunk()
                    print(f"Download progress: {int(status.progress() * 100)}%")

            print(f"Google Workspace file successfully downloaded to: {file_path}")
            return file_path
        else:
            print(f"Unsupported Google Workspace file type: {mime_type}")
            return None

    except Exception as e:
        print(f"Error downloading Google Workspace file {file_name}: {str(e)}")
        return None

def download_file(service, file_id: str, file_name: str, mime_type: str) -> str:
    try:
        file = service.files().get(fileId=file_id, fields='mimeType').execute()
        file_mime_type = file.get('mimeType', '')

        if file_mime_type.startswith('application/vnd.google-apps.'):
            return download_google_file(service, file_id, file_name, file_mime_type)
        else:
            return download_regular_file(service, file_id, file_name)

    except Exception as e:
        print(f"Error in file download process for {file_name}: {str(e)}")
        return None

def download_folder_contents(service, folder_id: str, parent_path=""):
    print(f"Fetching contents of folder ID: {folder_id}")
    try:
        query = f"'{folder_id}' in parents"
        results = service.files().list(
            q=query,
            fields="files(id, name, mimeType)",
            pageSize=1000
        ).execute()
        items = results.get('files', [])
        print(f"Found {len(items)} items in folder.")

        for item in items:
            print(f"Processing item: {item['name']} (Type: {item['mimeType']})")
            if item['mimeType'] == 'application/vnd.google-apps.folder':
                # For subfolders, prepend the folder name to the files
                subfolder_prefix = f"{parent_path}_{item['name']}" if parent_path else item['name']
                download_folder_contents(service, item['id'], subfolder_prefix)
            else:
                # For files, add prefix if there's a parent path
                file_name = item['name']
                if parent_path:
                    base_name, ext = os.path.splitext(file_name)
                    file_name = f"{parent_path}_{base_name}{ext}"
                
                download_file(service, item['id'], file_name, item['mimeType'])
    except Exception as e:
        print(f"Error processing folder contents: {str(e)}")
        return []

# Routes

# Google Drive Routes
@app.route("/api/drive/download-folder", methods=["POST"])
def download_folder():
    try:
        authorization = request.headers.get("Authorization")
        if not authorization:
            return jsonify({"error": "No authorization token provided"}), 401

        token = authorization.replace("Bearer ", "")

        creds = credentials.Credentials(
            token=token,
            scopes=['https://www.googleapis.com/auth/drive.readonly']
        )

        service = build('drive', 'v3', credentials=creds)
        print("Google Drive service initialized.")

        data = request.get_json()
        folder_id = data.get("folder_id")
        if not folder_id:
            return jsonify({"error": "Folder ID is required"}), 400

        # Get folder name for prefixing files if needed
        folder_name = ""
        try:
            folder = service.files().get(fileId=folder_id, fields='name').execute()
            folder_name = folder.get('name', '')
        except Exception as e:
            print(f"Warning: Could not get folder name: {str(e)}")

        download_folder_contents(service, folder_id, folder_name)
        
        # Process downloads and update knowledge base
        process_kb()

        return jsonify({
            "status": "success",
            "message": "Folder contents downloaded and knowledge base updated",
            "folder_path": CONFIG['UPLOAD_FOLDER']
        })

    except HttpError as error:
        error_message = f"Google API error: {str(error)}"
        print(error_message)
        print("Stacktrace:")
        traceback.print_exc()
        return jsonify({"error": error_message}), 500

    except Exception as e:
        error_message = f"An unexpected error occurred: {str(e)}"
        print(error_message)
        print("Stacktrace:")
        traceback.print_exc()
        return jsonify({"error": error_message}), 500

# Knowledge Base Routes
def process_kb():
    """Process all uploads and update the knowledge base"""
    try:
        # Process all PDFs in uploads folder
        processed = process_uploads(CONFIG['UPLOAD_FOLDER'], CONFIG['TEXT_FOLDER'])
        
        # Create new vector store
        create_vector_store(CONFIG['TEXT_FOLDER'], CONFIG['RAG_FOLDER'])
        
        print("Knowledge base successfully updated")
        return True
    except Exception as e:
        print(f"Error updating knowledge base: {str(e)}")
        return False

@app.route("/kb", methods=["POST"])
def handle_kb():
    try:
        success = process_kb()
        
        if success:
            return jsonify({
                "status": "success",
                "message": "Knowledge base created",
                "vector_store_path": CONFIG['RAG_FOLDER']
            })
        else:
            return jsonify({
                "status": "error", 
                "message": "Failed to process knowledge base"
            }), 500
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/kb_add_file", methods=["POST"])
def handle_add_file():
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file uploaded"}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"status": "error", "message": "Empty filename"}), 400
        
    # Modified to only accept .txt files
    if not file.filename.lower().endswith('.txt'):
        return jsonify({"status": "error", "message": "Only .txt files are accepted"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(CONFIG['UPLOAD_FOLDER'], filename)
    
    # Save the file first
    file.save(file_path)
    print(f"File saved to {file_path}")
    
    try:
        text_content = ""
        text_path = os.path.join(CONFIG['TEXT_FOLDER'], filename)
        
        # Directly read text content with error handling for encoding
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            text_content = f.read()
        
        # Save a copy to text folder
        with open(text_path, 'w', encoding='utf-8') as f:
            f.write(text_content)

        # Verify we have text to process
        if not text_content.strip():
            return jsonify({"status": "error", "message": "No text content extracted from file"}), 500
            
        print(f"Extracted {len(text_content)} characters of text")
        
        # ADD THIS BLOCK HERE - REPLACING YOUR EXISTING CODE FOR CREATING CHUNKS
        # -----------------------------------------------------------------------
        # Before creating text chunks
        source_name = os.path.basename(file_path).split('.')[0]  # Extract filename without extension
        
        # Create document with proper metadata
        doc = Document(
            page_content=text_content,
            metadata={"source": source_name, "path": file_path}
        )
        
        # Then split the document
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        splits = text_splitter.split_documents([doc])
        # -----------------------------------------------------------------------
        
        print(f"Created {len(splits)} text chunks")
        
        # Rest of your existing code follows...
        try:
            embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
            print("Embeddings model loaded")
            
            # Check if vector store exists
            if not os.path.exists(CONFIG['RAG_FOLDER']) or not os.listdir(CONFIG['RAG_FOLDER']):
                print("Creating new vector store")
                vector_store = FAISS.from_documents(splits, embeddings)
            else:
                print("Loading existing vector store")
                vector_store = FAISS.load_local(
                    CONFIG['RAG_FOLDER'], 
                    embeddings, 
                    allow_dangerous_deserialization=True
                )
                print("Adding documents to vector store")
                vector_store.add_documents(splits)
                
            print("Saving vector store")
            vector_store.save_local(CONFIG['RAG_FOLDER'])
            print("Vector store saved successfully")
            
        except Exception as ve:
            print(f"Vector store error: {str(ve)}")
            traceback.print_exc()
            return jsonify({"status": "error", "message": f"Vector store operation failed: {str(ve)}"}), 500
        
        return jsonify({
            "status": "success",
            "message": "File added to knowledge base",
            "file_path": text_path,
            "chunks_added": len(splits)
        })
        
    except Exception as e:
        print(f"Error processing file: {str(e)}")
        traceback.print_exc()
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/chat", methods=["POST"])
def handle_chat():
    try:
        data = request.get_json()
        prompt = data.get("prompt", "")
        
        if not prompt:
            return jsonify({"status": "error", "message": "No prompt provided"}), 400
            
        qa = GeminiQuery(CONFIG['RAG_FOLDER'])
        response = qa.query(prompt)
        return jsonify({
            "status": "success",
            "response": response
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
@app.route("/kb_files/<filename>", methods=["GET"])
def handle_kb_file(filename):
    try:
        file_path = os.path.join(CONFIG['UPLOAD_FOLDER'], filename)
        
        if not os.path.isfile(file_path):
            return jsonify({"status": "error", "message": "File not found"}), 404
        
        if filename.lower().endswith('.pdf'):
            return send_file(
                file_path, 
                mimetype="application/pdf",
                as_attachment=False,
                download_name=filename
            )
        else:
            return send_file(
                file_path, 
                mimetype="application/octet-stream",
                as_attachment=True,
                download_name=filename
            )
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
@app.route("/kb_files", methods=["GET"])
def handle_kb_files():
    try:
        uploads_folder = CONFIG['UPLOAD_FOLDER']
        filenames = os.listdir(uploads_folder)
        
        return jsonify({
            "status": "success",
            "message": "Files in uploads folder",
            "file_path": uploads_folder,
            "vector_store_path": CONFIG['RAG_FOLDER'],
            "filenames": filenames
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)