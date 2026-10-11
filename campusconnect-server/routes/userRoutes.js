const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getUsers, getUserById, searchUsers, updateUser, toggleFriend, getFriends,
} = require("../controllers/userController");

const router = express.Router();

router.get("/search", authMiddleware, searchUsers);
router.get("/", authMiddleware, getUsers);
router.get("/:id", authMiddleware, getUserById);
router.get("/:id/friends", authMiddleware, getFriends);
router.patch("/:id", authMiddleware, updateUser);
router.patch("/:id/:friendId", authMiddleware, toggleFriend);

module.exports = router;
