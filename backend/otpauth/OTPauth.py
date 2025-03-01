from flask import Flask, request, jsonify, send_from_directory
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

# Base directory for storing patient files
BASE_PATIENT_DIR = "data/patient_files"
os.makedirs(BASE_PATIENT_DIR, exist_ok=True)  # Ensure directory exists


@app.route('/api/generate-otp', methods=['POST'])
def generate_otp():
    data = request.json
    patient_username = data.get('patientUsername')

    if not patient_username:
        return jsonify({"success": False, "message": "Patient username is required"}), 400

    otp = ''.join(random.choices(string.digits, k=6))
    redis_client.setex(f"otp:{patient_username}", 30, otp)

    return jsonify({"success": True, "otp": otp, "expiresIn": 30})


@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    patient_username = data.get('patientUsername')
    doctor_username = data.get('doctorUsername')
    submitted_otp = data.get('otp')

    if not all([patient_username, doctor_username, submitted_otp]):
        return jsonify({"success": False, "message": "Missing required fields"}), 400

    otp_key = f"otp:{patient_username}"
    stored_otp = redis_client.get(otp_key)

    if not stored_otp:
        return jsonify({"success": False, "message": "No active OTP or OTP expired"}), 400

    if submitted_otp != stored_otp:
        return jsonify({"success": False, "message": "Invalid OTP"}), 400

    redis_client.delete(otp_key)  # OTP is valid, delete it

    # Create session (1 hour)
    session_key = f"session:{patient_username}"
    session_data = json.dumps({
        'doctor_username': doctor_username,
        'created_at': datetime.now().isoformat(),
        'expires_at': (datetime.now() + timedelta(hours=1)).isoformat()
    })
    redis_client.setex(session_key, 3600, session_data)

    # Fetch documents dynamically
    documents = get_patient_documents(patient_username)

    return jsonify({
        "success": True,
        "message": "OTP verified successfully",
        "documents": documents,
        "session_expires_in": 3600
    })

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

    return jsonify({"success": True, "active": False})


@app.route('/api/end-session', methods=['POST'])
def end_session():
    data = request.json
    patient_username = data.get('patientUsername')

    if not patient_username:
        return jsonify({"success": False, "message": "Patient username is required"}), 400

    session_key = f"session:{patient_username}"
    if redis_client.exists(session_key):
        redis_client.delete(session_key)
        return jsonify({"success": True, "message": "Session ended successfully"})

    return jsonify({"success": False, "message": "No active session found"}), 404


if __name__ == "__main__":
    app.run(debug=True)