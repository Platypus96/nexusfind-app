// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "nexusfind-7l43n",
  appId: "1:470473911552:web:90bae86a84680e809d17e5",
  storageBucket: "nexusfind-7l43n.firebasestorage.app",
  apiKey: "AIzaSyBixkb8aWV6C-RKqJs0VKwiD6TZenmhbDU",
  authDomain: "nexusfind-7l43n.firebaseapp.com",
  messagingSenderId: "470473911552"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
