import React, { useEffect, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DriveButton = () => {
    const [loading, setLoading] = useState(false);

    const handleFolderSelect = async (folderId, token) => {
        try {
            console.log("Selected Folder ID:", folderId);
            setLoading(true);

            const downloadResponse = await fetch('http://localhost:8000/api/drive/download-folder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ folder_id: folderId }),
            });

            if (!downloadResponse.ok) {
                throw new Error('Failed to download folder');
            }

            const result = await downloadResponse.json();
            console.log("Download response:", result);
            toast.success("Folder downloaded successfully!");
        } catch (error) {
            console.error('Error downloading folder:', error);
            toast.error("Failed to download folder.");
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = async (response) => {
        try {
            console.log("OAuth Token:", response.access_token);
            const token = response.access_token;
            
            if (!window.gapi || !window.google || !window.google.picker) {
                console.error("Google Picker API not loaded");
                return;
            }

            const view = new window.google.picker.DocsView(window.google.picker.ViewId.FOLDERS)
                .setSelectFolderEnabled(true)
                .setIncludeFolders(true)
                .setMimeTypes("application/vnd.google-apps.folder");

            const picker = new window.google.picker.PickerBuilder()
                .setOAuthToken(token)
                .addView(view)
                .setCallback((data) => {
                    if (data.action === window.google.picker.Action.PICKED) {
                        const folderId = data.docs[0].id;
                        console.log("Folder Picked ID:", folderId);
                        handleFolderSelect(folderId, token);
                    }
                })
                .build();

            picker.setVisible(true);
        } catch (error) {
            console.error('Error loading picker:', error);
        }
    };

    const login = useGoogleLogin({
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        onSuccess: handleSuccess,
        flow: 'implicit'  // Using implicit flow for client-side only
    });

    useEffect(() => {
        const loadPicker = () => {
            if (window.gapi && window.google && window.google.picker) return;
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                window.gapi.load('picker', { callback: () => console.log("Google Picker Loaded") });
            };
            document.body.appendChild(script);
        };
        loadPicker();
    }, []);

    return (
        <div className="flex flex-col items-center">
            <button 
                onClick={() => login()} 
                disabled={loading}
                className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors border flex items-center justify-center
                    ${loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"}`}
            >
                {loading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 mr-2 text-gray-600" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        Downloading...
                    </>
                ) : (
                    "Select Google Drive Folder"
                )}
            </button>
            
            <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
    );
};

export default DriveButton;
