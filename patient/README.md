# SEVAमित्र Patient Portal - Secure Medical Records Access

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB)
![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF)

SEVAमित्र Patient Portal is a secure platform that enables patients to manage their medical records and share them with healthcare providers through a secure OTP-based system.

## Key Features

- 🔒 **Secure Authentication**: Clerk-based user authentication system
- 🏥 **Digital Health Records**: Centralized storage for all medical documents
- 🔐 **OTP-Based Sharing**: Temporary access provision to doctors via OTP
- 📊 **Interactive Dashboard**: Comprehensive view of health records and appointments
- ⏱️ **Session Management**: Time-bound access control for medical professionals
- 📱 **Responsive Design**: Full functionality across all devices

## Tech Stack

- **Frontend**: React 19.0.0 with Vite
- **Authentication**: Clerk
- **UI Framework**: TailwindCSS
- **Calendar**: React Calendar
- **Notifications**: React Toastify
- **API Integration**: Axios
- **State Management**: React Hooks
- **Routing**: React Router DOM
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm/yarn
- Google Drive API credentials (for document storage)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/avirajkale50/alphabyte_ab2_03.git
cd alphabyte_ab2_03/patient
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Zmx1ZW50LWNhcmlib3UtNjUuY2xlcmsuYWNjb3VudHMuZGV2JA
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
patient/
├── src/
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── PatientOTPPage.jsx
│   │   └── PatientDashboard.jsx
│   ├── App.jsx
│   └── ...
├── public/
├── package.json
└── ...
```

## Core Features

### Patient Dashboard
- Personal health information management
- Appointment tracking and history
- Medical records organization
- Health tips and advisories

### OTP Generation System
- Secure OTP generation for record sharing
- Time-bound access control
- Real-time session monitoring
- Instant access revocation capability

### Medical Records Management
- Secure document storage integration
- Easy sharing with healthcare providers
- Document categorization and organization
- Access history tracking

## Security Features

- 🔐 End-to-end encryption for data transfer
- 🕒 Time-limited access tokens
- 📱 Two-factor authentication support
- 🔍 Comprehensive access logging
- ⚡ Real-time session monitoring

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Environment Variables

Required environment variables:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Clerk for secure authentication
- Google Drive API for document storage
- React and Vite communities
- All contributors and testers

---
Built with 💙 for better healthcare access