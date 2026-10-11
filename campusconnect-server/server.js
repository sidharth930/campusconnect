require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const initSocketServer = require("./socket/socketServer");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const announcementRoutes = require("./routes/announcementRoutes");

const app = express();
const server = http.createServer(app);

// Allow explicitly configured origins plus any local dev origin on localhost / 127.0.0.1
const configuredOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((s) => s.trim())
  : [];

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // Postman, mobile, same-origin, curl
  if (configuredOrigins.includes(origin)) return true;
  // Match localhost or 127.0.0.1 on any port (http or https)
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return false;
};

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, isAllowedOrigin(origin));
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  },
});
app.set("io", io);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked origin: ${origin}`));
      }
    },
    credentials: true,
  })
);
app.use(morgan("common"));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/announcements", announcementRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "CampusConnect API" }));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

(async function start() {
  await connectDB();
  await connectRedis();
  initSocketServer(io);
  server.listen(PORT, () => console.log(`CampusConnect API running on port ${PORT}`));
})();

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err?.message || err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err?.message || err);
});

