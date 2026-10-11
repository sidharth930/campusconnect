const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    detail: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["placement", "notice", "event", "advisory"],
      default: "notice",
      required: true,
    },
    // Direct link to the actual position, application portal, or event registration
    link: { type: String, trim: true, default: "" },
    // Uploaded PDF circular or advisory document
    attachmentUrl: { type: String, default: "" },
    attachmentName: { type: String, default: "" },
    deadline: { type: String, default: "" },
    tags: [{ type: String }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
    authorRole: { type: String, default: "alumni" },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", AnnouncementSchema);
