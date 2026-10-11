const Message = require("../models/Message");

/** GET /api/messages/:friendId — conversation history between the logged-in user and friendId */
async function getConversation(req, res, next) {
  try {
    const me = req.user.id;
    const { friendId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: me, recipientId: friendId },
        { senderId: friendId, recipientId: me },
      ],
    }).sort({ createdAt: 1 }).limit(200);

    res.status(200).json(messages);
  } catch (err) {
    next(err);
  }
}

module.exports = { getConversation };
