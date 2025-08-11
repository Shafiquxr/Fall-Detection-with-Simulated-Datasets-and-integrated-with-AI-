
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBWKSOrPc577A9UwGNvHG35kKEMjdnYqwc",
    authDomain: "fallcaregiverapp.firebaseapp.com",
    projectId: "fallcaregiverapp",
    storageBucket: "fallcaregiverapp.firebasestorage.app",
    messagingSenderId: "316685790645",
    appId: "1:316685790645:web:63208537bcfb62a6fdbdfc",
    measurementId: "G-QJ1Q22FLQ0"
  };

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
