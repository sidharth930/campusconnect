const fs = require("fs");
const path = require("path");
const { uploadBuffer } = require("../services/cloudinaryService");
const { uploadToFirebase } = require("../services/firebaseService");
const { firebaseBucket } = require("../config/firebase");

function detectKind(mimetype) {
  if (mimetype.startsWith("image")) return "image";
  if (mimetype.startsWith("video")) return "video";
  if (mimetype.startsWith("audio")) return "audio";
  return "file";
}

/**
 * POST /api/media/upload — uploads ONE file.
 * Supports:
 *  1. Firebase Cloud Storage (when configured)
 *  2. Cloudinary CDN (when configured)
 *  3. Resilient Local Storage Fallback (guarantees uploads work offline for viva & local development)
 */
async function uploadMedia(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file provided" });

    const kind = detectKind(req.file.mimetype);
    const provider = (process.env.STORAGE_PROVIDER || "").toLowerCase();

    // 1. Firebase Storage
    if ((provider === "firebase" || process.env.USE_FIREBASE === "true") && firebaseBucket) {
      try {
        const result = await uploadToFirebase(req.file.buffer, req.file.originalname, req.file.mimetype);
        return res.status(200).json({ url: result.url, mediaType: kind, provider: "firebase" });
      } catch (fbErr) {
        console.warn("Firebase upload failed, attempting fallback:", fbErr.message);
      }
    }

    // 2. Cloudinary
    if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        const resourceType = kind === "image" ? "image" : "auto";
        const result = await uploadBuffer(req.file.buffer, resourceType);
        return res.status(200).json({ url: result.secure_url, mediaType: kind, provider: "cloudinary" });
      } catch (cldErr) {
        console.warn("Cloudinary upload failed, attempting fallback:", cldErr.message);
      }
    }

    // 3. Local Disk Storage Fallback (viva demo & offline safe)
    const uploadsDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const ext = path.extname(req.file.originalname || "") || (kind === "image" ? ".jpg" : ".bin");
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const targetPath = path.join(uploadsDir, filename);
    fs.writeFileSync(targetPath, req.file.buffer);

    const host = req.get("host");
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/${filename}`;

    return res.status(200).json({ url: fileUrl, mediaType: kind, provider: "local" });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadMedia };
