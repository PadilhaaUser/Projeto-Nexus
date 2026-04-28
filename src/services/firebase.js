import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDQlnJ6jZOltUxFgoKsZzk-AHe-z8py2hU",
  authDomain: "agrourb-gestao.firebaseapp.com",
  projectId: "agrourb-gestao",
  storageBucket: "agrourb-gestao.firebasestorage.app",
  messagingSenderId: "209238838036",
  appId: "1:209238838036:web:0a18b0b97cc2ba46ae5001"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
setPersistence(auth, browserSessionPersistence);
