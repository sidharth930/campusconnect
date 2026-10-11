import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Drawer, Box, Typography, IconButton, Avatar, InputBase, List, ListItemButton,
  ListItemAvatar, ListItemText, Divider, Chip,
} from "@mui/material";
import { Close, ArrowBack, Send, WavingHandOutlined } from "@mui/icons-material";
import { getFriends } from "../../services/userService";
import { getConversation } from "../../services/messageService";
import { getSocket } from "../../socket/socket";
import { showError } from "../../redux/uiSlice";
import { getErrorMessage } from "../../services/api";
import { ROLE_COLORS } from "../../theme";
import ClickableAvatar from "../ClickableAvatar/ClickableAvatar";

/**
 * Sliding chat drawer — real-time messaging over the app's existing
 * Socket.io connection ("send-message" / "receive-message" events,
 * handled server-side in socket/socketServer.js).
 */
export default function ChatDrawer({ open, onClose, initialFriend = null }) {
  const dispatch = useDispatch();
  const currentUser = useSelector((s) => s.auth.user);

  const [friends, setFriends] = useState([]);
  const [activeFriend, setActiveFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!open || !currentUser?._id) return;
    getFriends(currentUser._id).then(setFriends).catch((err) => dispatch(showError(getErrorMessage(err))));
  }, [open, currentUser?._id]); // eslint-disable-line

  useEffect(() => {
    if (open && initialFriend && initialFriend._id) {
      openConversation(initialFriend);
    }
  }, [open, initialFriend]); // eslint-disable-line

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    function handleIncoming(message) {
      setActiveFriend((current) => {
        if (
          current &&
          (message.senderId === current._id || message.recipientId === current._id) &&
          (message.senderId === currentUser._id || message.recipientId === currentUser._id)
        ) {
          setMessages((prev) => [...prev, message]);
        }
        return current;
      });
    }
    socket.on("receive-message", handleIncoming);
    return () => socket.off("receive-message", handleIncoming);
  }, [currentUser?._id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function openConversation(friend) {
    setActiveFriend(friend);
    getConversation(friend._id).then(setMessages).catch((err) => dispatch(showError(getErrorMessage(err))));
  }

  function sendMessage() {
    const socket = getSocket();
    if (!socket || !draft.trim() || !activeFriend) return;
    socket.emit("send-message", { to: activeFriend._id, text: draft.trim() });
    setDraft("");
  }

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 360 } }}>
      <Box display="flex" alignItems="center" gap={1} p={2} borderBottom="1px solid" borderColor="divider">
        {activeFriend ? (
          <>
            <IconButton size="small" onClick={() => setActiveFriend(null)}><ArrowBack fontSize="small" /></IconButton>
            <ClickableAvatar user={activeFriend} size={32} />
            <Typography fontWeight={600}>{activeFriend.firstName} {activeFriend.lastName}</Typography>
          </>
        ) : (
          <Typography variant="h6" fontWeight={700} flex={1}>Messages</Typography>
        )}
        <Box flex={1} />
        <IconButton size="small" onClick={onClose}><Close fontSize="small" /></IconButton>
      </Box>

      {!activeFriend && (
        <List sx={{ overflowY: "auto" }}>
          {friends.length === 0 && (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={4} px={2}>
              Connect with people to start chatting with them here.
            </Typography>
          )}
          {friends.map((f) => {
            const color = ROLE_COLORS[f.role] || ROLE_COLORS.student;
            return (
              <ListItemButton key={f._id} onClick={() => openConversation(f)}>
                <ListItemAvatar>
                  <ClickableAvatar user={f} size={40} />
                </ListItemAvatar>
                <ListItemText primary={`${f.firstName} ${f.lastName}`} secondary={<Chip label={f.role} size="small" sx={{ height: 18, fontSize: "0.65rem" }} />} />
              </ListItemButton>
            );
          })}
        </List>
      )}

      {activeFriend && (
        <Box display="flex" flexDirection="column" flex={1} minHeight={0}>
          <Box ref={scrollRef} flex={1} overflow="auto" p={2} display="flex" flexDirection="column" gap={1}>
            {messages.map((m, i) => {
              const mine = m.senderId === currentUser._id;
              return (
                <Box key={m._id || i} alignSelf={mine ? "flex-end" : "flex-start"} maxWidth="75%">
                  <Box
                    px={1.5} py={1} borderRadius={3}
                    bgcolor={mine ? "primary.main" : "action.hover"}
                    color={mine ? "#fff" : "text.primary"}
                  >
                    <Typography variant="body2">{m.text}</Typography>
                  </Box>
                </Box>
              );
            })}
            {messages.length === 0 && (
              <Box display="flex" alignItems="center" justifyContent="center" gap={0.8} mt={4}>
                <WavingHandOutlined sx={{ fontSize: "1.1rem", color: "primary.main" }} />
                <Typography variant="body2" color="text.secondary">
                  Say hello to {activeFriend.firstName}
                </Typography>
              </Box>
            )}
          </Box>
          <Divider />
          <Box display="flex" gap={1} p={1.5} alignItems="center">
            <InputBase
              fullWidth placeholder="Type a message…" value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              sx={{ bgcolor: "action.hover", borderRadius: 4, px: 1.5, py: 0.75 }}
            />
            <IconButton color="primary" onClick={sendMessage}><Send fontSize="small" /></IconButton>
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
