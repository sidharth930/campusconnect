const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userPicturePath: { type: String, default: "" },
    role: { type: String, enum: ["student", "alumni", "developer"] },
    postType: {
      type: String,
      enum: ["resource", "doubt", "job", "advice", "project", "placement", "general"],
      required: true,
    },
    description: { type: String, required: true, maxlength: 1000 },
    picturePath: { type: String, default: "" },
    mediaType: { type: String, enum: ["image", "video", null], default: null },
    likes: { type: Map, of: Boolean, default: {} },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
