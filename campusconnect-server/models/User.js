const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, minlength: 2, maxlength: 50, trim: true },
    lastName: { type: String, required: true, minlength: 2, maxlength: 50, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "alumni", "developer"], required: true },
    picturePath: { type: String, default: "" },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    batch: { type: String, default: "" },
    occupation: { type: String, default: "" },
    skills: [{ type: String }],
    githubUrl: { type: String, default: "" },
    linkedinUrl: { type: String, default: "" },
    portfolioUrl: { type: String, default: "" },
    location: { type: String, default: "" },
    viewedProfile: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
