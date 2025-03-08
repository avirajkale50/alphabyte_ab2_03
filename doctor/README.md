# SEVAमित्र - AI-Powered Clinical Decision Support System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB)
![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF)

SEVAमित्र is an innovative clinical decision support system that leverages Retrieval-Augmented Generation (RAG) to assist healthcare professionals in making informed clinical decisions.

## Features

- 🔐 **Secure OTP Authentication**: Two-factor authentication system for secure patient data access
- 📊 **Smart Document Analysis**: AI-powered analysis of medical reports and documents
- 💬 **Interactive Query System**: Natural language processing for medical document queries
- 📈 **Real-time Dashboard**: Comprehensive overview of patient data and medical insights
- 🔄 **Session Management**: Secure time-bound sessions for patient data access
- 📱 **Responsive Design**: Fully responsive interface that works on all devices

## Tech Stack

- **Frontend**: React 19.0.0 with Vite
- **Styling**: TailwindCSS
- **Authentication**: Clerk
- **State Management**: React Hooks
- **Routing**: React Router DOM
- **UI Components**: Lucide React
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Notifications**: React Toastify

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm/yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/avirajkale50/alphabyte_ab2_03.git
cd alphabyte_ab2_03/doctor
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YWxpdmUtbWluay0zOS5jbGVyay5hY2NvdW50cy5kZXYk
```

4. Start the development server:
```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

## Project Structure

```
doctor/
├── src/
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── OTPVerification.jsx
│   │   ├── DoctorDashboard.jsx
│   │   └── ReportsQuestionPage.jsx
│   ├── App.jsx
│   └── ...
├── public/
├── package.json
└── ...
```

## Features in Detail

### OTP Verification System
- Secure patient data access through time-bound OTP
- Real-time session management
- Automatic session expiration handling

### Doctor Dashboard
- Patient management interface
- Appointment scheduling
- Medical report access and analysis
- Real-time patient session monitoring

### Reports Query System
- Natural language processing for medical document analysis
- Interactive query interface
- Real-time response generation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Medical professionals who provided valuable feedback
- Open-source community for various tools and libraries
- Contributors who helped shape this project

---
Created with 💙 for better healthcare