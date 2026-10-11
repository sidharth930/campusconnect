/**
 * Optional Client-Side Firebase Integration
 * 
 * If you want to use Firebase directly in the client (e.g. Firebase Auth or Firebase Storage):
 * 1. Install firebase: npm install firebase
 * 2. Fill in your project config below or in .env (VITE_FIREBASE_API_KEY, etc.)
 */

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

let app = null;

export function getFirebaseApp() {
  if (!app && firebaseConfig.apiKey) {
    try {
      // Dynamic import or initialize if needed
      console.log("Firebase client config loaded");
    } catch (e) {
      console.warn("Firebase client init warning:", e);
    }
  }
  return app;
}
