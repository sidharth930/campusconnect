import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Typography, IconButton, InputAdornment,
  Alert, CircularProgress,
} from "@mui/material";
import {
  Close, Visibility, VisibilityOff, LockReset, CheckCircleOutline,
} from "@mui/icons-material";
import { resetPassword } from "../../services/authService";
import { getErrorMessage } from "../../services/api";

export default function ForgotPasswordModal({ open, onClose, defaultEmail = "", onPasswordReset }) {
  const [email, setEmail] = useState(defaultEmail);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Sync defaultEmail when modal opens
  React.useEffect(() => {
    if (open) {
      setEmail(defaultEmail);
      setNewPassword("");
      setConfirmPassword("");
      setError("");
      setSuccess("");
    }
  }, [open, defaultEmail]);

  function handleClose() {
    setError("");
    setSuccess("");
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your registered email.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({ email: email.trim(), newPassword });
      setSuccess(res?.message || "Password updated successfully!");
      onPasswordReset?.(email.trim(), newPassword);
      setTimeout(() => {
        handleClose();
      }, 1400);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1.2}>
          <Box
            width={38} height={38} borderRadius={2.5}
            bgcolor="rgba(99, 102, 241, 0.12)" color="primary.main"
            display="flex" alignItems="center" justifyContent="center"
          >
            <LockReset fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} fontSize="1.05rem">
              Reset Password
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Enter your email and choose a new password
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={handleClose}><Close fontSize="small" /></IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && (
            <Alert severity="success" icon={<CheckCircleOutline fontSize="inherit" />}>
              {success}
            </Alert>
          )}

          <TextField
            label="Registered Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            size="small"
            autoFocus
          />

          <TextField
            label="New Password"
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            required
            size="small"
            helperText="Minimum 6 characters"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    edge="end"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Confirm New Password"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            required
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    edge="end"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    aria-label="toggle password visibility"
                  >
                    {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || Boolean(success)}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <LockReset />}
            sx={{ borderRadius: "20px", px: 2.5 }}
          >
            {loading ? "Updating..." : "Reset Password"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
