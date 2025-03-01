# SEVAमित्र - AI-Powered Healthcare Platform

![React](https://img.shields.io/badge/React-19.0.0-61DAFB)
![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF)

**SEVAमित्र** is an AI-driven healthcare platform designed to enhance patient engagement, enable secure communication between patients and healthcare providers, and provide AI-powered insights using **Retrieval-Augmented Generation (RAG)** for better decision-making.

## Screenshots, Videos & Presentations
To better understand the platform, here are some visuals and videos demonstrating SEVAमित्र in action:
### Presentation
![Presentation](./screenshots/Presentation.png)
[Download the PPT](./Presentation/Alphabyte_ab2_03.pdf)


### 🎬 Video Demonstration

<div align="center">
  
[![Watch the Demo](https://img.shields.io/badge/▶️%20Watch%20Demo-Video-FF0000?style=for-the-badge)](https://drive.google.com/file/d/1QT0n3FD0NP5UA1HRofR8vAhA9jgvn1t1/view?usp=drive_link)

[⬇️ Download Video Demo](https://drive.google.com/uc?export=download&id=1QT0n3FD0NP5UA1HRofR8vAhA9jgvn1t1)

</div>


### Patient Portal
![Patient Landing](./screenshots/PatientLanding.png)
![Patient Features](./screenshots/patientLanding2.png)
![Patient Login](./screenshots/Patientlogin.png)
![Patient Dashboard](./screenshots/patientDashboard.png)
![Patient GenerateOTP](./screenshots/generateOTP.png)

### Doctor's Portal
![Doctor Landing](./screenshots/doctorlanding.png)
![Doctor Fetures and How it Works](./screenshots/doctorlanding2.png)
![Doctor Login](./screenshots/doctorlogin.png)
![Doctor Dashboard](./screenshots/doctordashboard.png)
![Doctor Dashboard](./screenshots/OTPVerification.png)

### AI-Powered Report Analysis
![AI Analysis](./screenshots/AIChat.jpg)



---


## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Modules](#modules)
  - [1. Patient Portal](#1-patient-portal)
  - [2. Doctor's Portal](#2-doctors-portal)
  - [3. Backend & RAG-based AI](#3-backend--rag-based-ai)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Features
- 🔐 **Secure OTP-Based Authentication**
- 🏥 **Centralized Health Record Management**
- 💬 **AI-Powered Medical Report Analysis**
- 📊 **Doctor-Patient Real-time Communication**
- 🔄 **Time-Bound Session Management**
- 📱 **Fully Responsive Design for Web & Mobile**

## Tech Stack
- **Frontend**: React 19.0.0 with Vite
- **Styling**: TailwindCSS
- **Authentication**: Clerk
- **State Management**: React Hooks
- **Routing**: React Router DOM
- **UI Components**: Lucide React
- **Animations**: Framer Motion
- **Backend**: Node.js, Express
- **AI Engine**: Retrieval-Augmented Generation (RAG), OpenAI API
- **Database**: PostgreSQL, Firebase

## Installation
### Prerequisites
- Node.js (v16 or higher)
- npm/yarn
- Google Drive API credentials (for document storage)

### Steps to Set Up
#### 1. Clone the repository:
```bash
git clone https://github.com/avirajkale50/alphabyte_ab2_03.git
cd alphabyte_ab2_03
```

#### 2. Install dependencies for all modules:
```bash
npm install
```

#### 3. Create a `.env` file and configure environment variables:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Zmx1ZW50LWNhcmlib3UtNjUuY2xlcmsuYWNjb3VudHMuZGV2JA
```

#### 4. Start the development servers:
```bash
npm run dev
```

## Project Structure
```
SEVAMitr/
├── patient/        # Patient-facing application
├── doctor/         # Doctor-facing application
├── backend/        # AI-driven backend and RAG model
└── README.md       # Project documentation
```

## Modules
### 1. Patient Portal
**SEVAमित्र Patient Portal** enables patients to manage their medical records securely and share them with healthcare providers.
#### Key Features:
- Secure authentication using **Clerk**
- OTP-based sharing of medical records
- Digital health record management
- Interactive health dashboard
- Real-time session monitoring

#### Running the Patient Portal
```bash
cd patient
npm install
npm run dev
```

### 2. Doctor's Portal
**SEVAमित्र Doctor Portal** helps healthcare providers access patient data and leverage AI-powered document analysis.
#### Key Features:
- OTP-based authentication to access patient records
- AI-powered medical document analysis
- Patient management dashboard
- Appointment scheduling and tracking
- Real-time chat and patient engagement

#### Running the Doctor's Portal
```bash
cd doctor
npm install
npm run dev
```

### 3. Backend & RAG-based AI
**SEVAमित्र Backend** integrates AI-powered Retrieval-Augmented Generation (RAG) for analyzing medical reports and providing recommendations.

#### Architecture
```
backend/
├── main.py           # Drive integration service
├── rag/
│   ├── ocr_processing.py    # PDF processing & OCR
│   ├── vector_store.py      # FAISS vector store management
│   └── query_gemini.py      # Gemini AI query handler
├── uploads/          # Document storage
├── text/            # Processed text storage
└── rag/             # Vector store data
```

#### Key Components
1. **Document Processing Service**
   - PDF text extraction with `PyMuPDF`
   - OCR capabilities using `Tesseract`
   - Handles both scanned and digital documents

2. **RAG Implementation**
   - Uses FAISS for efficient vector storage
   - HuggingFace embeddings (all-MiniLM-L6-v2)
   - Chunking with RecursiveCharacterTextSplitter

3. **API Endpoints**
   - `/kb`: Creates knowledge base from documents
   - `/kb_add_file`: Adds new documents to knowledge base
   - `/chat`: Handles AI-powered document queries
   - `/kb_files`: Manages document retrieval

#### Environment Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
GOOGLE_API_KEY=AIzaSyDpSleO3jTRPwEjbACX885cfy7B5VncHTk
```

#### API Usage Examples
```python
# Create knowledge base
POST /kb
Response: {
    "status": "success",
    "message": "Knowledge base created",
    "vector_store_path": "/path/to/store"
}

# Query medical documents
POST /chat
Body: {
    "prompt": "What are the key findings in the blood report?"
}
Response: {
    "status": "success",
    "response": "AI-generated analysis..."
}
```

#### Drive Integration
- Secure document retrieval from Google Drive
- Automatic file type detection and conversion
- Support for various medical document formats

#### Performance Optimization
- Chunked document processing
- Cached vector embeddings
- Parallel processing for large documents

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- Medical professionals for their valuable insights
- Open-source community for tools and libraries
- Contributors and testers for refining the project

---
Built with 💙 for better home healthcare access

