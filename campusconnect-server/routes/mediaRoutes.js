const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { uploadMedia } = require("../controllers/mediaController");

const router = express.Router();
router.post("/upload", authMiddleware, upload.single("file"), uploadMedia);

module.exports = router;
