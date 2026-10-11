import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Avatar, InputBase, Chip, IconButton, Button, Typography, useTheme, Grow, Tooltip,
} from "@mui/material";
import {
  Image as ImageIcon, Videocam, AttachFile, Mic, Close, Send, Forum, FilterList,
  AutoAwesome, LightbulbOutlined, MenuBookOutlined, HelpOutlineOutlined,
  RocketLaunchOutlined, SchoolOutlined, ExploreOutlined, WorkOutline,
} from "@mui/icons-material";
import Navbar from "../components/Navbar/Navbar";
import PostCard from "../components/PostCard/PostCard";
import SkeletonPostCard from "../components/SkeletonPostCard/SkeletonPostCard";
import TechFooter from "../components/TechFooter/TechFooter";
import ProfileSummaryCard from "../components/ProfileSummaryCard/ProfileSummaryCard";
import CampusAnnouncements from "../components/CampusAnnouncements/CampusAnnouncements";
import FriendSuggestions from "../components/FriendSuggestions/FriendSuggestions";
import UploadModal from "../components/UploadModal/UploadModal";
import ClickableAvatar from "../components/ClickableAvatar/ClickableAvatar";
import { getPosts, createPost } from "../services/postService";
import { getUser, getFriends } from "../services/userService";
import { setPosts, addPost, setPostsLoading } from "../redux/postSlice";
import { showError } from "../redux/uiSlice";
import { getErrorMessage } from "../services/api";
import { ROLE_COLORS } from "../theme";

const ROLE_POST_TYPES = {
  student: [
    { key: "general", label: "Thought", Icon: LightbulbOutlined },
    { key: "resource", label: "Resource", Icon: MenuBookOutlined },
    { key: "doubt", label: "Doubt", Icon: HelpOutlineOutlined },
    { key: "project", label: "Project", Icon: RocketLaunchOutlined },
    { key: "placement", label: "Placement", Icon: SchoolOutlined },
  ],
  alumni: [
    { key: "general", label: "Thought", Icon: LightbulbOutlined },
    { key: "advice", label: "Advice", Icon: ExploreOutlined },
    { key: "job", label: "Job", Icon: WorkOutline },
    { key: "resource", label: "Resource", Icon: MenuBookOutlined },
    { key: "placement", label: "Placement", Icon: SchoolOutlined },
  ],
  developer: [
    { key: "general", label: "Thought", Icon: LightbulbOutlined },
    { key: "project", label: "Project", Icon: RocketLaunchOutlined },
    { key: "resource", label: "Resource", Icon: MenuBookOutlined },
    { key: "doubt", label: "Doubt", Icon: HelpOutlineOutlined },
  ],
};

const ALL_FILTER_OPTIONS = [
  { key: "all", label: "All", color: "#6366F1", Icon: AutoAwesome },
  { key: "general", label: "Thoughts", color: "#6366F1", Icon: LightbulbOutlined },
  { key: "resource", label: "Resources", color: "#06B6D4", Icon: MenuBookOutlined },
  { key: "doubt", label: "Doubts", color: "#F43F5E", Icon: HelpOutlineOutlined },
  { key: "project", label: "Projects", color: "#10B981", Icon: RocketLaunchOutlined },
  { key: "placement", label: "Placements", color: "#F59E0B", Icon: SchoolOutlined },
];

const UPLOAD_BUTTONS = [
  { key: "image", label: "Add photo", accept: "image/*", Icon: ImageIcon, color: "#10B981" },
  { key: "video", label: "Add video", accept: "video/*", Icon: Videocam, color: "#3B82F6" },
  { key: "audio", label: "Add audio", accept: "audio/*", Icon: Mic, color: "#F59E0B" },
  { key: "file", label: "Attachment", accept: "*/*", Icon: AttachFile, color: "#8B5CF6" },
];

