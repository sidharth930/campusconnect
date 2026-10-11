import api from "./api";

/**
 * Uploads one file to Cloudinary via the backend, reporting real progress
 * so the modal's progress bar reflects the actual upload, not a fake timer.
 */
export function uploadMedia(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);
  return api
    .post("/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) onProgress(Math.round((evt.loaded * 100) / evt.total));
      },
    })
    .then((r) => r.data); // { url, mediaType }
}
