const User = require("../models/User");
const { redisClient } = require("../config/redis");
const { createAndEmit } = require("../services/notificationService");

const PROFILE_CACHE_TTL = 60;

async function getUserById(req, res, next) {
  try {
    // "Who's viewed your profile" — only counts visits from someone else,
    // and invalidates the cache so the owner sees the updated count soon after.
    if (req.user?.id && req.user.id !== req.params.id) {
      await User.findByIdAndUpdate(req.params.id, { $inc: { viewedProfile: 1 } });
      await redisClient.del(`user:${req.params.id}`);
    }

    const cacheKey = `user:${req.params.id}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return res.status(200).json(JSON.parse(cached));

    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    await redisClient.setEx(cacheKey, PROFILE_CACHE_TTL, JSON.stringify(user));
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

async function getUsers(req, res, next) {
  try {
    const users = await User.find().select("-password").limit(50);
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}

async function searchUsers(req, res, next) {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(200).json([]);
    const escapeRegex = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const terms = q.split(/\s+/).filter(Boolean).map(escapeRegex);
    const regexList = terms.map((t) => new RegExp(t, "i"));

    const users = await User.find({
      $or: [
        ...regexList.map((rgx) => ({ firstName: rgx })),
        ...regexList.map((rgx) => ({ lastName: rgx })),
        ...regexList.map((rgx) => ({ batch: rgx })),
        ...regexList.map((rgx) => ({ skills: rgx })),
        ...regexList.map((rgx) => ({ occupation: rgx })),
        ...regexList.map((rgx) => ({ location: rgx })),
      ],
    }).select("-password").limit(25);
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Access Denied" });
    }
    const allowed = ["batch", "occupation", "skills", "githubUrl", "linkedinUrl", "portfolioUrl", "location", "picturePath"];
    const updates = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select("-password");
    await redisClient.del(`user:${req.params.id}`);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/users/:id/:friendId — toggle connection.
 * Guards against a friendId that doesn't resolve to a real user (e.g. a
 * post authored by test data with no matching account) with a clear
 * 404 instead of a silent failure.
 */
async function toggleFriend(req, res, next) {
  try {
    const { id, friendId } = req.params;
    if (req.user?.id && req.user.id !== id) {
      return res.status(403).json({ message: "Access Denied: You can only modify your own connections" });
    }
    if (id === friendId) {
      return res.status(400).json({ message: "You can't connect with yourself" });
    }

    const user = await User.findById(id);
    const friend = await User.findById(friendId);
    if (!user) return res.status(404).json({ message: "Your account could not be found" });
    if (!friend) return res.status(404).json({ message: "That user no longer exists" });

    const alreadyConnected = user.friends.some((f) => f.toString() === friendId);

    if (alreadyConnected) {
      user.friends = user.friends.filter((f) => f.toString() !== friendId);
      friend.friends = friend.friends.filter((f) => f.toString() !== id);
    } else {
      user.friends.push(friendId);
      friend.friends.push(id);
    }

    await user.save();
    await friend.save();
    await redisClient.del(`user:${id}`);
    await redisClient.del(`user:${friendId}`);

    if (!alreadyConnected) {
      const io = req.app.get("io");
      await createAndEmit({ io, recipientId: friendId, senderId: id, type: "connection", postId: null });
    }

    const updatedFriends = await Promise.all(
      user.friends.map((fid) => User.findById(fid).select("-password"))
    );
    res.status(200).json({ connected: !alreadyConnected, friends: updatedFriends });
  } catch (err) {
    next(err);
  }
}

async function getFriends(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const friends = await Promise.all(
      user.friends.map((fid) => User.findById(fid).select("-password"))
    );
    res.status(200).json(friends.filter(Boolean));
  } catch (err) {
    next(err);
  }
}

module.exports = { getUserById, getUsers, searchUsers, updateUser, toggleFriend, getFriends };
