const cloudinary = require("../config/cloudinary");

function uploadBuffer(fileBuffer, resourceType = "auto") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, folder: "campusconnect" },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(fileBuffer);
  });
}

module.exports = { uploadBuffer };
