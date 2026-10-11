import React from "react";
import { useSelector } from "react-redux";
import { List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Typography, Box, Fade } from "@mui/material";
import ClickableAvatar from "../ClickableAvatar/ClickableAvatar";

const VERB = { like: "liked your post", comment: "commented on your post", connection: "connected with you" };

export default function NotificationWidget() {
  const items = useSelector((s) => s.notifications.items);

  if (items.length === 0) {
    return (
      <Box p={3} textAlign="center" width={300}>
        <Typography variant="body2" color="text.secondary">
          No notifications yet — real-time updates will appear here.
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: "100%", maxWidth: 360 }}>
      {items.map((n, i) => (
        <Fade in key={n._id} timeout={300 + Math.min(i, 6) * 60}>
          <Box>
            <ListItem sx={{ bgcolor: n.read ? "transparent" : "action.hover" }}>
              <ListItemAvatar>
                <ClickableAvatar user={n.senderId} size={38} />
              </ListItemAvatar>
              <ListItemText
                primary={`${n.senderId?.firstName || "Someone"} ${VERB[n.type] || "interacted with your post"}`}
                secondary={new Date(n.createdAt).toLocaleString()}
              />
            </ListItem>
            <Divider component="li" />
          </Box>
        </Fade>
      ))}
    </List>
  );
}
