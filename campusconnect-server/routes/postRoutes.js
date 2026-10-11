const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getPosts, searchPosts, createPost, deletePost, toggleLike, addComment } = require("../controllers/postController");

const router = express.Router();

router.get("/search", authMiddleware, searchPosts); // before "/" so it isn't shadowed
router.get("/", authMiddleware, getPosts);
router.post("/", authMiddleware, createPost); // JSON body; media is uploaded beforehand via /api/media/upload
router.delete("/:id", authMiddleware, deletePost);
router.patch("/:id/like", authMiddleware, toggleLike);
router.post("/:id/comment", authMiddleware, addComment);

module.exports = router;
