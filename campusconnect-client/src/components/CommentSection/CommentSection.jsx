import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Box, Avatar, Typography, InputBase, IconButton, useTheme, Fade } from "@mui/material";
import { Send } from "@mui/icons-material";
import ClickableAvatar from "../ClickableAvatar/ClickableAvatar";
import VerifiedBadge from "../VerifiedBadge/VerifiedBadge";
import { addComment } from "../../services/postService";
import { showError } from "../../redux/uiSlice";
import { getErrorMessage } from "../../services/api";

export default function CommentSection({ postId, comments, onCommentAdded }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!draft.trim() || submitting) return;
    setSubmitting(true);
    try {
      const newComment = await addComment(postId, draft.trim());
      onCommentAdded(newComment);
      setDraft("");
    } catch (err) {
      dispatch(showError(getErrorMessage(err)));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box mt={2} pt={2} borderTop={`1px solid ${theme.palette.divider}`}>
      {comments.length > 0 && (
        <Box display="flex" flexDirection="column" gap={1.25} mb={2}>
          {comments.map((c, i) => {
            const author = typeof c.userId === "object" ? c.userId : null;
            const authorName = author
              ? `${author.firstName || ""} ${author.lastName || ""}`.trim()
              : "Peer";
            const initial = author?.firstName?.[0] || "P";

            return (
              <Fade in key={c._id || i} timeout={250 + i * 50}>
                <Box display="flex" gap={1.2} alignItems="flex-start">
                  <ClickableAvatar
                    user={author || { firstName: "Peer", picturePath: "" }}
                    size={32}
                    sx={{ mt: 0.3 }}
                  />
                  <Box
                    flex={1}
                    bgcolor={theme.palette.mode === "light" ? "#F1F5F9" : "rgba(255, 255, 255, 0.05)"}
                    borderRadius={2.5}
                    px={2}
                    py={1.2}
                    border={`1px solid ${theme.palette.divider}`}
                  >
                    <Box display="flex" alignItems="center" gap={0.6}>
                      <Typography variant="caption" fontWeight={700} color="text.primary">
                        {authorName}
                      </Typography>
                      {author?.role && <VerifiedBadge role={author.role} size="small" />}
                    </Box>
                    <Typography variant="body2" color="text.primary" sx={{ fontSize: "0.88rem", mt: 0.2 }}>
                      {c.text}
                    </Typography>
                  </Box>
                </Box>
              </Fade>
            );
          })}
        </Box>
      )}

      {/* Input row */}
      <Box
        display="flex"
        gap={1}
        alignItems="center"
        bgcolor={theme.palette.mode === "light" ? "#F8FAFC" : "rgba(255, 255, 255, 0.04)"}
        border={`1px solid ${theme.palette.divider}`}
        borderRadius={3}
        px={1.5}
        py={0.5}
      >
        <InputBase
          fullWidth
          placeholder="Share your perspective or answer this doubt…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          sx={{ fontSize: "0.88rem" }}
        />
        <IconButton
          size="small"
          onClick={submit}
          disabled={submitting || !draft.trim()}
          sx={{
            color: draft.trim() ? "primary.main" : "text.secondary",
            "&:hover": { bgcolor: "primary.light" },
          }}
        >
          <Send sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
