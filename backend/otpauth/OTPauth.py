from flask import Flask, request, jsonify
from flask_cors import CORS
import redis
import random
import string
import json
import os
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Redis setup
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

# Define path to the text folder at the same level as the backend folder
# Go two levels up from the current file's directory to reach the root, then to the text folder
TEXT_FILES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'uploads')
# print(TEXT_FILES_DIR)

# Print for debugging
print(f"Looking for text files in: {TEXT_FILES_DIR}")

@app.route('/api/generate-otp', methods=['POST'])
def generate_otp():
    data = request.json
    patient_username = data.get('patientUsername')
    
    if not patient_username:
        return jsonify({"success": False, "message": "Patient username is required"}), 400
    
    # Generate 6-digit OTP
    otp = ''.join(random.choices(string.digits, k=6))
    
    # Store OTP in Redis with 30-second expiration
    otp_key = f"otp:{patient_username}"
    redis_client.setex(otp_key, 30, otp)
    
    return jsonify({
        "success": True,
        "otp": otp,
        "expiresIn": 30
    })

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    patient_username = data.get('patientUsername')
    doctor_username = data.get('doctorUsername')
    submitted_otp = data.get('otp')
    
    if not all([patient_username, doctor_username, submitted_otp]):
        return jsonify({"success": False, "message": "Missing required fields"}), 400
    
    # Get OTP from Redis
    otp_key = f"otp:{patient_username}"
    stored_otp = redis_client.get(otp_key)
    
    if not stored_otp:
        return jsonify({"success": False, "message": "No active OTP or OTP expired"}), 400
    
    if submitted_otp != stored_otp:
        return jsonify({"success": False, "message": "Invalid OTP"}), 400
    
    # OTP is valid, delete it
    redis_client.delete(otp_key)
    
    # Create session (1 hour)
    session_key = f"session:{patient_username}"
    session_data = json.dumps({
        'doctor_username': doctor_username,
        'created_at': datetime.now().isoformat(),
        'expires_at': (datetime.now() + timedelta(hours=1)).isoformat()
    })
    redis_client.setex(session_key, 3600, session_data)
    
    # Log this access for audit trail
    access_log_key = f"access_log:{patient_username}"
    access_log = {
        'doctor_username': doctor_username,
        'timestamp': datetime.now().isoformat(),
        'action': 'access_granted'
    }
    redis_client.lpush(access_log_key, json.dumps(access_log))
    redis_client.ltrim(access_log_key, 0, 99)  # Keep last 100 acces 
    
    # Get list of available text files
    available_files = []
    try:
        for filename in os.listdir(TEXT_FILES_DIR):
            if filename.endswith('.pdf'):
                available_files.append(filename)
    except Exception as e:
        print(f"Error reading directory: {e}")
    
    return jsonify({
        "success": True,
        "message": "OTP verified successfully",
        "files": available_files,
        "session_expires_in": 3600
    })

@app.route('/api/get-file-content', methods=['GET'])
def get_file_content():
    patient_username = request.args.get('patientUsername')
    filename = request.args.get('filename')
    
    if not patient_username or not filename:
        return jsonify({"success": False, "message": "Patient username and filename are required"}), 400
    
    # Check if session exists
    session_key = f"session:{patient_username}"
    if not redis_client.exists(session_key):
        return jsonify({"success": False, "message": "No active session found"}), 401
    
    # Security check - prevent directory traversal
    safe_filename = os.path.basename(filename)
    file_path = os.path.join(TEXT_FILES_DIR, safe_filename)
    
    # Check if file exists and is within the text directory
    if not os.path.exists(file_path) or not os.path.isfile(file_path):
        return jsonify({"success": False, "message": "File not found"}), 404
    
    try:
        # Check if the file is a PDF
        is_pdf = filename.lower().endswith('.pdf')
        
        if is_pdf:
            # Read PDF file in binary mode and encode as base64
            with open(file_path, 'rb') as file:
                pdf_data = file.read()
                import base64
                pdf_base64 = base64.b64encode(pdf_data).decode('utf-8')
                content = pdf_base64
        else:
            # Regular text file - try different encodings if needed
            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    content = file.read()
            except UnicodeDecodeError:
                # If UTF-8 fails, try with latin-1 encoding
                with open(file_path, 'r', encoding='latin-1') as file:
                    content = file.read()
        
        # Log this file access for audit
        session_data = json.loads(redis_client.get(session_key))
        doctor_username = session_data.get('doctor_username', 'unknown')
        
        access_log_key = f"access_log:{patient_username}"
        access_log = {
            'doctor_username': doctor_username,
            'timestamp': datetime.now().isoformat(),
            'action': 'file_accessed',
            'filename': safe_filename,
            'file_type': 'pdf' if is_pdf else 'text'
        }
        redis_client.lpush(access_log_key, json.dumps(access_log))
        
        return jsonify({
            "success": True,
            "filename": safe_filename,
            "content": content,
            "isPdf": is_pdf
        })
    except Exception as e:
        print(f"Error reading file {safe_filename}: {type(e).__name__}: {str(e)}")
        return jsonify({"success": False, "message": f"Error reading file: {str(e)}"}), 500

@app.route('/api/session-status', methods=['GET'])
def session_status():
    patient_username = request.args.get('patientUsername')
    
    if not patient_username:
        return jsonify({"success": False, "message": "Patient username is required"}), 400
    
    session_key = f"session:{patient_username}"
    if redis_client.exists(session_key):
        session_data = redis_client.get(session_key)
        session_info = json.loads(session_data)
        ttl = redis_client.ttl(session_key)
        
        return jsonify({
            "success": True,
            "active": True,
            "doctor_username": session_info.get('doctor_username'),
            "expires_in": ttl
        })
    
    return jsonify({
        "success": True,
        "active": False
    })

@app.route('/api/end-session', methods=['POST'])
def end_session():
    data = request.json
    patient_username = data.get('patientUsername')
    
    if not patient_username:
        return jsonify({"success": False, "message": "Patient username is required"}), 400
    
    session_key = f"session:{patient_username}"
    if redis_client.exists(session_key):
        # Get session data for logging
        session_data = redis_client.get(session_key)
        session_info = json.loads(session_data)
        
        # Log session end for audit
        access_log_key = f"access_log:{patient_username}"
        access_log = {
            'doctor_username': session_info.get('doctor_username', 'unknown'),
            'timestamp': datetime.now().isoformat(),
            'action': 'session_ended'
        }
        redis_client.lpush(access_log_key, json.dumps(access_log))
        
        # Delete the session
        redis_client.delete(session_key)
        return jsonify({"success": True, "message": "Session ended successfully"})
    
    return jsonify({"success": False, "message": "No active session found"}), 404

if __name__ == "__main__":
    app.run(debug=True, port=3000)