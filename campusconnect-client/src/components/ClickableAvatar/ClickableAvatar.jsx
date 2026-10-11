import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Tooltip, Box } from "@mui/material";
import { openAvatarModal } from "../../redux/uiSlice";
import { ROLE_COLORS } from "../../theme";

/**
 * ClickableAvatar — Standardized, interactive user avatar across CampusConnect.
 *
 * Automatically wires up:
 * - Click-to-enlarge DP preview modal (AvatarPreviewModal)
 * - Micro-interactions (hover scale, ring glow, pointer cursor)
 * - Accessible tooltips
 * - Support for custom onClick override (with stopPropagation)
 */
export default function ClickableAvatar({
  user,
  size = 40,
  sx = {},
  onClick,
  tooltip,
  children,
  ...props
}) {
  const dispatch = useDispatch();
  const currentUser = useSelector((s) => s.auth.user);

  if (!user && !children) {
    return <Avatar sx={{ width: size, height: size, ...sx }} {...props} />;
  }

  const isMe =
    Boolean(currentUser && user && (currentUser._id === user._id || currentUser._id === user.id));
  const role = user?.role || "student";
  const roleColor = ROLE_COLORS[role] || "#4F46E5";
  const photoSrc = user?.picturePath || user?.userPicturePath || "";
  const initials =
    user?.firstName || user?.lastName
      ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
      : typeof children === "string"
      ? children
      : "?";

  const defaultTooltip = isMe
    ? "Click to view or change profile photo"
    : `Click to view ${user?.firstName ? `${user.firstName}'s` : ""} photo`;

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(e);
      return;
    }
    dispatch(openAvatarModal({ user, editable: isMe }));
  };

  return (
    <Tooltip title={tooltip !== undefined ? tooltip : defaultTooltip} arrow enterDelay={400}>
      <Box
        component="span"
        display="inline-flex"
        sx={{
          borderRadius: "50%",
          cursor: "pointer",
          transition: "transform 0.18s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.18s ease",
          "&:hover": {
            transform: "scale(1.08)",
            filter: "brightness(1.05)",
          },
          "&:active": {
            transform: "scale(0.96)",
          },
        }}
        onClick={handleClick}
      >
        <Avatar
          src={photoSrc}
          sx={{
            width: size,
            height: size,
            bgcolor: `${roleColor}22`,
            color: roleColor,
            fontWeight: 700,
            fontSize: Math.max(12, Math.round(size * 0.38)),
            border: `2px solid ${roleColor}`,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            ...sx,
          }}
          {...props}
        >
          {children || initials}
        </Avatar>
      </Box>
    </Tooltip>
  );
}
