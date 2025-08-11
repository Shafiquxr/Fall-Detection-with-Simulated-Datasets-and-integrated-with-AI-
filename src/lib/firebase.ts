
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
let app: FirebaseApp;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
