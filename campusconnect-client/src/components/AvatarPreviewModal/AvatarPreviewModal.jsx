import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Avatar,
  IconButton,
  Button,
  Chip,
  LinearProgress,
  Tooltip,
  Fade,
  useTheme,
  CircularProgress,
} from "@mui/material";
import {
  Close,
  PhotoCamera,
  DeleteOutline,
  OpenInNew,
  AccountCircle,
  School,
  VerifiedUser,
  Place,
  Work,
  CheckCircleOutline,
} from "@mui/icons-material";
import { closeAvatarModal, updateAvatarModalUser, showError } from "../../redux/uiSlice";
import { updateAuthUser } from "../../redux/authSlice";
import { updateProfile } from "../../redux/userSlice";
import { updateUser } from "../../services/userService";
import { uploadMedia } from "../../services/mediaService";
import { getErrorMessage } from "../../services/api";
import { ROLE_COLORS } from "../../theme";

export default function AvatarPreviewModal() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { open, user, editable } = useSelector((s) => s.ui.avatarModal);
  const currentUser = useSelector((s) => s.auth.user);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");

  if (!open || !user) return null;

  const isMe = editable || (currentUser && user && (currentUser._id === user._id || currentUser._id === user.id));
  const role = user.role || "student";
  const roleColor = ROLE_COLORS[role] || theme.palette.primary.main;
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Campus Peer";
  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "?";
  const userPhoto = user.picturePath || user.userPicturePath || "";
  const subInfo = user.role === "alumni" ? user.occupation : user.batch;

  const handleClose = () => {
    if (uploading) return;
    setSuccessMsg("");
    dispatch(closeAvatarModal());
  };

  const handleViewProfile = () => {
    handleClose();
    const targetId = user._id || user.id;
    if (targetId) {
      navigate(`/profile/${targetId}`);
    }
  };

  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      dispatch(showError("Please select a valid image file (JPG, PNG, WebP)"));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      dispatch(showError("Image size must be less than 10MB"));
      return;
    }

    setUploading(true);
    setProgress(0);
    setSuccessMsg("");

    try {
      // 1. Upload to cloud storage
      const { url } = await uploadMedia(file, setProgress);

      // 2. Persist new picturePath in database
      const myId = currentUser?._id || user._id;
      const updatedUser = await updateUser(myId, { picturePath: url });

      // 3. Update all relevant redux slices
      dispatch(updateAvatarModalUser({ picturePath: url }));
      dispatch(updateAuthUser({ picturePath: url }));
      dispatch(updateProfile({ picturePath: url }));

      setSuccessMsg("Profile photo updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      dispatch(showError(getErrorMessage(err)));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm("Are you sure you want to remove your profile photo?")) return;
    setUploading(true);
    try {
      const myId = currentUser?._id || user._id;
      await updateUser(myId, { picturePath: "" });

      dispatch(updateAvatarModalUser({ picturePath: "" }));
      dispatch(updateAuthUser({ picturePath: "" }));
      dispatch(updateProfile({ picturePath: "" }));

      setSuccessMsg("Profile photo removed.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      dispatch(showError(getErrorMessage(err)));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={250}
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          p: 0,
          background:
            theme.palette.mode === "light"
              ? "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)"
              : "linear-gradient(180deg, #1E293B 0%, #0F172A 100%)",
          border: `1px solid ${theme.palette.divider}`,
          boxShadow:
            theme.palette.mode === "light"
              ? "0 20px 45px -10px rgba(15, 23, 42, 0.25)"
              : "0 25px 55px -12px rgba(0, 0, 0, 0.8)",
        },
      }}
    >
      {/* Hidden File Input for DP Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Header Accent Bar */}
      <Box height={5} bgcolor={roleColor} width="100%" />

      {/* Top action row */}
      <Box display="flex" justifyContent="space-between" alignItems="center" px={2.5} pt={2}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.8}>
          Profile Photo
        </Typography>
        <IconButton size="small" onClick={handleClose} sx={{ color: "text.secondary" }}>
          <Close fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3, pt: 1.5, textAlign: "center" }}>
        {/* Main Display Picture Area */}
        <Box position="relative" display="inline-block" my={1.5}>
          <Box
            sx={{
              position: "relative",
              width: 200,
              height: 200,
              mx: "auto",
              borderRadius: "50%",
              p: 0.6,
              background: `linear-gradient(135deg, ${roleColor}, ${roleColor}66, transparent)`,
              boxShadow: `0 8px 30px ${roleColor}33`,
            }}
          >
            <Avatar
              src={userPhoto}
              alt={fullName}
              sx={{
                width: "100%",
                height: "100%",
                fontSize: 64,
                fontWeight: 800,
                bgcolor: `${roleColor}22`,
                color: roleColor,
                border: `3px solid ${theme.palette.background.paper}`,
                boxShadow: "inset 0 2px 6px rgba(0,0,0,0.1)",
              }}
            >
              {initials}
            </Avatar>

            {/* Uploading Spinner Overlay */}
            {uploading && (
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                borderRadius="50%"
                bgcolor="rgba(0, 0, 0, 0.6)"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                zIndex={2}
              >
                <CircularProgress size={44} sx={{ color: "#FFF" }} />
                <Typography variant="caption" sx={{ color: "#FFF", mt: 1, fontWeight: 700 }}>
                  {progress > 0 ? `${progress}%` : "Uploading…"}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Camera Button Badge if user is viewing their own profile */}
          {isMe && !uploading && (
            <Tooltip title="Upload new photo" placement="left">
              <IconButton
                onClick={handleTriggerUpload}
                sx={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  bgcolor: roleColor,
                  color: "#FFF",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  border: `2px solid ${theme.palette.background.paper}`,
                  "&:hover": {
                    bgcolor: roleColor,
                    filter: "brightness(1.15)",
                    transform: "scale(1.08)",
                  },
                  transition: "all 0.2s ease",
                  width: 44,
                  height: 44,
                }}
              >
                <PhotoCamera fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Upload Progress Bar if in progress */}
        {uploading && progress > 0 && (
          <Box width="80%" mx="auto" my={1}>
            <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 2, height: 6 }} />
          </Box>
        )}

        {/* Success Alert Banner */}
        {successMsg && (
          <Fade in>
            <Typography
              variant="caption"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.6,
                bgcolor: "success.main",
                color: "#FFF",
                px: 1.8,
                py: 0.5,
                borderRadius: 2,
                fontWeight: 600,
                my: 1,
              }}
            >
              <CheckCircleOutline sx={{ fontSize: "14px !important" }} />
              {successMsg}
            </Typography>
          </Fade>
        )}

        {/* User Info Details */}
        <Typography variant="h6" fontWeight={800} mt={1} letterSpacing="-0.015em">
          {fullName}
        </Typography>

        <Box display="flex" justifyContent="center" alignItems="center" gap={1} mt={0.5} flexWrap="wrap">
          <Chip
            icon={role === "alumni" ? <VerifiedUser sx={{ fontSize: "14px !important" }} /> : <School sx={{ fontSize: "14px !important" }} />}
            label={role === "alumni" ? "Alumni" : "Student"}
            size="small"
            sx={{
              bgcolor: `${roleColor}18`,
              color: roleColor,
              fontWeight: 700,
              fontSize: "0.75rem",
              border: `1px solid ${roleColor}33`,
            }}
          />
        </Box>

        {(subInfo || user.location) && (
          <Box display="flex" justifyContent="center" alignItems="center" gap={1.5} mt={1} color="text.secondary" flexWrap="wrap">
            {subInfo && (
              <Box display="flex" alignItems="center" gap={0.5}>
                {role === "alumni" ? <Work sx={{ fontSize: 15 }} /> : <School sx={{ fontSize: 15 }} />}
                <Typography variant="caption" fontWeight={600}>
                  {subInfo}
                </Typography>
              </Box>
            )}
            {user.location && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <Place sx={{ fontSize: 15 }} />
                <Typography variant="caption" fontWeight={600}>
                  {user.location}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Interactive Action Buttons */}
        <Box display="flex" flexDirection="column" gap={1.2} mt={3}>
          {/* View Profile Action */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleViewProfile}
            startIcon={<AccountCircle />}
            sx={{
              borderRadius: 3,
              fontWeight: 700,
              py: 1.1,
              textTransform: "none",
              fontSize: "0.92rem",
              bgcolor: roleColor,
              "&:hover": {
                bgcolor: roleColor,
                filter: "brightness(0.92)",
              },
            }}
          >
            View Full Profile
          </Button>

          {/* If viewing own profile: Change photo / Remove photo buttons */}
          {isMe && (
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                fullWidth
                size="small"
                startIcon={<PhotoCamera />}
                onClick={handleTriggerUpload}
                disabled={uploading}
                sx={{
                  borderRadius: 2.5,
                  fontWeight: 600,
                  textTransform: "none",
                  borderColor: `${roleColor}55`,
                  color: roleColor,
                  "&:hover": {
                    borderColor: roleColor,
                    bgcolor: `${roleColor}10`,
                  },
                }}
              >
                Change Photo
              </Button>

              {userPhoto && (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteOutline />}
                  onClick={handleRemovePhoto}
                  disabled={uploading}
                  sx={{
                    borderRadius: 2.5,
                    fontWeight: 600,
                    textTransform: "none",
                  }}
                >
                  Remove
                </Button>
              )}
            </Box>
          )}

          {/* Open full-res photo in new tab if cloud URL available */}
          {userPhoto && (
            <Button
              size="small"
              startIcon={<OpenInNew sx={{ fontSize: 15 }} />}
              onClick={() => window.open(userPhoto, "_blank", "noopener,noreferrer")}
              sx={{
                color: "text.secondary",
                fontSize: "0.8rem",
                textTransform: "none",
                fontWeight: 500,
                "&:hover": { color: "primary.main" },
              }}
            >
              Open Full Resolution Image
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
