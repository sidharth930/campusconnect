const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");

const router = express.Router();

router.get("/", getAnnouncements);
router.post("/", authMiddleware, createAnnouncement);
router.delete("/:id", authMiddleware, deleteAnnouncement);

module.exports = router;
