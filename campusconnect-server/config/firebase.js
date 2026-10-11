/**
 * Firebase Admin Configuration
 * Powers Firebase Cloud Storage and Firebase Authentication for CampusConnect.
 * 
 * To enable Firebase:
 * 1. Create a Firebase project at https://console.firebase.google.com/
 * 2. Go to Project Settings -> Service Accounts -> Generate new private key
 * 3. Place the serviceAccountKey.json in the server root OR configure env variables:
 *    - FIREBASE_PROJECT_ID
 *    - FIREBASE_CLIENT_EMAIL
 *    - FIREBASE_PRIVATE_KEY
 *    - FIREBASE_STORAGE_BUCKET
 */

let firebaseApp = null;
let firebaseBucket = null;

try {
  const admin = require("firebase-admin");
  const fs = require("fs");
  const path = require("path");

  const serviceAccountPath = path.join(__dirname, "..", "serviceAccountKey.json");

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`,
    });
    firebaseBucket = admin.storage().bucket();
    console.log("Firebase Admin initialized via serviceAccountKey.json");
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
    firebaseBucket = admin.storage().bucket();
    console.log("Firebase Admin initialized via environment variables");
  }
} catch (err) {
  // firebase-admin might not be installed or credentials not provided yet
  console.log("Firebase Admin optional integration ready (not initialized: " + err.message + ")");
}

module.exports = { firebaseApp, firebaseBucket };
