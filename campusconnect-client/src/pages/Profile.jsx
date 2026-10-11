import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Paper, Button, Avatar, Grow, useTheme } from "@mui/material";
import { PersonRemoveAlt1, PersonAddAlt1, ChatBubbleOutline } from "@mui/icons-material";
import Navbar from "../components/Navbar/Navbar";
import PostCard from "../components/PostCard/PostCard";
import SkeletonPostCard from "../components/SkeletonPostCard/SkeletonPostCard";
import ProfileSummaryCard from "../components/ProfileSummaryCard/ProfileSummaryCard";
import ClickableAvatar from "../components/ClickableAvatar/ClickableAvatar";
import ChatDrawer from "../components/ChatDrawer/ChatDrawer";
import { getUser, getFriends, toggleFriend } from "../services/userService";
import { getPosts } from "../services/postService";
import { setProfile, setFriends, setUserLoading } from "../redux/userSlice";
import { setPosts } from "../redux/postSlice";
import { updateUserFriends } from "../redux/authSlice";
import { showError } from "../redux/uiSlice";
import { getErrorMessage } from "../services/api";

export default function Profile() {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((s) => s.auth.user);
  const profile = useSelector((s) => s.userState.profile);
  const friends = useSelector((s) => s.userState.friends);
  const posts = useSelector((s) => s.posts.posts);
  const loading = useSelector((s) => s.userState.loading);

  const [connecting, setConnecting] = useState(false);
  const [chatFriend, setChatFriend] = useState(null);

  function loadAll() {
    dispatch(setUserLoading(true));
    Promise.all([getUser(id), getFriends(id), getPosts(id)])
      .then(([userData, friendData, postData]) => {
        dispatch(setProfile(userData));
        dispatch(setFriends(friendData));
        dispatch(setPosts(postData));
      })
      .catch((err) => dispatch(showError(getErrorMessage(err))))
      .finally(() => dispatch(setUserLoading(false)));
  }

  useEffect(loadAll, [id]); // eslint-disable-line

  async function handleRemove(friendId) {
    try {
      const data = await toggleFriend(currentUser._id, friendId);
      if (data?.friends) dispatch(updateUserFriends(data.friends));
      loadAll();
    } catch (err) {
      dispatch(showError(getErrorMessage(err)));
    }
  }

  async function handleConnectToggle() {
    if (!currentUser?._id || !id) return;
    setConnecting(true);
    try {
      const data = await toggleFriend(currentUser._id, id);
      if (data?.friends) dispatch(updateUserFriends(data.friends));
      loadAll();
    } catch (err) {
      dispatch(showError(getErrorMessage(err)));
    } finally {
      setConnecting(false);
    }
  }

  const isMe = currentUser?._id === id;
  const isConnected = currentUser?.friends?.some((f) => (f._id || f) === id);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        backgroundImage: (theme) =>
          theme.palette.mode === "light"
            ? "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.08), transparent 70%)"
            : "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.16), transparent 70%)",
        backgroundAttachment: "fixed",
      }}
    >
      <Navbar />
      <Box maxWidth={1060} mx="auto" px={2} py={4} display="flex" gap={3} flexWrap="wrap">
        <Box flexBasis={280} display="flex" flexDirection="column" gap={2}>
          <ProfileSummaryCard profile={profile} friendsCount={friends.length} editable={isMe} onChanged={loadAll} />

          {!isMe && profile && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, display: "flex", gap: 1 }}>
              <Button
                variant={isConnected ? "outlined" : "contained"}
                color={isConnected ? "error" : "primary"}
                fullWidth
                size="small"
                startIcon={isConnected ? <PersonRemoveAlt1 fontSize="small" /> : <PersonAddAlt1 fontSize="small" />}
                onClick={handleConnectToggle}
                disabled={connecting}
                sx={{ borderRadius: 2.5, fontWeight: 700 }}
              >
                {isConnected ? "Disconnect" : "Connect"}
              </Button>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                size="small"
                startIcon={<ChatBubbleOutline fontSize="small" />}
                onClick={() => setChatFriend(profile)}
                sx={{ borderRadius: 2.5, fontWeight: 700 }}
              >
                Message
              </Button>
            </Paper>
          )}

          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">Connections</Typography>
            <Box mt={1.5} display="flex" flexDirection="column" gap={1.5}>
              {friends.length === 0 && <Typography variant="body2" color="text.secondary">No connections yet.</Typography>}
              {friends.map((f) => (
                <Box key={f._id} display="flex" alignItems="center" gap={1.5}>
                  <ClickableAvatar user={f} size={34} />
                  <Typography
                    variant="body2"
                    flex={1}
                    noWrap
                    sx={{
                      cursor: "pointer",
                      "&:hover": { color: "primary.main", textDecoration: "underline" },
                    }}
                    onClick={() => navigate(`/profile/${f._id}`)}
                  >
                    {f.firstName} {f.lastName}
                  </Typography>
                  {isMe && f._id !== currentUser?._id && (
                    <Button size="small" color="error" startIcon={<PersonRemoveAlt1 fontSize="small" />} onClick={() => handleRemove(f._id)}>
                      Remove
                    </Button>
                  )}
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        <Box flex={1} minWidth={300} display="flex" flexDirection="column" gap={2}>
          <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">Posts</Typography>
          {loading && (<><SkeletonPostCard /><SkeletonPostCard /></>)}
          {!loading && posts.length === 0 && <Typography variant="body2" color="text.secondary">No posts yet.</Typography>}
          {!loading && posts.map((post, i) => (
            <Grow in key={post._id} timeout={300 + Math.min(i, 6) * 80}>
              <Box><PostCard post={post} /></Box>
            </Grow>
          ))}
        </Box>
      </Box>
      <ChatDrawer open={Boolean(chatFriend)} onClose={() => setChatFriend(null)} initialFriend={chatFriend} />
    </Box>
  );
}
