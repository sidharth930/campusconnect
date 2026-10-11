# CampusConnect — Client (v4: 3-column dashboard, chat, upload modals, skeletons)

## What's new

**1. Three-column dashboard layout** (`pages/Home.jsx`, `pages/Profile.jsx`)
- Left: `ProfileSummaryCard` — avatar, name, connection count, live
  "who's viewed your profile" / "impressions" counters, and an editable
  Social Profiles list (GitHub/LinkedIn/Portfolio)
- Center: composer with a gradient Post button + the feed
- Right: `CampusAnnouncements` (placement drives / events) and
  `FriendSuggestions` (real users you're not yet connected to)
- Collapses to a single column below `md`, drops the right column below `lg`

**2. Live Chat Drawer** (`components/ChatDrawer`)
Opens from the new chat icon in the navbar. Lists your connections, pick
one to open a real-time conversation — sends/receives over the same
Socket.io connection already used for notifications. Persisted server-side,
so history survives a refresh.

**3. Upload modals with real progress** (`components/UploadModal`)
The composer's Image/Video/Audio/Attachment buttons each open a modal
that uploads immediately via `services/mediaService.js`, with a
`LinearProgress` bar driven by axios's actual `onUploadProgress` — not a
fake timer. The returned Cloudinary URL attaches to the post on submit.

**4. Skeleton loaders** (`components/SkeletonPostCard`, `ProfileSummaryCard`)
Animated placeholder cards replace the old spinner while the feed and
profile data load from MongoDB Atlas — prevents layout shift.

**5. Dark/light mode** was already fully dynamic (MUI `ThemeProvider` +
`themeSettings(mode)` swapping the whole palette) — unchanged, confirmed
working as part of this pass.

## Run it

Same as always:
```bash
npm install
npm run dev
```

Needs the matching `campusconnect-server` v3 running — the post-creation
flow changed (JSON instead of multipart), so an old server won't accept
posts from this client.
