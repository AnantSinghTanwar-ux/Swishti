import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyC6UnyjIulos1IDKE7EU84Kl-w8SKkQcow",
  authDomain: "swishti.firebaseapp.com",
  projectId: "swishti",
  storageBucket: "swishti.firebasestorage.app",
  messagingSenderId: "127723231625",
  appId: "1:127723231625:web:0109c05bf4c607db85a958",
  measurementId: "G-8L3KZY00TB"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
