import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Paper, Button } from "@mui/material";
import Navbar from "../components/Navbar/Navbar";
import NotificationWidget from "../components/NotificationWidget/NotificationWidget";
import { getNotifications, markAllAsRead } from "../services/notificationService";
import { setNotifications, markAllRead } from "../redux/notificationSlice";

export default function Notifications() {
  const dispatch = useDispatch();
  const unreadCount = useSelector((s) => s.notifications.unreadCount);

  useEffect(() => {
    getNotifications().then((data) => dispatch(setNotifications(data)));
  }, [dispatch]);

  function handleMarkAll() {
    markAllAsRead().then(() => dispatch(markAllRead()));
  }

  return (
    <Box>
      <Navbar />
      <Box maxWidth={640} mx="auto" px={2} py={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={700}>Notifications</Typography>
          {unreadCount > 0 && <Button size="small" onClick={handleMarkAll}>Mark all as read</Button>}
        </Box>
        <Paper variant="outlined" sx={{ borderRadius: 3 }}>
          <NotificationWidget />
        </Paper>
      </Box>
    </Box>
  );
}
