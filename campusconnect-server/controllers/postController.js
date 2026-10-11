const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");
const { createAndEmit } = require("../services/notificationService");
const { redisClient } = require("../config/redis");

/** GET /api/posts — feed; ?userId= filters to one author's posts */
async function getPosts(req, res, next) {
  try {
    const filter = req.query.userId ? { userId: req.query.userId } : {};
    const posts = await Post.find(filter)
      .populate({
        path: "comments",
        populate: { path: "userId", select: "firstName lastName picturePath role" },
      })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
}

/** GET /api/posts/search?q=... — searches description, tags, postType, and author */
async function searchPosts(req, res, next) {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(200).json([]);
    const escapeRegex = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const terms = q.split(/\s+/).filter(Boolean).map(escapeRegex);
    const regexList = terms.map((t) => new RegExp(t, "i"));

    const posts = await Post.find({
      $or: [
        ...regexList.map((rgx) => ({ description: rgx })),
        ...regexList.map((rgx) => ({ tags: rgx })),
        ...regexList.map((rgx) => ({ postType: rgx })),
        ...regexList.map((rgx) => ({ firstName: rgx })),
        ...regexList.map((rgx) => ({ lastName: rgx })),
      ],
    })
      .populate({
        path: "comments",
        populate: { path: "userId", select: "firstName lastName picturePath role" },
      })
      .sort({ createdAt: -1 })
      .limit(30);
    res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/posts — creates the post record. Media is uploaded SEPARATELY
 * first via POST /api/media/upload (so the upload modal can show a real
 * progress bar before the user even submits); this endpoint just takes
 * the resulting URL. Accepts plain JSON, not multipart, for that reason.
 */
async function createPost(req, res, next) {
  try {
    const { description, postType, tags, picturePath, mediaType } = req.body;
    if (!description && !picturePath) {
      return res.status(400).json({ message: "Post needs text or media" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newPost = await Post.create({
      userId: user._id, firstName: user.firstName, lastName: user.lastName, role: user.role,
      userPicturePath: user.picturePath || "",
      postType, description: description || "",
      picturePath: picturePath || "", mediaType: mediaType || null,
      tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(",").map((t) => t.trim()).filter(Boolean) : []),
    });

    try {
      const io = req.app.get("io");
      if (io && user.friends?.length) {
        for (const friendId of user.friends) {
          const socketId = await redisClient.hGet("userSocketMap", friendId.toString());
          if (socketId) io.to(socketId).emit("new-post", newPost);
        }
      }
    } catch (socketErr) {
      console.warn("Socket broadcast error on post creation:", socketErr.message);
    }

    res.status(201).json(newPost);
  } catch (err) {
    next(err);
  }
}

async function deletePost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access Denied" });
    }
    await post.deleteOne();
    await Comment.deleteMany({ postId: post._id });
    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/posts/:id/like — toggles likes.<userId> with an ATOMIC
 * $set / $unset instead of load -> mutate -> save(). This matters: a
 * full document .save() re-validates every field on the post (userId,
 * firstName, postType, etc.), so a post missing any of those — e.g. one
 * inserted straight into MongoDB rather than through this API — would
 * fail validation and silently break the like button. An atomic update
 * only touches the one field being changed, so it can't fail that way.
 */
async function toggleLike(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const uid = req.user.id;
    const isLiked = post.likes?.get ? post.likes.get(uid) : post.likes?.[uid];

    const updated = await Post.findByIdAndUpdate(
      req.params.id,
      isLiked ? { $unset: { [`likes.${uid}`]: "" } } : { $set: { [`likes.${uid}`]: true } },
      { new: true, runValidators: false }
    );

    if (!isLiked && updated.userId.toString() !== uid) {
      await User.findByIdAndUpdate(updated.userId, { $inc: { impressions: 1 } });
      const io = req.app.get("io");
      await createAndEmit({ io, recipientId: updated.userId, senderId: uid, type: "like", postId: updated._id });
    }

    res.status(200).json({ updatedLikes: Object.fromEntries(updated.likes || []) });
  } catch (err) {
    next(err);
  }
}

/** POST /api/posts/:id/comment — also uses an atomic $push for the same reason as above */
async function addComment(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (!req.body.text || !req.body.text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const comment = await Comment.create({ postId: post._id, userId: req.user.id, text: req.body.text.trim() });
    await Post.findByIdAndUpdate(post._id, { $push: { comments: comment._id } }, { runValidators: false });

    if (post.userId && post.userId.toString() !== req.user.id) {
      const io = req.app.get("io");
      await createAndEmit({ io, recipientId: post.userId, senderId: req.user.id, type: "comment", postId: post._id });
    }

    const populated = await comment.populate("userId", "firstName lastName picturePath role");
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
}

module.exports = { getPosts, searchPosts, createPost, deletePost, toggleLike, addComment };
