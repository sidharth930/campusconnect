const Notification = require("../models/Notification");

async function getNotifications(req, res, next) {
  try {
    const notifs = await Notification.find({ recipientId: req.user.id })
      .sort({ createdAt: -1 }).limit(30)
      .populate("senderId", "firstName lastName picturePath");
    res.status(200).json(notifs);
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user.id }, { read: true }, { new: true }
    );
    if (!notif) return res.status(404).json({ message: "Notification not found" });
    res.status(200).json(notif);
  } catch (err) {
    next(err);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    await Notification.updateMany({ recipientId: req.user.id, read: false }, { read: true });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
}

module.exports = { getNotifications, markAsRead, markAllAsRead };
