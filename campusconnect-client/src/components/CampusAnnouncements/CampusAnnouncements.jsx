import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Box, Typography, Chip, Button, IconButton, Tooltip, useTheme,
  CircularProgress, Alert, Snackbar, Stack, Divider,
} from "@mui/material";
import {
  CampaignOutlined, WorkOutline, EventOutlined, DescriptionOutlined,
  OpenInNew, PictureAsPdf, AddRounded, DeleteOutline,
  AdminPanelSettings, Verified, PushPin, Schedule, FilterList,
} from "@mui/icons-material";
import { getAnnouncements, deleteAnnouncement } from "../../services/announcementService";
import { downloadNoticePdf } from "../../utils/pdfGenerator";
import { getSocket } from "../../socket/socket";
import CreateAnnouncementModal from "./CreateAnnouncementModal";

const CATEGORY_MAP = {
  placement: { label: "Placement", Icon: WorkOutline, color: "#F59E0B", actionText: "Go to Position / Apply" },
  notice: { label: "Notice", Icon: DescriptionOutlined, color: "#6366F1", actionText: "Download Notice PDF" },
  event: { label: "Event", Icon: EventOutlined, color: "#10B981", actionText: "View Event / Register" },
  advisory: { label: "Advisory", Icon: CampaignOutlined, color: "#06B6D4", actionText: "Download Advisory PDF" },
};

