const { redisClient } = require("../config/redis");
const Message = require("../models/Message");

/**
 * Real-Time Layer. userSocketMap (Redis hash: userId -> socketId) is used
 * both for notifications (likes/comments/connections) and now for the
 * Live Chat Drawer's direct messages.
 */
function initSocketServer(io) {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      socket.data.userId = userId;
      redisClient.hSet("userSocketMap", userId, socket.id);
      console.log(`Socket registered: user ${userId} -> ${socket.id}`);
    }

    /**
     * Chat drawer: client emits { to, text }. We persist the message,
     * then push it to the recipient's socket (if they're online) AND
     * echo it back to the sender's own socket, so every open tab for
     * either person stays in sync without an extra REST round-trip.
     */
    socket.on("send-message", async ({ to, text }) => {
      try {
        const from = socket.data.userId;
        if (!from || !to || !text?.trim()) return;

        const message = await Message.create({ senderId: from, recipientId: to, text: text.trim() });

        const recipientSocketId = await redisClient.hGet("userSocketMap", to.toString());
        if (recipientSocketId) io.to(recipientSocketId).emit("receive-message", message);

        const senderSocketId = await redisClient.hGet("userSocketMap", from.toString());
        if (senderSocketId) io.to(senderSocketId).emit("receive-message", message);
      } catch (err) {
        console.error("send-message error:", err.message);
      }
    });

    socket.on("disconnect", async () => {
      if (userId) {
        const stored = await redisClient.hGet("userSocketMap", userId);
        if (stored === socket.id) await redisClient.hDel("userSocketMap", userId);
      }
    });
  });
}

module.exports = initSocketServer;
