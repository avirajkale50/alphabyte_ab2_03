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
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Constants
CACHE_DIR = Path("cache")

# Create uploads directory one level up from the current working directory
UPLOADS_DIR = Path.cwd().parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

GOOGLE_MIME_TYPES = {
    'application/vnd.google-apps.document': ('application/pdf', '.pdf'),
    'application/vnd.google-apps.spreadsheet': ('application/pdf', '.pdf'),
    'application/vnd.google-apps.presentation': ('application/pdf', '.pdf'),
    'application/vnd.google-apps.drawing': ('application/pdf', '.pdf'),
}

# Notification endpoint
NOTIFICATION_ENDPOINT = "http://127.0.0.1:5000/kb"

# Pydantic model for request validation
class DriveRequest(BaseModel):
    folder_id: str
    credentials: Optional[dict] = None

# Helper functions
def download_regular_file(service, file_id: str, file_name: str) -> str:
    try:
        print(f"Downloading regular file: {file_name} (ID: {file_id})")
        request = service.files().get_media(fileId=file_id)
        file_path = os.path.join(str(UPLOADS_DIR), file_name)

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

            file_path = os.path.join(str(UPLOADS_DIR), file_name)

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

def send_notification():
    """Send notification to the specified endpoint after download is complete"""
    try:
        print(f"Sending POST notification to {NOTIFICATION_ENDPOINT}")
        # Send a POST request instead of GET
        response = requests.post(NOTIFICATION_ENDPOINT, json={})
        if response.status_code == 200:
            print("Notification sent successfully")
            print(f"Response: {response.text}")
            return True
        else:
            print(f"Notification failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"Error sending notification: {str(e)}")
        return False

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

        # Get folder name for prefixing files if needed
        folder_name = ""
        try:
            folder = service.files().get(fileId=folder_id, fields='name').execute()
            folder_name = folder.get('name', '')
        except Exception as e:
            print(f"Warning: Could not get folder name: {str(e)}")

        download_folder_contents(service, folder_id, folder_name)
        
        # Send notification after download is complete
        notification_status = send_notification()

        return jsonify({
            "status": "success",
            "message": "Folder contents downloaded successfully",
            "folder_path": str(UPLOADS_DIR),
            "notification_sent": notification_status
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
    app.run(host="0.0.0.0", port=8000, debug=True)