export const BRAND = "#6366F1"; // Vibrant Electric Indigo
export const ROLE_COLORS = {
  student: "#10B981",    // Crisp Emerald
  alumni: "#F59E0B",     // Amber Gold
  developer: "#8B5CF6",  // Electric Violet
};
export const GOLD = "#F59E0B";

export const POST_TYPE_CONFIG = {
  general: {
    label: "Thought",
    icon: "💡",
    color: "#6366F1",
    bg: "rgba(99, 102, 241, 0.12)",
    border: "rgba(99, 102, 241, 0.28)",
  },
  resource: {
    label: "Resource",
    icon: "📚",
    color: "#06B6D4",
    bg: "rgba(6, 182, 212, 0.12)",
    border: "rgba(6, 182, 212, 0.28)",
  },
  doubt: {
    label: "Doubt",
    icon: "❓",
    color: "#F43F5E",
    bg: "rgba(244, 63, 94, 0.12)",
    border: "rgba(244, 63, 94, 0.28)",
  },
  project: {
    label: "Project",
    icon: "🚀",
    color: "#10B981",
    bg: "rgba(16, 185, 129, 0.12)",
    border: "rgba(16, 185, 129, 0.28)",
  },
  placement: {
    label: "Placement",
    icon: "🎓",
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.14)",
    border: "rgba(245, 158, 11, 0.35)",
  },
  advice: {
    label: "Advice",
    icon: "🧭",
    color: "#14B8A6",
    bg: "rgba(20, 184, 166, 0.12)",
    border: "rgba(20, 184, 166, 0.28)",
  },
  job: {
    label: "Job",
    icon: "💼",
    color: "#3B82F6",
    bg: "rgba(59, 130, 246, 0.12)",
    border: "rgba(59, 130, 246, 0.28)",
  },
};

export const themeSettings = (mode) => ({
  palette: {
    mode,
    primary: {
      main: mode === "light" ? "#4F46E5" : "#6366F1",
      light: "#818CF8",
      dark: "#3730A3",
    },
    secondary: { main: "#8B5CF6" },
    error: { main: "#F43F5E" },
    warning: { main: "#F59E0B" },
    success: { main: "#10B981" },
    info: { main: "#06B6D4" },
    background: {
      default: mode === "light" ? "#F8FAFC" : "#060911",
      paper: mode === "light" ? "#FFFFFF" : "#0E1424",
    },
    text: {
      primary: mode === "light" ? "#0F172A" : "#F8FAFC",
      secondary: mode === "light" ? "#475569" : "#94A3B8",
    },
    action: {
      hover: mode === "light" ? "rgba(15, 23, 42, 0.04)" : "rgba(255, 255, 255, 0.05)",
      selected: mode === "light" ? "rgba(99, 102, 241, 0.08)" : "rgba(99, 102, 241, 0.15)",
    },
    divider: mode === "light" ? "#E2E8F0" : "rgba(255, 255, 255, 0.08)",
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    h1: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: "-0.03em" },
    h2: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: "-0.025em" },
    h3: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: "-0.02em" },
    h4: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: "-0.02em" },
    h5: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: "-0.015em" },
    h6: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: "-0.015em" },
    subtitle1: { fontWeight: 600, letterSpacing: "-0.01em" },
    subtitle2: { fontWeight: 600, letterSpacing: "-0.01em" },
    body1: { letterSpacing: "-0.011em", lineHeight: 1.6 },
    body2: { letterSpacing: "-0.01em", lineHeight: 1.55 },
    button: { fontWeight: 600, textTransform: "none", letterSpacing: "-0.01em" },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingTop: 8,
          paddingBottom: 8,
          boxShadow: "none",
          fontWeight: 600,
          transition: "all 180ms ease-in-out",
        },
        contained: {
          boxShadow: mode === "light"
            ? "0 4px 14px -3px rgba(79, 70, 229, 0.35)"
            : "0 4px 18px -3px rgba(99, 102, 241, 0.5)",
          "&:hover": {
            boxShadow: mode === "light"
              ? "0 6px 20px -3px rgba(79, 70, 229, 0.45)"
              : "0 6px 24px -3px rgba(99, 102, 241, 0.65)",
            transform: "translateY(-1px)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: mode === "light"
            ? "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 4px 16px -4px rgba(0, 0, 0, 0.06)"
            : "0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 8px 24px -8px rgba(0, 0, 0, 0.6)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 10,
          transition: "all 160ms ease",
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined" },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: "border-color 160ms ease, box-shadow 160ms ease",
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          imageRendering: "-webkit-optimize-contrast",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: mode === "light" ? "#CBD5E1 transparent" : "#334155 transparent",
        },
      },
    },
  },
});
