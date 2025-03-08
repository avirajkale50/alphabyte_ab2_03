from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pydantic import BaseModel
from typing import Optional
import os
from werkzeug.utils import secure_filename
from backend.rag.ocr_processing import process_uploads, pdf_to_text
from backend.rag.vector_store import create_vector_store
from backend.rag.query_gemini import GeminiQuery
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.docstore.document import Document

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Add CORS middleware

# Base directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Configuration
CONFIG = {
    'UPLOAD_FOLDER': os.path.join(BASE_DIR, 'uploads'),
    'TEXT_FOLDER': os.path.join(BASE_DIR, 'text'),
    'RAG_FOLDER' : os.path.join(BASE_DIR, 'rag'),
    'ALLOWED_EXTENSIONS': {'pdf', 'txt'}
}



# Ensure directories exist
for folder in [CONFIG['UPLOAD_FOLDER'], CONFIG['TEXT_FOLDER'], CONFIG['RAG_FOLDER']]:
    os.makedirs(folder, exist_ok=True)

# Helper function to check allowed file extensions
def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in CONFIG['ALLOWED_EXTENSIONS']

# Endpoint to create knowledge base
@app.route("/kb", methods=["POST"])
def handle_kb():
    try:
        # Process all PDFs in uploads folder
        processed = process_uploads(CONFIG['UPLOAD_FOLDER'], CONFIG['TEXT_FOLDER'])
        
        # Create new vector store
        create_vector_store(CONFIG['TEXT_FOLDER'], CONFIG['RAG_FOLDER'])

        print("inside try")
        
        return jsonify({
            "status": "success",
            "message": "Knowledge base created",
            "vector_store_path": CONFIG['RAG_FOLDER']
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/kb_add_file", methods=["POST"])
def handle_add_file():
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file uploaded"}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"status": "error", "message": "Empty filename"}), 400
        
    if not allowed_file(file.filename):
        return jsonify({"status": "error", "message": "Invalid file type"}), 400

    filename = secure_filename(file.filename)
    text_content = ""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    try:
        if filename.lower().endswith('.pdf'):
            pdf_path = os.path.join(CONFIG['UPLOAD_FOLDER'], filename)
            file.save(pdf_path)
            text_path = pdf_to_text(pdf_path, CONFIG['TEXT_FOLDER'])
            with open(text_path, 'r', encoding='utf-8') as f:
                text_content = f.read()
                
        else:
            text_path = os.path.join(CONFIG['TEXT_FOLDER'], filename)
            file.save(text_path)
            with open(text_path, 'r', encoding='utf-8') as f:
                text_content = f.read()

        splits = text_splitter.create_documents([text_content])
        
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        vector_store = FAISS.load_local(
            CONFIG['RAG_FOLDER'], 
            embeddings, 
            allow_dangerous_deserialization=True
        )
        
        vector_store.add_documents(splits)
        vector_store.save_local(CONFIG['RAG_FOLDER'])
        
        return jsonify({
            "status": "success",
            "message": "File added to knowledge base",
            "file_path": text_path
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/chat", methods=["POST"])
def handle_chat():
    try:
        data = request.get_json()
        prompt = data.get("prompt", "")
        
        if not prompt:
            return jsonify({"status": "error", "message": "No prompt provided"}), 400
            
        print(CONFIG['RAG_FOLDER'])
        qa = GeminiQuery(r"C:\Users\dinne\OneDrive\Documents\Desktop\Alphabyte\rag")
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
            "vector_store_path": None,
            "filenames": filenames
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)