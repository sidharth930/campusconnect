import React, { useState } from "react";
import { Box, Avatar, Typography, Chip, Divider, IconButton, Tooltip, Skeleton, useTheme } from "@mui/material";
import { GitHub, LinkedIn, Language, Edit, Visibility, TrendingUp, PhotoCamera, LocationOnOutlined } from "@mui/icons-material";
import EditSocialLinksModal from "../EditSocialLinksModal/EditSocialLinksModal";
import ClickableAvatar from "../ClickableAvatar/ClickableAvatar";
import VerifiedBadge from "../VerifiedBadge/VerifiedBadge";
import AcademicBadges from "../AcademicBadges/AcademicBadges";
import { ROLE_COLORS } from "../../theme";

const LABELS = { student: "Student", alumni: "Alumni", developer: "Developer" };

const SOCIAL_LINKS = [
  { key: "githubUrl", label: "GitHub", Icon: GitHub },
  { key: "linkedinUrl", label: "LinkedIn", Icon: LinkedIn },
  { key: "portfolioUrl", label: "Portfolio", Icon: Language },
];

/**
 * Left-sidebar profile card — mini profile, "who's viewed your profile" /
 * "impressions" analytics, and editable social links. Used on both the
 * Home dashboard (own profile) and the Profile page (editable only if
 * it's the logged-in user's own profile).
 */
export default function ProfileSummaryCard({ profile, friendsCount, editable, onChanged }) {
  const theme = useTheme();
  const [editOpen, setEditOpen] = useState(false);

  if (!profile) {
    return (
      <Box bgcolor="background.paper" border="1px solid" borderColor="divider" borderRadius={3} p={2.5}>
        <Box display="flex" gap={1.5} alignItems="center" mb={2}>
          <Skeleton variant="circular" width={48} height={48} />
          <Box flex={1}><Skeleton variant="text" width="60%" /><Skeleton variant="text" width="40%" /></Box>
        </Box>
        <Skeleton variant="rounded" height={60} sx={{ mb: 1 }} />
        <Skeleton variant="rounded" height={80} />
      </Box>
    );
  }

  const color = ROLE_COLORS[profile.role] || ROLE_COLORS.student;
  const subLine = profile.role === "alumni" ? profile.occupation : profile.batch;

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
      <Box display="flex" gap={1.5} alignItems="center">
        <ClickableAvatar
          user={profile}
          size={54}
          sx={{
            border: `2.5px solid ${color}`,
            boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
          }}
        />
        <Box flex={1} minWidth={0}>
          <Box display="flex" alignItems="center" gap={0.6}>
            <Typography fontWeight={700} fontSize="1.02rem" noWrap sx={{ letterSpacing: "-0.015em" }}>
              {profile.firstName} {profile.lastName}
            </Typography>
            <VerifiedBadge role={profile.role} size="medium" />
          </Box>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {friendsCount ?? 0} campus connections
          </Typography>
        </Box>
        {editable && (
          <Tooltip title="Edit profile details">
            <IconButton size="small" onClick={() => setEditOpen(true)}>
              <Edit fontSize="small" sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box display="flex" alignItems="center" gap={1} mt={1.5} flexWrap="wrap">
        <VerifiedBadge role={profile.role} variant="chip" size="small" />
        {subLine && (
          <Chip
            label={subLine}
            size="small"
            sx={{
              height: 24,
              fontSize: "0.72rem",
              bgcolor: "action.hover",
              border: `1px solid ${theme.palette.divider}`,
              fontWeight: 600,
            }}
          />
        )}
      </Box>
      {profile.location && (
        <Box display="flex" alignItems="center" gap={0.6} mt={0.8}>
          <LocationOnOutlined sx={{ fontSize: "0.95rem", color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary" fontSize="0.82rem">
            {profile.location}
          </Typography>
        </Box>
      )}

      {/* Academic Credential & Trust Tier */}
      <AcademicBadges profile={profile} friendsCount={friendsCount} />

      <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1} my={2}>
        <Box p={1.4} bgcolor="action.hover" borderRadius={2} border={`1px solid ${theme.palette.divider}`}>
          <Box display="flex" alignItems="center" gap={0.6} mb={0.4}>
            <Visibility sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary" fontSize="0.72rem" fontWeight={600}>
              Views
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight={800} fontSize="1.1rem" lineHeight={1}>
            {profile.viewedProfile ?? 0}
          </Typography>
        </Box>

        <Box p={1.4} bgcolor="action.hover" borderRadius={2} border={`1px solid ${theme.palette.divider}`}>
          <Box display="flex" alignItems="center" gap={0.6} mb={0.4}>
            <TrendingUp sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary" fontSize="0.72rem" fontWeight={600}>
              Impressions
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight={800} fontSize="1.1rem" lineHeight={1}>
            {profile.impressions ?? 0}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" display="block" mb={1}>
        Social Profiles
      </Typography>
      <Box display="flex" flexDirection="column" gap={1}>
        {SOCIAL_LINKS.map(({ key, label, Icon }) => {
          const value = profile[key];
          return (
            <Box key={key} display="flex" alignItems="center" gap={1.5}>
              <Icon fontSize="small" sx={{ color: "text.secondary" }} />
              {value ? (
                <Typography
                  variant="body2" component="a" href={value} target="_blank" rel="noreferrer"
                  sx={{ color: "text.primary", textDecoration: "none", "&:hover": { color: "primary.main" }, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {label}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.disabled" flex={1}>{label} — not added</Typography>
              )}
              {editable && (
                <IconButton size="small" onClick={() => setEditOpen(true)}><Edit sx={{ fontSize: 14 }} /></IconButton>
              )}
            </Box>
          );
        })}
      </Box>

      {editable && (
        <EditSocialLinksModal
          open={editOpen} onClose={() => setEditOpen(false)} profile={profile}
          onSaved={() => onChanged?.()}
        />
      )}
    </Box>
  );
}
