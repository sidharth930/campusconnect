import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box, IconButton, InputBase, Typography, Badge, Menu, MenuItem, Avatar, Popover, Grow, Tooltip,
} from "@mui/material";
import { Search, DarkMode, LightMode, Notifications as NotificationsIcon, ArrowDropDown, ChatBubbleOutline } from "@mui/icons-material";
import NotificationWidget from "../NotificationWidget/NotificationWidget";
import ChatDrawer from "../ChatDrawer/ChatDrawer";
import { useThemeMode } from "../../ThemeModeContext";
import { logout } from "../../redux/authSlice";
import { openAvatarModal } from "../../redux/uiSlice";
import { setNotifications, addNotification, markAllRead } from "../../redux/notificationSlice";
import ClickableAvatar from "../ClickableAvatar/ClickableAvatar";
import VerifiedBadge from "../VerifiedBadge/VerifiedBadge";
import { addPost } from "../../redux/postSlice";
import { connectSocket, disconnectSocket } from "../../socket/socket";
import { getNotifications, markAllAsRead } from "../../services/notificationService";
import { ROLE_COLORS } from "../../theme";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mode, toggleMode } = useThemeMode();
  const user = useSelector((s) => s.auth.user);
  const unreadCount = useSelector((s) => s.notifications.unreadCount);

  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [query, setQuery] = useState("");
  const [live, setLive] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const roleColor = ROLE_COLORS[user?.role] || ROLE_COLORS.student;

  useEffect(() => {
    if (!user?._id) return;
    const socket = connectSocket(user._id);

    socket.on("connect", () => setLive(true));
    socket.on("disconnect", () => setLive(false));
    socket.on("new-like", (n) => dispatch(addNotification(n)));
    socket.on("new-comment", (n) => dispatch(addNotification(n)));
    socket.on("new-connection", (n) => dispatch(addNotification(n)));
    socket.on("new-post", (post) => dispatch(addPost(post)));

    getNotifications().then((data) => dispatch(setNotifications(data))).catch(() => {});
    return () => disconnectSocket();
    // eslint-disable-next-line
  }, [user?._id]);

  function handleLogout() {
    disconnectSocket();
    dispatch(logout());
    navigate("/login");
  }

  function openNotifications(e) {
    setNotifAnchor(e.currentTarget);
    markAllAsRead().then(() => dispatch(markAllRead())).catch(() => {});
  }

  function handleSearchSubmit(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  function handleSearchClick(e) {
    e?.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <Box
      display="flex" alignItems="center" justifyContent="space-between" px={{ xs: 2, md: 4 }} py={1.5}
      bgcolor={mode === "light" ? "rgba(255, 255, 255, 0.88)" : "rgba(14, 20, 36, 0.88)"}
      borderBottom="1px solid" borderColor="divider"
      position="sticky" top={0} zIndex={100}
      sx={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        transform: "translateZ(0)",
      }}
    >
      <Typography
        variant="h6" fontWeight={800} sx={{
          cursor: "pointer",
          letterSpacing: "-0.03em",
          background: "linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          userSelect: "none",
        }}
        onClick={() => navigate("/home")}
      >
        CampusConnect
      </Typography>

      <Box
        component="form"
        onSubmit={handleSearchClick}
        display={{ xs: "none", sm: "flex" }} alignItems="center" gap={1}
        bgcolor={mode === "light" ? "#F1F5F9" : "rgba(255, 255, 255, 0.05)"}
        border="1px solid" borderColor="divider"
        borderRadius={3} pl={2} pr={0.7} py={0.4} width={{ sm: 260, md: 360 }}
        sx={{ transition: "all 180ms ease", "&:focus-within": { borderColor: "primary.main", boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.15)" } }}
      >
        <InputBase placeholder="Search thoughts, resources, doubts, peers…" fullWidth value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleSearchSubmit} sx={{ fontSize: "0.88rem" }} />
        <Tooltip title="Search">
          <IconButton size="small" type="submit" sx={{ color: "primary.main", "&:hover": { bgcolor: "primary.light" } }}>
            <Search fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box display="flex" alignItems="center" gap={1.5}>
        <Tooltip title={live ? "Live — WebSocket connected" : "Connecting…"}>
          <Box display="flex" alignItems="center" gap={0.75} px={1.2} py={0.5} borderRadius={10} bgcolor="action.hover" border="1px solid" borderColor="divider">
            <Box
              width={7} height={7} borderRadius="50%"
              bgcolor={live ? "#10B981" : "#94A3B8"}
              sx={live ? { animation: "pulseDot 1.6s infinite" } : undefined}
            />
            <Typography variant="caption" fontWeight={700} color="text.secondary">Live</Typography>
          </Box>
        </Tooltip>

        <Tooltip title={mode === "dark" ? "Light theme" : "Dark theme"}>
          <IconButton onClick={toggleMode} size="small">{mode === "dark" ? <LightMode fontSize="small" sx={{ color: "#F59E0B" }} /> : <DarkMode fontSize="small" />}</IconButton>
        </Tooltip>

        <Tooltip title="Messages">
          <IconButton onClick={() => setChatOpen(true)} size="small"><ChatBubbleOutline fontSize="small" /></IconButton>
        </Tooltip>
        <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />

        <IconButton onClick={openNotifications} size="small">
          <Badge badgeContent={unreadCount} color="error"><NotificationsIcon fontSize="small" /></Badge>
        </IconButton>
        <Popover
          open={Boolean(notifAnchor)} anchorEl={notifAnchor} onClose={() => setNotifAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          TransitionComponent={Grow}
        >
          <NotificationWidget />
        </Popover>

        <Box
          display="flex"
          alignItems="center"
          gap={1}
          sx={{
            p: 0.5,
            borderRadius: 2,
            transition: "background-color 150ms ease",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <ClickableAvatar
            user={user}
            size={34}
            sx={{ border: `2px solid ${roleColor}` }}
          />
          <Box
            display={{ xs: "none", md: "block" }}
            sx={{ cursor: "pointer" }}
            onClick={(e) => setProfileAnchor(e.currentTarget)}
          >
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography variant="body2" fontWeight={700} lineHeight={1.2}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <VerifiedBadge role={user?.role} size="small" />
            </Box>
            <Typography variant="caption" color="text.secondary" textTransform="capitalize" fontSize={11}>
              {user?.role}
            </Typography>
          </Box>
          <IconButton size="small" onClick={(e) => setProfileAnchor(e.currentTarget)}>
            <ArrowDropDown fontSize="small" sx={{ color: "text.secondary" }} />
          </IconButton>
        </Box>
        <Menu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={() => setProfileAnchor(null)}
          TransitionComponent={Grow}
        >
          <MenuItem
            onClick={() => {
              setProfileAnchor(null);
              dispatch(openAvatarModal({ user, editable: true }));
            }}
          >
            View Profile Photo
          </MenuItem>
          <MenuItem
            onClick={() => {
              setProfileAnchor(null);
              navigate(`/profile/${user._id}`);
            }}
          >
            My Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>Log Out</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