export default function Home() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const authUser = useSelector((s) => s.auth.user);
  const posts = useSelector((s) => s.posts.posts);
  const loading = useSelector((s) => s.posts.loading);
  const roleColor = ROLE_COLORS[authUser?.role] || theme.palette.primary.main;

  const [profile, setProfile] = useState(null);
  const [friendsCount, setFriendsCount] = useState(0);

  const [text, setText] = useState("");
  const [postType, setPostType] = useState("general");
  const [media, setMedia] = useState(null);
  const [posting, setPosting] = useState(false);
  const [feedFilter, setFeedFilter] = useState("all");
  const [activeUpload, setActiveUpload] = useState(null);

  const options = ROLE_POST_TYPES[authUser?.role] || ROLE_POST_TYPES.student;

  function loadProfile() {
    if (!authUser?._id) return;
    Promise.all([getUser(authUser._id), getFriends(authUser._id)])
      .then(([u, friends]) => { setProfile(u); setFriendsCount(friends.length); })
      .catch((err) => dispatch(showError(getErrorMessage(err))));
  }

  useEffect(loadProfile, [authUser?._id]); // eslint-disable-line

  useEffect(() => {
    dispatch(setPostsLoading(true));
    getPosts()
      .then((data) => dispatch(setPosts(data)))
      .catch((err) => dispatch(showError(getErrorMessage(err))))
      .finally(() => dispatch(setPostsLoading(false)));
    // eslint-disable-next-line
  }, []);

  async function handlePost() {
    if (!text.trim() && !media) return;
    setPosting(true);
    try {
      const newPost = await createPost({
        description: text, postType,
        picturePath: media?.url, mediaType: media?.mediaType,
      });
      dispatch(addPost(newPost));
      setText(""); setMedia(null);
    } catch (err) {
      dispatch(showError(getErrorMessage(err)));
    } finally {
      setPosting(false);
    }
  }

  const visiblePosts = feedFilter === "all" ? posts : posts.filter((p) => p.postType === feedFilter);
  const activeButton = UPLOAD_BUTTONS.find((b) => b.key === activeUpload);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        backgroundImage:
          theme.palette.mode === "light"
            ? "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.08), transparent 70%)"
            : "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.16), transparent 70%)",
        backgroundAttachment: "fixed",
      }}
    >
      <Navbar />

      <Box
        maxWidth={1220} mx="auto" px={{ xs: 1.5, sm: 2, md: 3 }} py={3.5}
        display="grid" gap={3}
        gridTemplateColumns={{ xs: "1fr", md: "270px 1fr", lg: "270px minmax(0,1fr) 300px" }}
      >
        {/* Left sidebar */}
        <Box display={{ xs: "none", md: "block" }}>
          <ProfileSummaryCard profile={profile} friendsCount={friendsCount} editable onChanged={loadProfile} />
        </Box>

        {/* Center: composer + feed */}
        <Box display="flex" flexDirection="column" gap={2.5} minWidth={0}>
          {/* Composer Box */}
          <Box
            bgcolor="background.paper"
            border={`1px solid ${theme.palette.divider}`}
            borderRadius={3.5}
            p={2.5}
            sx={{
              boxShadow:
                theme.palette.mode === "light"
                  ? "0 4px 20px -6px rgba(15, 23, 42, 0.06)"
                  : "0 8px 28px -10px rgba(0, 0, 0, 0.7)",
              animation: "fadeSlideUp 400ms ease-out both",
            }}
          >
            <Box display="flex" gap={1.5}>
              <ClickableAvatar
                user={authUser}
                size={44}
                sx={{
                  border: `2px solid ${roleColor}`,
                  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                }}
              />
              <InputBase
                placeholder="Share a thought, ask a doubt, or drop study resources…"
                fullWidth
                multiline
                minRows={2}
                value={text}
                onChange={(e) => setText(e.target.value)}
                sx={{
                  bgcolor: theme.palette.mode === "light" ? "#F1F5F9" : "rgba(255, 255, 255, 0.05)",
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 3,
                  px: 2,
                  py: 1.2,
                  fontSize: "0.95rem",
                  transition: "border-color 160ms, box-shadow 160ms",
                  "&:focus-within": {
                    borderColor: "primary.main",
                    boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.15)",
                  },
                }}
              />
            </Box>

            {media && (
              <Box position="relative" mt={2} borderRadius={3} overflow="hidden" border={`1px solid ${theme.palette.divider}`}>
                {media.mediaType === "video" ? (
                  <video src={media.url} controls style={{ width: "100%", maxHeight: 280, background: "#000" }} />
                ) : media.mediaType === "image" ? (
                  <img src={media.url} alt="attachment" style={{ width: "100%", maxHeight: 280, objectFit: "cover" }} />
                ) : (
                  <Box p={2} bgcolor="action.hover">
                    <Typography variant="body2">Attachment ready — {media.mediaType}</Typography>
                  </Box>
                )}
                <IconButton size="small" onClick={() => setMedia(null)} sx={{ position: "absolute", top: 8, right: 8, bgcolor: "rgba(0,0,0,0.7)", color: "#fff" }}>
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            )}

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} flexWrap="wrap" gap={1.5}>
              <Box display="flex" gap={1}>
                {UPLOAD_BUTTONS.map(({ key, label, Icon, color }) => (
                  <Tooltip key={key} title={label}>
                    <IconButton
                      size="small"
                      onClick={() => setActiveUpload(key)}
                      sx={{
                        bgcolor: `${color}14`,
                        color,
                        "&:hover": { bgcolor: `${color}28` },
                      }}
                    >
                      <Icon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ))}
              </Box>

              <Button
                variant="contained"
                disabled={posting || (!text.trim() && !media)}
                onClick={handlePost}
                endIcon={<Send fontSize="small" />}
                sx={{
                  background: "linear-gradient(135deg, #4F46E5, #06B6D4)",
                  fontWeight: 700,
                  px: 3,
                  py: 0.9,
                  borderRadius: 2.5,
                  "&:hover": {
                    background: "linear-gradient(135deg, #4338CA, #0891B2)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Post
              </Button>
            </Box>

            {/* Category pills */}
            <Box display="flex" gap={1} flexWrap="wrap" mt={2} pt={1.5} borderTop={`1px solid ${theme.palette.divider}`}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} alignSelf="center" mr={0.5}>
                Category:
              </Typography>
              {options.map(({ key, label, Icon: CatIcon }) => {
                const active = postType === key;
                return (
                  <Chip
                    key={key}
                    icon={CatIcon ? <CatIcon sx={{ fontSize: "15px !important", color: active ? "#fff !important" : "inherit" }} /> : undefined}
                    label={label}
                    size="small"
                    onClick={() => setPostType(key)}
                    sx={
                      active
                        ? {
                            bgcolor: "primary.main",
                            color: "#fff",
                            fontWeight: 700,
                            boxShadow: "0 2px 10px -2px rgba(99, 102, 241, 0.5)",
                            "& .MuiChip-icon": { ml: "7px", mr: "-2px" },
                          }
                        : {
                            bgcolor: "action.hover",
                            color: "text.primary",
                            border: `1px solid ${theme.palette.divider}`,
                            "&:hover": { bgcolor: "action.selected" },
                            "& .MuiChip-icon": { ml: "7px", mr: "-2px" },
                          }
                    }
                  />
                );
              })}
            </Box>
          </Box>

          {/* Filter Bar with Category Pills */}
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            flexWrap="wrap"
            px={0.5}
            sx={{ animation: "fadeSlideUp 400ms ease-out 80ms both" }}
          >
            <FilterList fontSize="small" sx={{ color: "text.secondary", mr: 0.5 }} />
            {ALL_FILTER_OPTIONS.map(({ key, label, color, Icon: FilterIcon }) => {
              const active = feedFilter === key;
              return (
                <Chip
                  key={key}
                  icon={FilterIcon ? <FilterIcon sx={{ fontSize: "15px !important", color: active ? `${color} !important` : `${color}cc !important` }} /> : undefined}
                  label={label}
                  size="small"
                  onClick={() => setFeedFilter(key)}
                  sx={
                    active
                      ? {
                          bgcolor: `${color}1A`,
                          color,
                          fontWeight: 700,
                          border: `1.5px solid ${color}`,
                          boxShadow: `0 2px 12px -3px ${color}55`,
                          "& .MuiChip-icon": { ml: "7px", mr: "-2px" },
                        }
                      : {
                          bgcolor: "background.paper",
                          color: "text.secondary",
                          border: `1px solid ${theme.palette.divider}`,
                          "&:hover": { bgcolor: "action.hover", color: "text.primary" },
                          "& .MuiChip-icon": { ml: "7px", mr: "-2px" },
                        }
                  }
                />
              );
            })}
          </Box>

          {loading && (
            <>
              <SkeletonPostCard /><SkeletonPostCard /><SkeletonPostCard />
            </>
          )}

          {!loading && visiblePosts.map((post) => (
            <Box
              key={post._id}
              sx={{
                contentVisibility: "auto",
                containIntrinsicSize: "0 340px",
              }}
            >
              <PostCard post={post} />
            </Box>
          ))}

          {!loading && visiblePosts.length === 0 && (
            <Box textAlign="center" py={8} sx={{ animation: "fadeSlideUp 400ms ease-out both" }}>
              <Forum sx={{ fontSize: 40, color: "text.secondary", mb: 1.5, opacity: 0.6 }} />
              <Typography color="text.secondary">
                {posts.length === 0 ? "No posts yet — be the first to share something." : `No "${feedFilter}" posts yet.`}
              </Typography>
            </Box>
          )}

          <TechFooter />
        </Box>

        {/* ---------------- Right: discovery widgets ---------------- */}
        <Box display={{ xs: "none", lg: "flex" }} flexDirection="column" gap={2}>
          <CampusAnnouncements />
          <FriendSuggestions />
        </Box>
      </Box>

      {activeButton && (
        <UploadModal
          open={Boolean(activeUpload)} onClose={() => setActiveUpload(null)}
          accept={activeButton.accept} label={activeButton.label}
          onUploaded={(url, mediaType) => setMedia({ url, mediaType })}
        />
      )}
    </Box>
  );
}
