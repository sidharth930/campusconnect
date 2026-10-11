import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Avatar, Chip, IconButton, Tooltip } from "@mui/material";
import { PersonAddAlt1, PersonRemoveAlt1 } from "@mui/icons-material";
import ClickableAvatar from "../ClickableAvatar/ClickableAvatar";
import VerifiedBadge from "../VerifiedBadge/VerifiedBadge";
import { toggleFriend } from "../../services/userService";
import { updateUserFriends } from "../../redux/authSlice";
import { showError } from "../../redux/uiSlice";
import { getErrorMessage } from "../../services/api";
import { ROLE_COLORS } from "../../theme";

const LABELS = { student: "Student", alumni: "Alumni", developer: "Developer" };

export default function UserCard({ user, connected, onChanged }) {
  const dispatch = useDispatch();
  const currentUser = useSelector((s) => s.auth.user);
  const navigate = useNavigate();
  const color = ROLE_COLORS[user.role] || ROLE_COLORS.student;
  const [busy, setBusy] = useState(false);

  async function handleToggle(e) {
    e.stopPropagation();
    setBusy(true);
    try {
      const data = await toggleFriend(currentUser._id, user._id);
      if (data?.friends) dispatch(updateUserFriends(data.friends));
      onChanged?.();
    } catch (err) {
      dispatch(showError(getErrorMessage(err)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box
      display="flex" alignItems="center" gap={1.5} p={1.25} borderRadius={3}
      sx={{ cursor: "pointer", transition: "all 150ms ease", "&:hover": { bgcolor: "action.hover", transform: "translateX(2px)" } }}
      onClick={() => navigate(`/profile/${user._id}`)}
    >
      <ClickableAvatar
        user={user}
        size={42}
        sx={{
          border: `2px solid ${color}`,
        }}
      />
      <Box flex={1} minWidth={0}>
        <Box display="flex" alignItems="center" gap={0.6}>
          <Typography fontWeight={700} fontSize="0.92rem" noWrap>{user.firstName} {user.lastName}</Typography>
          <VerifiedBadge role={user.role} size="small" />
        </Box>
        <Chip label={LABELS[user.role]} size="small" sx={{ bgcolor: `${color}18`, color, fontSize: "0.68rem", fontWeight: 700, height: 20, border: `1px solid ${color}33`, mt: 0.2 }} />
        {user.batch && <Typography variant="caption" color="text.secondary" display="block" noWrap>{user.batch}</Typography>}
      </Box>
      {user._id !== currentUser?._id && (
        <Tooltip title={connected ? "Remove connection" : "Connect"}>
          <span>
            <IconButton
              size="small" onClick={handleToggle} disabled={busy}
              sx={{
                bgcolor: connected ? "rgba(244, 63, 94, 0.1)" : "rgba(99, 102, 241, 0.1)",
                color: connected ? "error.main" : "primary.main",
                "&:hover": { bgcolor: connected ? "rgba(244, 63, 94, 0.2)" : "rgba(99, 102, 241, 0.2)" },
              }}
            >
              {connected ? <PersonRemoveAlt1 fontSize="small" /> : <PersonAddAlt1 fontSize="small" />}
            </IconButton>
          </span>
        </Tooltip>
      )}
    </Box>
  );
}
