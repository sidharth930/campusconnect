import React from "react";
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  LinearProgress,
  useTheme,
} from "@mui/material";
import {
  WorkspacePremium,
  School,
  Code,
  People,
  TrendingUp,
  Stars,
  VerifiedUser,
  Psychology,
} from "@mui/icons-material";

export default function AcademicBadges({ profile, friendsCount = 0 }) {
  const theme = useTheme();
  if (!profile) return null;

  const friends = Number(friendsCount) || 0;
  const impressions = Number(profile.impressions) || 0;
  const views = Number(profile.viewedProfile) || 0;
  const isAlumni = profile.role === "alumni";
  const isDeveloper = profile.role === "developer";

  // Calculate Campus Reputation Score
  const score = Math.max(
    10,
    friends * 20 + impressions * 5 + views * 3 + (isAlumni ? 80 : isDeveloper ? 50 : 30)
  );

  let tierName = "Rising Scholar";
  let tierColor = "#6366F1";
  let tierProgress = Math.min(100, Math.round((score / 350) * 100));

  if (score >= 250) {
    tierName = "Distinguished Mentor";
    tierColor = "#F59E0B";
  } else if (score >= 140) {
    tierName = "Senior Contributor";
    tierColor = "#10B981";
  } else if (score >= 70) {
    tierName = "Active Peer";
    tierColor = "#06B6D4";
  }

  // Generate earned badges list
  const earnedBadges = [];

  if (isAlumni) {
    earnedBadges.push({
      id: "alumni-mentor",
      label: "Alumni Mentor",
      desc: "Verified graduate actively mentoring students and sharing industry opportunities",
      Icon: WorkspacePremium,
      color: "#F59E0B",
    });
  }

  if (isDeveloper || profile.githubUrl) {
    earnedBadges.push({
      id: "code-builder",
      label: "Code Builder",
      desc: "Software developer with active GitHub profile and technical contributions",
      Icon: Code,
      color: "#06B6D4",
    });
  }

  if (friends >= 2) {
    earnedBadges.push({
      id: "networker",
      label: "Campus Networker",
      desc: `Connected with ${friends} peers across college batches and departments`,
      Icon: People,
      color: "#10B981",
    });
  }

  if (impressions >= 10 || views >= 5) {
    earnedBadges.push({
      id: "high-impact",
      label: "High-Impact Peer",
      desc: `Reached ${impressions} feed impressions and ${views} profile visits`,
      Icon: TrendingUp,
      color: "#8B5CF6",
    });
  }

  if (profile.batch) {
    earnedBadges.push({
      id: "batch-scholar",
      label: `Class of ${profile.batch}`,
      desc: `Registered scholar in batch ${profile.batch}`,
      Icon: School,
      color: "#6366F1",
    });
  }

  // Always at least one starter badge
  if (earnedBadges.length === 0) {
    earnedBadges.push({
      id: "verified-student",
      label: "Verified Student",
      desc: "Verified CampusConnect academic member",
      Icon: VerifiedUser,
      color: "#6366F1",
    });
  }

  return (
    <Box
      mt={2}
      p={1.75}
      borderRadius={3}
      bgcolor={theme.palette.mode === "light" ? "rgba(99, 102, 241, 0.04)" : "rgba(99, 102, 241, 0.08)"}
      border={`1px solid ${theme.palette.divider}`}
      sx={{ overflow: "hidden", maxWidth: "100%" }}
    >
      {/* Reputation Tier Header */}
      <Box mb={1.2}>
        <Box display="flex" alignItems="center" gap={0.6} mb={0.8}>
          <Stars sx={{ fontSize: 16, color: tierColor }} />
          <Typography variant="caption" fontWeight={800} textTransform="uppercase" letterSpacing="0.05em" color="text.secondary" fontSize="0.68rem">
            Reputation Tier
          </Typography>
        </Box>

        {/* Tier badge highlight card with score */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={1}
          px={1.2}
          py={0.6}
          borderRadius={2}
          bgcolor={theme.palette.mode === "light" ? "#FFFFFF" : "rgba(255, 255, 255, 0.04)"}
          border={`1px solid ${tierColor}33`}
          sx={{
            boxShadow: `0 2px 8px -2px ${tierColor}25`,
          }}
        >
          <Typography
            fontWeight={800}
            fontSize="0.78rem"
            color={tierColor}
            noWrap
            sx={{ letterSpacing: "-0.01em" }}
          >
            {tierName}
          </Typography>
          <Typography
            variant="caption"
            fontWeight={800}
            color="text.secondary"
            fontSize="0.72rem"
            sx={{ whiteSpace: "nowrap" }}
          >
            {score.toLocaleString()} pts
          </Typography>
        </Box>
      </Box>

      {/* Progress Bar */}
      <Box mb={2}>
        <LinearProgress
          variant="determinate"
          value={tierProgress}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: theme.palette.mode === "light" ? "#E2E8F0" : "rgba(255, 255, 255, 0.1)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 3,
              bgcolor: tierColor,
            },
          }}
        />
      </Box>

      {/* Badges Grid */}
      <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" display="block" mb={1}>
        Academic Badges ({earnedBadges.length})
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={0.8}>
        {earnedBadges.map(({ id, label, desc, Icon, color }) => (
          <Tooltip key={id} title={desc} arrow placement="top">
            <Chip
              icon={<Icon sx={{ fontSize: "14px !important", color: `${color} !important` }} />}
              label={label}
              size="small"
              sx={{
                fontSize: "0.72rem",
                fontWeight: 700,
                height: 26,
                maxWidth: "100%",
                bgcolor: theme.palette.mode === "light" ? "#fff" : "rgba(255, 255, 255, 0.05)",
                border: `1px solid ${color}44`,
                color: "text.primary",
                cursor: "pointer",
                transition: "all 150ms ease",
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
                "&:hover": {
                  borderColor: color,
                  transform: "translateY(-1px)",
                  boxShadow: `0 2px 8px -2px ${color}55`,
                },
              }}
            />
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
}
