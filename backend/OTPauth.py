from flask import Flask, request, jsonify
from flask_cors import CORS
import redis
import random
import string
import json
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Redis setup
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

@app.route('/api/generate-otp', methods=['POST'])
def generate_otp():
    data = request.json
    patient_id = data.get('patientId')
    
    # Generate 6-digit OTP
    otp = ''.join(random.choices(string.digits, k=6))
    
    # Store OTP in Redis with 30-second expiration
    otp_key = f"otp:{patient_id}"
    redis_client.setex(otp_key, 30, otp)
    
    return jsonify({
        "success": True,
        "otp": otp,
        "expiresIn": 30
    })

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    patient_id = data.get('patientId')
    doctor_id = data.get('doctorId')
    submitted_otp = data.get('otp')
    
    # Get OTP from Redis
    otp_key = f"otp:{patient_id}"
    stored_otp = redis_client.get(otp_key)
    
    if not stored_otp:
        return jsonify({"success": False, "message": "No active OTP or OTP expired"}), 400
    
    if submitted_otp != stored_otp:
        return jsonify({"success": False, "message": "Invalid OTP"}), 400
    
    # OTP is valid, delete it
    redis_client.delete(otp_key)
    
    # Create session (1 hour)
    session_key = f"session:{patient_id}"
    session_data = json.dumps({'doctor_id': doctor_id})
    redis_client.setex(session_key, 3600, session_data)
    
    # Mock documents for demo
    documents = ["Medical history", "Lab results", "Prescriptions"]
    
    return jsonify({
        "success": True,
        "message": "OTP verified successfully",
        "documents": documents
    })

@app.route('/api/end-session', methods=['POST'])
def end_session():
    data = request.json
    patient_id = data.get('patientId')
    
    session_key = f"session:{patient_id}"
    if redis_client.exists(session_key):
        redis_client.delete(session_key)
        return jsonify({"success": True, "message": "Session ended"})
    
    return jsonify({"success": False, "message": "No active session"}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)