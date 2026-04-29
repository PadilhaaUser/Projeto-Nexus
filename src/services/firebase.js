import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDQlnJ6jZOltUxFgoKsZzk-AHe-z8py2hU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nexus-gestao.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nexus-gestao",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nexus-gestao.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "209238838036",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:209238838036:web:0a18b0b97cc2ba46ae5001"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
setPersistence(auth, browserSessionPersistence);
