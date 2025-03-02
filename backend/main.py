from flask import Flask, request, jsonify
from flask_cors import CORS
from pydantic import BaseModel
from typing import Optional
import os
from pathlib import Path
from google.oauth2 import credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from io import BytesIO
from googleapiclient.errors import HttpError
import traceback
import io

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Constants
CACHE_DIR = Path("cache")

# Ensure the "uploads" folder is at the root of the project
UPLOADS_DIR = Path.cwd() / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

GOOGLE_MIME_TYPES = {
    'application/vnd.google-apps.document': ('application/pdf', '.pdf'),
    'application/vnd.google-apps.spreadsheet': ('application/pdf', '.pdf'),
    'application/vnd.google-apps.presentation': ('application/pdf', '.pdf'),
    'application/vnd.google-apps.drawing': ('application/pdf', '.pdf'),
}

# Pydantic model for request validation
class DriveRequest(BaseModel):
    folder_id: str
    credentials: Optional[dict] = None

# Helper functions
def download_regular_file(service, file_id: str, folder_path: str, file_name: str) -> str:
    try:
        print(f"Downloading regular file: {file_name} (ID: {file_id})")
        request = service.files().get_media(fileId=file_id)
        file_path = os.path.join(folder_path, file_name)

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

def download_google_file(service, file_id: str, folder_path: str, file_name: str, mime_type: str) -> str:
    try:
        print(f"Downloading Google Workspace file: {file_name} (ID: {file_id})")

        if mime_type in GOOGLE_MIME_TYPES:
            export_mime_type, extension = GOOGLE_MIME_TYPES[mime_type]
            request = service.files().export_media(fileId=file_id, mimeType=export_mime_type)

            if not file_name.endswith(extension):
                file_name += extension

            file_path = os.path.join(folder_path, file_name)

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

def download_file(service, file_id: str, folder_path: str, file_name: str, mime_type: str) -> str:
    try:
        file = service.files().get(fileId=file_id, fields='mimeType').execute()
        file_mime_type = file.get('mimeType', '')

        if file_mime_type.startswith('application/vnd.google-apps.'):
            return download_google_file(service, file_id, folder_path, file_name, file_mime_type)
        else:
            return download_regular_file(service, file_id, folder_path, file_name)

    except Exception as e:
        print(f"Error in file download process for {file_name}: {str(e)}")
        return None

def get_folder_name(service, folder_id: str) -> str:
    print(f"Fetching folder name for ID: {folder_id}")
    try:
        folder = service.files().get(fileId=folder_id, fields='name').execute()
        return folder['name']
    except Exception as e:
        print(f"Error getting folder name: {str(e)}")
        return f"folder_{folder_id}"

def download_folder_contents(service, folder_id: str, folder_path: str):
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
                subfolder_path = os.path.join(folder_path, item['name'])
                os.makedirs(subfolder_path, exist_ok=True)
                download_folder_contents(service, item['id'], subfolder_path)
            else:
                download_file(service, item['id'], folder_path, item['name'], item['mimeType'])
    except Exception as e:
        print(f"Error processing folder contents: {str(e)}")

# Routes
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

        folder_name = get_folder_name(service, folder_id)
        folder_path = UPLOADS_DIR / folder_name
        folder_path.mkdir(parents=True, exist_ok=True)
        print(f"Created folder path: {folder_path}")

        download_folder_contents(service, folder_id, str(folder_path))

        return jsonify({
            "status": "success",
            "message": "Folder downloaded successfully",
            "folder_path": str(folder_path)
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

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
