import React from "react";
import { Box, Tooltip, Typography, Chip } from "@mui/material";
import {
  VerifiedRounded,
  WorkspacePremiumRounded,
  CodeRounded,
  SchoolRounded,
} from "@mui/icons-material";

const BADGE_CONFIG = {
  alumni: {
    label: "Verified Alumni",
    shortLabel: "Alumni Mentor",
    title: "Verified Alumni & Industry Mentor",
    icon: VerifiedRounded,
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.12)",
    border: "rgba(245, 158, 11, 0.35)",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
  },
  developer: {
    label: "Verified Developer",
    shortLabel: "Campus Dev",
    title: "Verified Campus Software Developer",
    icon: CodeRounded,
    color: "#06B6D4",
    bg: "rgba(6, 182, 212, 0.12)",
    border: "rgba(6, 182, 212, 0.35)",
    gradient: "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
  },
  student: {
    label: "Verified Scholar",
    shortLabel: "Student",
    title: "Verified Student Scholar",
    icon: SchoolRounded,
    color: "#6366F1",
    bg: "rgba(99, 102, 241, 0.12)",
    border: "rgba(99, 102, 241, 0.35)",
    gradient: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
  },
};

/**
 * Aesthetic Trust & Verification Badge for Alumni, Developers, and Students.
 * Supported variants:
 *  - "icon": Just the glowing verified icon with tooltip (for compact headers like PostCard, Comments)
 *  - "chip": Sleek pill with icon and role label (for profile headers)
 *  - "tag": Minimalist inline badge
 */
export default function VerifiedBadge({ role = "student", size = "small", variant = "icon", showTooltip = true }) {
  const config = BADGE_CONFIG[role] || BADGE_CONFIG.student;
  const IconComponent = config.icon;
  const iconPixelSize = size === "large" ? 20 : size === "medium" ? 17 : 14;

  if (variant === "chip") {
    const badge = (
      <Box
        component="span"
        display="inline-flex"
        alignItems="center"
        gap={0.6}
        px={1.1}
        py={0.3}
        borderRadius={10}
        sx={{
          bgcolor: config.bg,
          border: `1px solid ${config.border}`,
          color: config.color,
          userSelect: "none",
          verticalAlign: "middle",
          boxShadow: `0 2px 8px -2px ${config.color}33`,
          transition: "transform 150ms ease, box-shadow 150ms ease",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: `0 4px 12px -2px ${config.color}55`,
          },
        }}
      >
        <IconComponent sx={{ fontSize: iconPixelSize, color: config.color }} />
        <Typography
          variant="caption"
          component="span"
          fontWeight={700}
          fontSize={size === "large" ? "0.78rem" : "0.7rem"}
          sx={{ letterSpacing: "0.02em" }}
        >
          {config.label}
        </Typography>
      </Box>
    );

    return showTooltip ? <Tooltip title={config.title} arrow>{badge}</Tooltip> : badge;
  }

  // Default compact icon variant
  const iconOnly = (
    <Box
      component="span"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        verticalAlign: "middle",
        cursor: "pointer",
        color: config.color,
        filter: `drop-shadow(0 1px 2px ${config.color}66)`,
        transition: "transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        "&:hover": {
          transform: "scale(1.25)",
        },
      }}
    >
      <IconComponent sx={{ fontSize: iconPixelSize }} />
    </Box>
  );

  return showTooltip ? (
    <Tooltip title={config.title} arrow placement="top">
      {iconOnly}
    </Tooltip>
  ) : (
    iconOnly
  );
}
