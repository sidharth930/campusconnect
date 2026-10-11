import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Typography, ToggleButton, ToggleButtonGroup,
  IconButton, Alert, CircularProgress, FormControlLabel, Switch, Chip,
} from "@mui/material";
import {
  Close, WorkOutline, DescriptionOutlined, EventOutlined,
  CampaignOutlined, UploadFile, LinkOutlined, ScheduleOutlined, AdminPanelSettings,
} from "@mui/icons-material";
import { createAnnouncement } from "../../services/announcementService";
import api from "../../services/api";

const CATEGORIES = [
  { value: "placement", label: "Placement", Icon: WorkOutline, color: "#F59E0B" },
  { value: "notice", label: "Notice", Icon: DescriptionOutlined, color: "#6366F1" },
  { value: "event", label: "Event", Icon: EventOutlined, color: "#10B981" },
  { value: "advisory", label: "Advisory", Icon: CampaignOutlined, color: "#06B6D4" },
];

export default function CreateAnnouncementModal({ open, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [category, setCategory] = useState("placement");
  const [link, setLink] = useState("");
  const [deadline, setDeadline] = useState("");
  const [pinned, setPinned] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const activeCat = CATEGORIES.find((c) => c.value === category) || CATEGORIES[0];

  function handleReset() {
    setTitle("");
    setDetail("");
    setCategory("placement");
    setLink("");
    setDeadline("");
    setPinned(false);
    setFile(null);
    setError("");
  }

  function handleClose() {
    handleReset();
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !detail.trim()) {
      setError("Please provide both a Title and Announcement Details.");
      return;
    }

    setUploading(true);
    try {
      let attachmentUrl = "";
      let attachmentName = "";

      // If user uploaded a document / PDF, upload it first
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await api.post("/media/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        attachmentUrl = uploadRes.data?.url || "";
        attachmentName = file.name;
      }

      const payload = {
        title: title.trim(),
        detail: detail.trim(),
        category,
        link: link.trim(),
        deadline: deadline.trim(),
        pinned,
        attachmentUrl,
        attachmentName,
      };

      const created = await createAnnouncement(payload);
      onCreated?.(created);
      handleClose();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to publish announcement.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1.2}>
          <Box
            width={38} height={38} borderRadius={2.5}
            bgcolor="rgba(245, 158, 11, 0.15)" color="#F59E0B"
            display="flex" alignItems="center" justifyContent="center"
          >
            <AdminPanelSettings />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>Administrative Notice Hub</Typography>
            <Typography variant="caption" color="text.secondary">
              Published with official Alumni Administrative credentials
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={handleClose}><Close fontSize="small" /></IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          {/* Category Toggle */}
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.8} textTransform="uppercase">
              Announcement Category
            </Typography>
            <ToggleButtonGroup
              value={category}
              exclusive
              onChange={(e, val) => val && setCategory(val)}
              fullWidth
              size="small"
            >
              {CATEGORIES.map(({ value, label, Icon, color }) => (
                <ToggleButton
                  key={value}
                  value={value}
                  sx={{
                    py: 1,
                    textTransform: "none",
                    fontWeight: 600,
                    gap: 0.8,
                    borderColor: category === value ? `${color} !important` : undefined,
                    bgcolor: category === value ? `${color}18 !important` : undefined,
                    color: category === value ? color : "text.secondary",
                  }}
                >
                  <Icon fontSize="small" />
                  {label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* Title */}
          <TextField
            label="Announcement Title"
            placeholder={
              category === "placement"
                ? "e.g., Google STEP Internship & Full-time Drive 2026"
                : category === "event"
                ? "e.g., Annual Hackathon 'CodeSprint 2026'"
                : "e.g., Mid-Term Examination Schedule & Advisory"
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            size="small"
          />

          {/* Details */}
          <TextField
            label="Notice / Opportunity Description"
            placeholder="Write full details, eligibility criteria, department guidelines, and instructions..."
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            fullWidth
            multiline
            rows={4}
            required
            size="small"
          />

          {/* Direct Link (For Placement / Event position) */}
          <TextField
            label="Direct Position / Application Link (Optional)"
            placeholder="e.g., https://careers.google.com/jobs/results/..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: <LinkOutlined sx={{ color: "text.secondary", mr: 1, fontSize: 20 }} />,
            }}
            helperText="Users will see a direct 'Go to Position / Link' button to navigate here."
          />

          {/* Deadline / Dates */}
          <TextField
            label="Schedule / Application Deadline (Optional)"
            placeholder="e.g., Last Date: Nov 25, 2026 at 5:00 PM"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: <ScheduleOutlined sx={{ color: "text.secondary", mr: 1, fontSize: 20 }} />,
            }}
          />

          {/* Upload PDF / Document or Auto-Generate */}
          <Box
            p={1.8}
            borderRadius={2.5}
            border="1px dashed"
            borderColor="divider"
            bgcolor="action.hover"
            display="flex"
            flexDirection="column"
            gap={1}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1}>
                <UploadFile color="primary" fontSize="small" />
                <Typography variant="body2" fontWeight={600}>
                  Attach Custom PDF / Circular Document
                </Typography>
              </Box>
              {file && (
                <Chip
                  label={file.name}
                  size="small"
                  color="primary"
                  onDelete={() => setFile(null)}
                />
              )}
            </Box>
            <Typography variant="caption" color="text.secondary">
              Upload an official circular or syllabus PDF. If left blank, CampusConnect will automatically generate a verified institutional PDF notice on demand!
            </Typography>
            <Button
              variant="outlined"
              size="small"
              component="label"
              sx={{ alignSelf: "flex-start", borderRadius: 2 }}
            >
              Choose PDF File
              <input
                type="file"
                hidden
                accept="application/pdf,.doc,.docx"
                onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
              />
            </Button>
          </Box>

          {/* Pin Announcement Switch */}
          <FormControlLabel
            control={
              <Switch
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                color="warning"
              />
            }
            label={
              <Typography variant="body2" fontWeight={600}>
                Pin Announcement to Top of Feed
              </Typography>
            }
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={uploading}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <CampaignOutlined />}
            sx={{
              background: `linear-gradient(135deg, ${activeCat.color} 0%, #D97706 100%)`,
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "0.82rem",
              borderRadius: "20px",
              py: 0.8,
              px: 3.5,
              boxShadow: `0 3px 12px -2px ${activeCat.color}70`,
              transition: "all 180ms ease",
              "&:hover": {
                filter: "brightness(0.92)",
                boxShadow: `0 6px 18px -3px ${activeCat.color}90`,
                transform: "translateY(-1px)",
              },
            }}
          >
            {uploading ? "Posting..." : "Post"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
