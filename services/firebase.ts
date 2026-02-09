import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/**
 * ASM Nextgen Technical Campus - Firebase Configuration
 * For local development: Set VITE_USE_FIREBASE=false in .env.local
 * For production: Configure these values in Vercel environment variables
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// Check if Firebase should be used (disabled by default for local dev)
const shouldUseFirebase = import.meta.env.VITE_USE_FIREBASE === 'true';
const isConfigured = shouldUseFirebase && firebaseConfig.apiKey && firebaseConfig.projectId;

let dbInstance = null;

if (isConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    dbInstance = getFirestore(app);
    console.log("✅ ASM Nextgen: Firebase Cloud Sync Active.");
  } catch (error) {
    console.error("❌ ASM Nextgen: Firebase Initialization Failed:", error);
  }
} else {
  console.warn("⚠️ ASM Nextgen: Running in LOCAL MODE with mock data.");
}

export const db = dbInstance;
export const useFirebase = () => isConfigured && dbInstance !== null;