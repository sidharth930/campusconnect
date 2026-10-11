# CampusConnect — Server (v3: chat, decoupled media upload, live analytics)

## What's new in this pass

**1. Live Chat (`models/Message.js`, `socket/socketServer.js`, `routes/messageRoutes.js`)**
Real direct messaging over the existing Socket.io connection:
- Client emits `send-message` with `{ to, text }`
- Server persists it to MongoDB, then emits `receive-message` to both the
  recipient's socket (via the Redis `userSocketMap`) and back to the
  sender's own socket, so every open tab stays in sync
- `GET /api/messages/:friendId` fetches history for the chat drawer

**2. Decoupled media upload (`routes/mediaRoutes.js`, `controllers/mediaController.js`)**
`POST /api/media/upload` uploads one file to Cloudinary and returns its
URL — nothing else. This is what lets the frontend show a *real* upload
progress bar before the post is even submitted. `POST /api/posts` no
longer accepts multipart data; it takes plain JSON with the
already-uploaded `picturePath`/`mediaType`.

**3. Live profile analytics (`controllers/userController.js`, `controllers/postController.js`)**
- `viewedProfile` now increments for real — once per visit from someone
  other than the profile owner (`getUserById`)
- `impressions` increments once per like received on one of your posts
  (`toggleLike`)
These were static `0` fields before; they're real counters now.

**4. New User fields:** `linkedinUrl`, `portfolioUrl`, `location` — for
the profile card's "Social Profiles" section.

Everything from the previous version (atomic like/comment updates, post
search, RBAC, JWT/bcrypt, Redis caching) is unchanged.
