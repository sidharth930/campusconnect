const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getConversation } = require("../controllers/messageController");

const router = express.Router();
router.get("/:friendId", authMiddleware, getConversation);

module.exports = router;
