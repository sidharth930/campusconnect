const { firebaseBucket } = require("../config/firebase");
const crypto = require("crypto");
const path = require("path");

/**
 * Uploads a file buffer to Firebase Cloud Storage and returns a public/download URL.
 * @param {Buffer} buffer - File buffer
 * @param {string} originalName - Original filename
 * @param {string} mimetype - MIME type
 * @returns {Promise<{ url: string, provider: string }>}
 */
async function uploadToFirebase(buffer, originalName = "upload", mimetype = "application/octet-stream") {
  if (!firebaseBucket) {
    throw new Error("Firebase Storage bucket is not configured. Please supply Firebase credentials.");
  }

  const ext = path.extname(originalName) || "";
  const randomName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`;
  const filePath = `campusconnect/${randomName}`;
  const file = firebaseBucket.file(filePath);

  await file.save(buffer, {
    metadata: {
      contentType: mimetype,
      metadata: {
        firebaseStorageDownloadTokens: randomName,
      },
    },
    resumable: false,
  });

  // Make the file publicly accessible or construct firebase download URL
  try {
    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${firebaseBucket.name}/${filePath}`;
    return { url: publicUrl, provider: "firebase" };
  } catch (pubErr) {
    // If bucket uniform access prevents makePublic, use download token URL format
    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseBucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${randomName}`;
    return { url: downloadUrl, provider: "firebase" };
  }
}

module.exports = { uploadToFirebase };
