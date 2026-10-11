import React from "react";
import { Box, Typography, Paper, useTheme } from "@mui/material";
import { School } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";

/**
 * Centered auth card layout for Login and Register pages.
 * Replaces the split-screen panel with a modern, focused centered card.
 */
export default function AuthLayout({ children }) {
  const theme = useTheme();

  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      px={2.5}
      py={6}
      sx={{
        bgcolor: "background.default",
        position: "relative",
        overflow: "hidden",
        backgroundImage:
          theme.palette.mode === "light"
            ? "radial-gradient(at 50% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)"
            : "radial-gradient(at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 60%)",
      }}
    >
      {/* Top Branding Header */}
      <Box
        component={RouterLink}
        to="/"
        display="flex"
        alignItems="center"
        gap={1.2}
        mb={3.5}
        sx={{ textDecoration: "none" }}
      >
        <Box
          width={40}
          height={40}
          borderRadius={2.5}
          bgcolor="primary.main"
          color="#fff"
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{
            boxShadow: "0 4px 14px -2px rgba(99, 102, 241, 0.45)",
          }}
        >
          <School fontSize="medium" />
        </Box>
        <Typography
          variant="h5"
          fontWeight={800}
          sx={{
            background: "linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.02em",
          }}
        >
          CampusConnect
        </Typography>
      </Box>

      {/* Main Centered Auth Card */}
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 480,
          p: { xs: 3, sm: 4.5 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow:
            theme.palette.mode === "light"
              ? "0 10px 30px -10px rgba(15, 23, 42, 0.08), 0 20px 40px -15px rgba(99, 102, 241, 0.06)"
              : "0 12px 35px -10px rgba(0, 0, 0, 0.6), 0 20px 50px -15px rgba(0, 0, 0, 0.8)",
          animation: "fadeSlideUp 400ms ease-out both",
        }}
      >
        {children}
      </Paper>
    </Box>
  );
}