export default function CampusAnnouncements() {
  const theme = useTheme();
  const currentUser = useSelector((s) => s.auth.user);
  const isAlumni = currentUser?.role === "alumni";

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    loadAnnouncements();

    const socket = getSocket();
    if (!socket) return;

    function handleNewAnnouncement(announcement) {
      if (announcement && announcement._id) {
        setAnnouncements((prev) => [announcement, ...prev.filter((a) => a._id !== announcement._id)]);
      }
    }

    function handleDeleteAnnouncement(deletedId) {
      if (deletedId) {
        setAnnouncements((prev) => prev.filter((a) => a._id !== deletedId));
      }
    }

    socket.on("new_announcement", handleNewAnnouncement);
    socket.on("delete_announcement", handleDeleteAnnouncement);

    return () => {
      socket.off("new_announcement", handleNewAnnouncement);
      socket.off("delete_announcement", handleDeleteAnnouncement);
    };
  }, []);

  async function loadAnnouncements() {
    try {
      setLoading(true);
      const data = await getAnnouncements();
      setAnnouncements(data || []);
    } catch (err) {
      console.error("Failed to load announcements:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this announcement?")) return;
    try {
      await deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
      setToast({ open: true, message: "Announcement removed successfully.", severity: "info" });
    } catch (err) {
      setToast({
        open: true,
        message: err?.response?.data?.message || "Failed to delete announcement.",
        severity: "error",
      });
    }
  }

  async function handleDownloadPdf(announcement, e) {
    e.stopPropagation();
    try {
      setDownloadingId(announcement._id);
      await downloadNoticePdf(announcement);
      setToast({
        open: true,
        message: `Downloaded official PDF: "${announcement.title}"`,
        severity: "success",
      });
    } catch (err) {
      console.error(err);
      setToast({ open: true, message: "Could not generate PDF notice.", severity: "error" });
    } finally {
      setDownloadingId(null);
    }
  }

  function handleOpenLink(link, e) {
    e.stopPropagation();
    if (!link) return;
    window.open(link, "_blank", "noopener,noreferrer");
  }

  const filtered = announcements.filter((a) => (filter === "all" ? true : a.category === filter));

  return (
    <Box
      bgcolor="background.paper"
      border="1px solid"
      borderColor="divider"
      borderRadius={3.5}
      p={2.5}
      sx={{
        boxShadow:
          theme.palette.mode === "light"
            ? "0 4px 20px -6px rgba(15, 23, 42, 0.06)"
            : "0 8px 28px -10px rgba(0, 0, 0, 0.7)",
      }}
    >
      {/* ---------------- Header & Administrative Controls ---------------- */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.8}>
        <Box display="flex" alignItems="center" gap={1.2}>
          <Box
            width={36} height={36} borderRadius={2.5}
            bgcolor="rgba(99, 102, 241, 0.12)" color="primary.main"
            display="flex" alignItems="center" justifyContent="center"
            sx={{ boxShadow: "0 2px 8px -2px rgba(99, 102, 241, 0.25)" }}
          >
            <CampaignOutlined fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={800} fontSize="0.96rem" sx={{ letterSpacing: "-0.01em" }}>
              Campus Announcements
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Placement drives, circulars & events
            </Typography>
          </Box>
        </Box>

        {/* Administrative button visible ONLY to Alumni users */}
        {isAlumni && (
          <Tooltip title="Post official campus announcement or placement">
            <Button
              variant="contained"
              size="small"
              onClick={() => setModalOpen(true)}
              startIcon={<AddRounded sx={{ fontSize: "16px !important" }} />}
              sx={{
                background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "0.78rem",
                letterSpacing: "-0.01em",
                borderRadius: "20px",
                textTransform: "none",
                py: 0.6,
                px: 1.8,
                boxShadow: "0 3px 12px -2px rgba(245, 158, 11, 0.45)",
                transition: "all 180ms cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  background: "linear-gradient(135deg, #FBBF24 0%, #D97706 100%)",
                  boxShadow: "0 6px 18px -3px rgba(245, 158, 11, 0.6)",
                  transform: "translateY(-1.5px)",
                },
                "&:active": {
                  transform: "translateY(0)",
                },
              }}
            >
              Post
            </Button>
          </Tooltip>
        )}
      </Box>

      {/* Alumni Administrative Badge for transparency */}
      {isAlumni && (
        <Box
          display="flex" alignItems="center" gap={0.8}
          bgcolor="rgba(245, 158, 11, 0.1)"
          border="1px solid rgba(245, 158, 11, 0.25)"
          borderRadius={2} p={1} mb={2}
        >
          <AdminPanelSettings sx={{ color: "#F59E0B", fontSize: 18 }} />
          <Typography variant="caption" fontWeight={600} color="#B45309">
            You are logged in as an Alumni Administrator. You can post, update, and manage official notices.
          </Typography>
        </Box>
      )}

      {/* ---------------- Category Filter Chips ---------------- */}
      <Stack direction="row" spacing={0.6} mb={2} sx={{ overflowX: "auto", pb: 0.5 }}>
        {[
          ["all", "All"],
          ["placement", "Placements"],
          ["notice", "Notices"],
          ["event", "Events"],
          ["advisory", "Advisories"],
        ].map(([key, label]) => {
          const active = filter === key;
          return (
            <Chip
              key={key}
              label={label}
              size="small"
              onClick={() => setFilter(key)}
              sx={{
                fontSize: "0.7rem",
                fontWeight: active ? 700 : 500,
                cursor: "pointer",
                bgcolor: active ? "primary.main" : "action.hover",
                color: active ? "primary.contrastText" : "text.secondary",
                "&:hover": { bgcolor: active ? "primary.dark" : "action.selected" },
              }}
            />
          );
        })}
      </Stack>

      {/* ---------------- Announcement List ---------------- */}
      {loading ? (
        <Box textAlign="center" py={4}>
          <CircularProgress size={26} />
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            Loading announcements…
          </Typography>
        </Box>
      ) : filtered.length === 0 ? (
        <Box textAlign="center" py={4} bgcolor="action.hover" borderRadius={2}>
          <Typography variant="caption" color="text.secondary">
            No announcements found in this category.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {filtered.map((item) => {
            const cat = CATEGORY_MAP[item.category] || CATEGORY_MAP.notice;
            const Icon = cat.Icon;
            const hasLink = Boolean(item.link);
            const isNoticeOrAdvisory = item.category === "notice" || item.category === "advisory" || Boolean(item.attachmentUrl);

            return (
              <Box
                key={item._id}
                p={1.8}
                borderRadius={2.5}
                border="1px solid"
                borderColor="divider"
                bgcolor="background.default"
                sx={{
                  transition: "all 180ms ease",
                  "&:hover": {
                    borderColor: cat.color,
                    boxShadow: `0 4px 16px -4px ${cat.color}25`,
                    transform: "translateY(-1px)",
                  },
                }}
              >
                {/* Top metadata row */}
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Box display="flex" alignItems="center" gap={0.8} flexWrap="wrap">
                    <Chip
                      icon={<Icon sx={{ fontSize: "14px !important", color: `${cat.color} !important` }} />}
                      label={cat.label}
                      size="small"
                      sx={{
                        bgcolor: `${cat.color}15`,
                        color: cat.color,
                        fontWeight: 700,
                        fontSize: "0.68rem",
                        height: 22,
                        border: `1px solid ${cat.color}33`,
                      }}
                    />
                    <Chip
                      icon={<Verified sx={{ fontSize: "12px !important", color: "#F59E0B !important" }} />}
                      label="Alumni"
                      size="small"
                      sx={{
                        bgcolor: "rgba(245, 158, 11, 0.1)",
                        color: "#F59E0B",
                        fontWeight: 700,
                        fontSize: "0.65rem",
                        height: 20,
                        border: "1px solid rgba(245, 158, 11, 0.25)",
                      }}
                    />
                    {item.pinned && (
                      <Chip
                        icon={<PushPin sx={{ fontSize: "12px !important", color: "#F59E0B !important" }} />}
                        label="Pinned"
                        size="small"
                        sx={{
                          bgcolor: "rgba(245, 158, 11, 0.12)",
                          color: "#F59E0B",
                          fontWeight: 700,
                          fontSize: "0.65rem",
                          height: 20,
                        }}
                      />
                    )}
                  </Box>

                  {/* Alumni admin delete button */}
                  {isAlumni && (
                    <Tooltip title="Delete announcement">
                      <IconButton
                        size="small"
                        onClick={(e) => handleDelete(item._id, e)}
                        sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                {/* Title */}
                <Typography variant="body2" fontWeight={700} lineHeight={1.35} mb={0.6}>
                  {item.title}
                </Typography>

                {/* Detail */}
                <Typography variant="caption" color="text.secondary" display="block" lineHeight={1.5} mb={1.2}>
                  {item.detail}
                </Typography>

                {/* Deadline indicator if present */}
                {item.deadline && (
                  <Box display="flex" alignItems="center" gap={0.6} mb={1.2}>
                    <Schedule sx={{ fontSize: 13, color: "warning.main" }} />
                    <Typography variant="caption" fontWeight={600} color="warning.main" fontSize="0.7rem">
                      {item.deadline}
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ mb: 1.5, opacity: 0.6 }} />

                {/* ---------------- Action Buttons ---------------- */}
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {/* BUTTON 1: Direct link to position / event application */}
                  {hasLink && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={(e) => handleOpenLink(item.link, e)}
                      startIcon={<OpenInNew sx={{ fontSize: "14px !important" }} />}
                      sx={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        borderRadius: "18px",
                        textTransform: "none",
                        py: 0.55,
                        px: 1.6,
                        bgcolor: cat.color,
                        boxShadow: `0 2px 10px -2px ${cat.color}60`,
                        transition: "all 160ms ease",
                        "&:hover": {
                          bgcolor: cat.color,
                          filter: "brightness(0.92)",
                          transform: "translateY(-1px)",
                          boxShadow: `0 4px 14px -2px ${cat.color}80`,
                        },
                      }}
                    >
                      {item.category === "placement" ? "Go to Position / Apply ↗" : "Open Link ↗"}
                    </Button>
                  )}

                  {/* BUTTON 2: PDF Download for Notice / Advisory */}
                  {isNoticeOrAdvisory && (
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={downloadingId === item._id}
                      onClick={(e) => handleDownloadPdf(item, e)}
                      startIcon={
                        downloadingId === item._id ? (
                          <CircularProgress size={13} color="inherit" />
                        ) : (
                          <PictureAsPdf sx={{ fontSize: "14px !important" }} />
                        )
                      }
                      sx={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        borderRadius: "18px",
                        textTransform: "none",
                        py: 0.55,
                        px: 1.6,
                        borderColor: theme.palette.mode === "light" ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.15)",
                        color: "text.primary",
                        transition: "all 160ms ease",
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: "action.hover",
                          color: "primary.main",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      {downloadingId === item._id
                        ? "Generating PDF…"
                        : item.category === "advisory"
                        ? "Download Advisory PDF"
                        : "Download Notice PDF"}
                    </Button>
                  )}
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}

      {/* Creation Modal for Alumni Administrators */}
      {isAlumni && (
        <CreateAnnouncementModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreated={(newAnnouncement) => {
            setAnnouncements((prev) => [newAnnouncement, ...prev]);
            setToast({
              open: true,
              message: "Campus announcement published successfully!",
              severity: "success",
            });
          }}
        />
      )}

      {/* Feedback Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity}
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
