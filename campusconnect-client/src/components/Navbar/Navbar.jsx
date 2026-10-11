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
      display="flex" alignItems="center" justifyContent="space-between" px={{ xs: 2, md: 4 }} py={1.2}
      bgcolor={mode === "light" ? "rgba(255, 255, 255, 0.82)" : "rgba(11, 14, 22, 0.82)"}
      borderBottom="1px solid" borderColor="divider"
      position="sticky" top={0} zIndex={100}
      sx={{
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        transform: "translateZ(0)",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        sx={{ cursor: "pointer", userSelect: "none" }}
        onClick={() => navigate("/home")}
      >
        <Typography
          variant="h6" fontWeight={800} sx={{
            letterSpacing: "-0.03em",
            fontSize: "1.18rem",
            background: mode === "light"
              ? "linear-gradient(135deg, #4338CA 0%, #0891B2 100%)"
              : "linear-gradient(135deg, #818CF8 0%, #22D3EE 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          CampusConnect
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={handleSearchClick}
        display={{ xs: "none", sm: "flex" }} alignItems="center" gap={1}
        bgcolor={mode === "light" ? "rgba(241, 245, 249, 0.7)" : "rgba(255, 255, 255, 0.04)"}
        border="1px solid" borderColor="divider"
        borderRadius={2.5} pl={1.5} pr={1} py={0.4} width={{ sm: 260, md: 360 }}
        sx={{
          transition: "all 140ms ease",
          "&:focus-within": {
            borderColor: "primary.main",
            boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.12)",
            bgcolor: mode === "light" ? "#fff" : "rgba(255, 255, 255, 0.06)",
          },
        }}
      >
        <Search sx={{ fontSize: 18, color: "text.secondary" }} />
        <InputBase
          placeholder="Search thoughts, doubts, peers…"
          fullWidth
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearchSubmit}
          sx={{ fontSize: "0.86rem", color: "text.primary" }}
        />
        <Box
          component="kbd"
          sx={{
            px: 0.7,
            py: 0.2,
            fontSize: "0.68rem",
            fontWeight: 700,
            borderRadius: 1,
            bgcolor: "action.hover",
            border: "1px solid",
            borderColor: "divider",
            color: "text.secondary",
            fontFamily: "monospace",
          }}
        >
          /
        </Box>
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
