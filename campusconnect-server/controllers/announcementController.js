const Announcement = require("../models/Announcement");
const User = require("../models/User");

// Seed announcements if database has none
const INITIAL_ANNOUNCEMENTS = [
  {
    title: "Infosys Campus Recruitment Drive 2026",
    detail: "On-campus drive for final-year MCA & B.Tech students. Roles: Systems Engineer & Specialist Programmer. Bring 3 updated resumes and academic credentials.",
    category: "placement",
    link: "https://www.infosys.com/careers.html",
    deadline: "Deadline: Next Monday, 10:00 AM",
    authorName: "Ananya Verma (Alumni Coordinator)",
    authorRole: "alumni",
    pinned: true,
  },
  {
    title: "Mid-Semester Examination Schedule & Guidelines 2026",
    detail: "Official Academic Directorate circular regarding exam dates, hall ticket issuance, reporting timings, and strictly prohibited electronic devices. Read instructions thoroughly.",
    category: "notice",
    attachmentName: "Campus_MidSem_Exam_Schedule_2026.pdf",
    deadline: "Commencing: Nov 15, 2026",
    authorName: "Academic Dean & Alumni Advisory Board",
    authorRole: "alumni",
    pinned: true,
  },
  {
    title: "Annual Alumni-Student Hackathon 'CodeSprint 2026'",
    detail: "48-hour competitive innovation sprint with mentorship from alumni software engineers at Google, Amazon, and Microsoft. Over ₹1,50,000 in prizes.",
    category: "event",
    link: "https://devpost.com",
    deadline: "Event Date: Saturday, Nov 22, 2026",
    authorName: "Sanjey Dev (Tech Lead)",
    authorRole: "alumni",
  },
  {
    title: "Career & Placement Cell Advisory: Resume Screening Standards",
    detail: "Official placement advisory on ATS-friendly LaTeX formatting, verified public GitHub links, and GPA cutoffs required by top visiting software firms.",
    category: "advisory",
    attachmentName: "Placement_Cell_Resume_Advisory.pdf",
    deadline: "Mandatory Compliance",
    authorName: "Training & Placement Cell Alumni Panel",
    authorRole: "alumni",
  },
];

async function ensureSeedAnnouncements() {
  const count = await Announcement.countDocuments();
  if (count === 0) {
    // Find an alumni user or any user to associate
    const alumniUser = (await User.findOne({ role: "alumni" })) || (await User.findOne());
    if (alumniUser) {
      const seeded = INITIAL_ANNOUNCEMENTS.map((item) => ({
        ...item,
        author: alumniUser._id,
      }));
      await Announcement.insertMany(seeded);
    }
  }
}

/**
 * GET /api/announcements
 * Retrieve all campus announcements
 */
async function getAnnouncements(req, res, next) {
  try {
    await ensureSeedAnnouncements();
    const announcements = await Announcement.find()
      .populate("author", "firstName lastName picturePath role")
      .sort({ pinned: -1, createdAt: -1 });
    res.status(200).json(announcements);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/announcements
 * Create a new campus announcement.
 * Restricted to Alumni users (acting as administrative coordinators).
 */
async function createAnnouncement(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Administrative gate: only alumni can publish official announcements
    if (user.role !== "alumni") {
      return res.status(403).json({
        message: "Administrative privileges required: Only verified Alumni coordinators can publish official campus announcements.",
      });
    }

    const { title, detail, category, link, attachmentUrl, attachmentName, deadline, pinned } = req.body;
    if (!title || !detail) {
      return res.status(400).json({ message: "Title and announcement details are required." });
    }

    let cleanLink = (link || "").trim();
    if (cleanLink && !/^https?:\/\//i.test(cleanLink)) {
      cleanLink = `https://${cleanLink}`;
    }

    const newAnnouncement = await Announcement.create({
      title: title.trim(),
      detail: detail.trim(),
      category: category || "notice",
      link: cleanLink,
      attachmentUrl: attachmentUrl || "",
      attachmentName: attachmentName || "",
      deadline: (deadline || "").trim(),
      author: user._id,
      authorName: "Alumni Directorate",
      authorRole: user.role,
      pinned: Boolean(pinned),
    });

    const populated = await newAnnouncement.populate("author", "firstName lastName picturePath role");

    // Real-time broadcast via Socket.IO
    const io = req.app.get("io");
    if (io) {
      io.emit("new_announcement", populated);
    }

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/announcements/:id
 * Delete a campus announcement. Only Alumni or creator can delete.
 */
async function deleteAnnouncement(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });

    // Allow deletion if the user is an alumni or the author
    if (user.role !== "alumni" && String(announcement.author) !== String(user._id)) {
      return res.status(403).json({ message: "You are not authorized to delete this announcement." });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    const io = req.app.get("io");
    if (io) {
      io.emit("delete_announcement", req.params.id);
    }

    res.status(200).json({ message: "Announcement deleted successfully", id: req.params.id });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
};
