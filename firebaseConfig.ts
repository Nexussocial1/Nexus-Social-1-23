import { initializeApp, getApps } from "firebase/app";
import { getFirestore, serverTimestamp } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD8pCEwiDHWvb4vju9vtsXvxFvB29SM6VM",
  authDomain: "nexus-social-dce76.firebaseapp.com",
  projectId: "nexus-social-dce76",
  storageBucket: "nexus-social-dce76.firebasestorage.app",
  messagingSenderId: "172694934932",
  appId: "1:172694934932:web:62bb46749dd0c062bfab81"
};

console.log("Nexus Social: Initializing Neural Database...");

// Initialize Firebase services
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

console.log("Nexus Social: Firestore Node Operational.");

// Export necessary members
export { db, auth, storage, googleProvider, serverTimestamp };