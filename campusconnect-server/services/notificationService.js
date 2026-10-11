const Notification = require("../models/Notification");
const { redisClient } = require("../config/redis");

async function createAndEmit({ io, recipientId, senderId, type, postId }) {
  if (!recipientId || recipientId.toString() === senderId.toString()) return null;

  const notif = await Notification.create({ recipientId, senderId, type, postId });
  const populated = await notif.populate("senderId", "firstName lastName picturePath");

  const socketId = await redisClient.hGet("userSocketMap", recipientId.toString());
  if (socketId) io.to(socketId).emit(`new-${type}`, populated);
  return populated;
}

module.exports = { createAndEmit };
