import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  useTheme,
  Tooltip,
} from "@mui/material";
import {
  FavoriteBorder,
  Favorite,
  ChatBubbleOutline,
  PersonAddAlt1,
  PersonRemoveAlt1,
  DeleteOutline,
  PlayCircleOutline,
  ImageOutlined,
} from "@mui/icons-material";
import CommentSection from "../CommentSection/CommentSection";
import ClickableAvatar from "../ClickableAvatar/ClickableAvatar";
import VerifiedBadge from "../VerifiedBadge/VerifiedBadge";
import { toggleLike, deletePost } from "../../services/postService";
import { toggleFriend } from "../../services/userService";
import { updatePost, removePost } from "../../redux/postSlice";
import { updateUserFriends } from "../../redux/authSlice";
import { showError } from "../../redux/uiSlice";
import { getErrorMessage } from "../../services/api";
import { formatDate } from "../../utils/format";
import { ROLE_COLORS, POST_TYPE_CONFIG } from "../../theme";

export default function PostCard({ post }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const currentUser = useSelector((s) => s.auth.user);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [pulsing, setPulsing] = useState(false);
  const [busy, setBusy] = useState(false);

  React.useEffect(() => {
    if (post.comments) setComments(post.comments);
  }, [post.comments]);

  const authorId = typeof post.userId === "object" ? post.userId?._id : post.userId;
  const isLiked = Boolean(post.likes?.[currentUser?._id]);
  const likeCount = post.likes ? Object.keys(post.likes).length : 0;
  const isMe = authorId === currentUser?._id;
  const isConnected = currentUser?.friends?.some((f) => (f._id || f) === authorId);
  const hasAuthor = Boolean(post.firstName);
  const roleColor = ROLE_COLORS[post.role] || theme.palette.primary.main;

  const typeConfig = POST_TYPE_CONFIG[post.postType] || POST_TYPE_CONFIG.general;
  const badgeColor = typeConfig.color;

  async function handleLike() {
    setPulsing(true);
    setTimeout(() => setPulsing(false), 350);
    try {
      const { updatedLikes } = await toggleLike(post._id);
      dispatch(updatePost({ ...post, likes: updatedLikes }));
    } catch (err) {
      dispatch(showError(getErrorMessage(err)));
    }
  }

  async function handleConnect(e) {
    e.stopPropagation();
    if (!authorId) {
      dispatch(showError("This post has no linked author, so it can't be connected with."));
      return;
    }
    setBusy(true);
    try {
      const data = await toggleFriend(currentUser._id, authorId);
      if (data?.friends) dispatch(updateUserFriends(data.friends));
    } catch (err) {
      dispatch(showError(getErrorMessage(err)));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    try {
      await deletePost(post._id);
      dispatch(removePost(post._id));
    } catch (err) {
      dispatch(showError(getErrorMessage(err)));
    }
  }

  async function handleCommentAdded(c) {
    const updated = [...comments, c];
    setComments(updated);
    dispatch(updatePost({ ...post, comments: updated }));
  }

  const avatarUrl =
    post.userPicturePath || (typeof post.userId === "object" ? post.userId?.picturePath : "");

  const authorUser = {
    _id: authorId,
    firstName: post.firstName || (typeof post.userId === "object" ? post.userId?.firstName : ""),
    lastName: post.lastName || (typeof post.userId === "object" ? post.userId?.lastName : ""),
    picturePath: avatarUrl,
    role: post.role || (typeof post.userId === "object" ? post.userId?.role : "student"),
    occupation: typeof post.userId === "object" ? post.userId?.occupation : "",
    batch: typeof post.userId === "object" ? post.userId?.batch : "",
    location: post.location || (typeof post.userId === "object" ? post.userId?.location : ""),
  };

  return (
    <Box
      bgcolor="background.paper"
      border={`1px solid ${theme.palette.divider}`}
      borderRadius={3}
      overflow="hidden"
      sx={{
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        transition: "transform 180ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 180ms ease, border-color 180ms ease",
        position: "relative",
        "&:hover": {
          transform: "translateY(-1px)",
          borderColor: theme.palette.mode === "light" ? "rgba(99, 102, 241, 0.3)" : "rgba(255, 255, 255, 0.14)",
          boxShadow:
            theme.palette.mode === "light"
              ? "0 8px 24px -4px rgba(15, 23, 42, 0.08)"
              : "0 12px 32px -8px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
        },
      }}
    >
      <Box p={2.5}>
        {/* Header: Author Info & Post Category */}
        <Box display="flex" justifyContent="space-between" alignItems="center" gap={1.5}>
          <Box
            display="flex"
            gap={1.5}
            alignItems="center"
            sx={{ cursor: hasAuthor ? "pointer" : "default", minWidth: 0 }}
            onClick={() => hasAuthor && authorId && navigate(`/profile/${authorId}`)}
          >
            <ClickableAvatar
              user={authorUser}
              size={42}
              sx={{
                border: `2px solid ${roleColor}`,
                boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
              }}
            />
            <Box minWidth={0}>
              <Box display="flex" alignItems="center" gap={0.7} flexWrap="wrap">
                <Typography fontWeight={700} color="text.primary" fontSize="0.95rem" sx={{ letterSpacing: "-0.018em", lineHeight: 1.25 }}>
                  {hasAuthor ? `${post.firstName} ${post.lastName}` : "Unknown author"}
                </Typography>
                <VerifiedBadge role={post.role} size="small" />
                {post.role && (
                  <Box
                    component="span"
                    sx={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      px: 0.8,
                      py: 0.2,
                      borderRadius: 1,
                      bgcolor: `${roleColor}14`,
                      color: roleColor,
                      border: `1px solid ${roleColor}28`,
                    }}
                  >
                    {post.role}
                  </Box>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" fontSize="0.75rem" mt={0.2} display="block">
                {formatDate(post.createdAt)}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1} flexShrink={0}>
            {/* Category Pill */}
            {(() => {
              const TypeIcon = typeConfig.Icon;
              return (
                <Chip
                  icon={TypeIcon ? <TypeIcon sx={{ fontSize: "13px !important", color: `${badgeColor} !important` }} /> : undefined}
                  label={typeConfig.label}
                  size="small"
                  sx={{
                    bgcolor: `${badgeColor}12`,
                    color: badgeColor,
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    height: 24,
                    borderRadius: 1.5,
                    border: `1px solid ${badgeColor}33`,
                    "& .MuiChip-icon": {
                      ml: "6px",
                      mr: "-2px",
                    },
                  }}
                />
              );
            })()}

            {!isMe && (
              <Tooltip title={isConnected ? "Remove connection" : "Connect with peer"}>
                <span>
                  <IconButton
                    size="small"
                    onClick={handleConnect}
                    disabled={busy}
                    sx={{
                      width: 30,
                      height: 30,
                      bgcolor: isConnected ? "rgba(244, 63, 94, 0.1)" : "rgba(99, 102, 241, 0.08)",
                      color: isConnected ? "error.main" : "primary.main",
                      border: `1px solid ${isConnected ? "rgba(244, 63, 94, 0.2)" : "rgba(99, 102, 241, 0.2)"}`,
                      "&:hover": {
                        bgcolor: isConnected ? "rgba(244, 63, 94, 0.2)" : "rgba(99, 102, 241, 0.16)",
                      },
                    }}
                  >
                    {isConnected ? <PersonRemoveAlt1 sx={{ fontSize: 16 }} /> : <PersonAddAlt1 sx={{ fontSize: 16 }} />}
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {isMe && (
              <Tooltip title="Delete post">
                <IconButton size="small" onClick={handleDelete} sx={{ width: 30, height: 30, color: "text.secondary", "&:hover": { color: "error.main" } }}>
                  <DeleteOutline sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Post Description with multi-line spacing */}
        <Typography
          variant="body1"
          color="text.primary"
          mt={2}
          mb={post.picturePath ? 2 : 1}
          sx={{
            whiteSpace: "pre-line",
            lineHeight: 1.68,
            fontSize: "0.95rem",
            letterSpacing: "-0.01em",
          }}
        >
          {post.description}
        </Typography>
      </Box>

      {/* Media (Image or Video) in a crisp framed gallery style */}
      {post.picturePath && (
        <Box
          sx={{
            mx: 2.5,
            mb: 2,
            borderRadius: 3,
            overflow: "hidden",
            position: "relative",
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.mode === "light" ? "#F1F5F9" : "#05070D",
            boxShadow:
              theme.palette.mode === "light"
                ? "0 4px 16px -6px rgba(0, 0, 0, 0.08)"
                : "0 8px 24px -8px rgba(0, 0, 0, 0.6)",
          }}
        >
          {post.mediaType === "video" ? (
            <Box position="relative">
              <video
                src={post.picturePath}
                controls
                playsInline
                preload="metadata"
                style={{
                  width: "100%",
                  maxHeight: 460,
                  display: "block",
                  backgroundColor: "#000",
                }}
              />
              <Box
                position="absolute"
                top={12}
                right={12}
                display="flex"
                alignItems="center"
                gap={0.6}
                px={1.2}
                py={0.4}
                borderRadius={10}
                bgcolor="rgba(0, 0, 0, 0.7)"
                color="#fff"
                sx={{ backdropFilter: "blur(8px)" }}
              >
                <PlayCircleOutline sx={{ fontSize: 14, color: "#60A5FA" }} />
                <Typography variant="caption" fontWeight={700} fontSize={11}>
                  Video
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box position="relative">
              <img
                src={post.picturePath}
                alt="Post media"
                loading="lazy"
                style={{
                  width: "100%",
                  maxHeight: 460,
                  objectFit: "cover",
                  display: "block",
                  imageRendering: "-webkit-optimize-contrast",
                }}
              />
              <Box
                position="absolute"
                top={12}
                right={12}
                display="flex"
                alignItems="center"
                gap={0.6}
                px={1.2}
                py={0.4}
                borderRadius={10}
                bgcolor="rgba(0, 0, 0, 0.65)"
                color="#fff"
                sx={{ backdropFilter: "blur(8px)" }}
              >
                <ImageOutlined sx={{ fontSize: 13, color: "#34D399" }} />
                <Typography variant="caption" fontWeight={700} fontSize={11}>
                  HD
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* Footer: Tags, Like, Comment Buttons */}
      <Box px={2.5} pb={2}>
        {post.tags?.length > 0 && (
          <Box display="flex" gap={0.75} flexWrap="wrap" mb={1.75}>
            {post.tags.map((t) => (
              <Chip
                key={t}
                label={`#${t}`}
                size="small"
                variant="outlined"
                sx={{
                  height: 24,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "text.secondary",
                  borderColor: theme.palette.divider,
                  bgcolor: theme.palette.action.hover,
                  "&:hover": {
                    borderColor: badgeColor,
                    color: badgeColor,
                    bgcolor: typeConfig.bg,
                  },
                }}
              />
            ))}
          </Box>
        )}

        <Box display="flex" gap={3} alignItems="center" pt={0.5}>
          <Box display="flex" alignItems="center" gap={0.6}>
            <IconButton
              size="small"
              onClick={handleLike}
              sx={{
                color: isLiked ? "#F43F5E" : "text.secondary",
                "&:hover": { bgcolor: "rgba(244, 63, 94, 0.1)" },
              }}
            >
              <Box sx={{ display: "flex", animation: pulsing ? "likePop 350ms ease-out" : "none" }}>
                {isLiked ? (
                  <Favorite sx={{ color: "#F43F5E", fontSize: 20 }} />
                ) : (
                  <FavoriteBorder sx={{ fontSize: 20 }} />
                )}
              </Box>
            </IconButton>
            <Typography variant="body2" fontWeight={700} color={isLiked ? "error.main" : "text.secondary"}>
              {likeCount}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={0.6}>
            <IconButton
              size="small"
              onClick={() => setShowComments((s) => !s)}
              sx={{
                color: showComments ? "primary.main" : "text.secondary",
                "&:hover": { bgcolor: "rgba(99, 102, 241, 0.1)" },
              }}
            >
              <ChatBubbleOutline sx={{ fontSize: 19 }} />
            </IconButton>
            <Typography variant="body2" fontWeight={700} color={showComments ? "primary.main" : "text.secondary"}>
              {comments.length}
            </Typography>
          </Box>
        </Box>

        {showComments && (
          <CommentSection postId={post._id} comments={comments} onCommentAdded={handleCommentAdded} />
        )}
      </Box>
    </Box>
  );
}
