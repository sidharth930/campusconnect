import React, { useMemo, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider, GlobalStyles } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { ThemeModeContext } from "./ThemeModeContext";
import { themeSettings } from "./theme";
import AppRoutes from "./routes/AppRoutes";
import GlobalSnackbar from "./components/GlobalSnackbar/GlobalSnackbar";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import AvatarPreviewModal from "./components/AvatarPreviewModal/AvatarPreviewModal";

const KEYFRAMES = (
  <GlobalStyles
    styles={{
      "@keyframes fadeSlideUp": {
        from: { opacity: 0, transform: "translateY(14px)" },
        to: { opacity: 1, transform: "translateY(0)" },
      },
      "@keyframes pulseDot": {
        "0%, 100%": { boxShadow: "0 0 0 0 rgba(31,190,114,0.55)" },
        "70%": { boxShadow: "0 0 0 7px rgba(31,190,114,0)" },
      },
      "@keyframes floatBlob": {
        "0%, 100%": { transform: "translate(0,0) scale(1)" },
        "50%": { transform: "translate(18px,-22px) scale(1.06)" },
      },
      "@keyframes likePop": {
        "0%": { transform: "scale(1)" },
        "45%": { transform: "scale(1.35)" },
        "100%": { transform: "scale(1)" },
      },
      "html, body": {
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        scrollBehavior: "smooth",
        overflowX: "hidden",
      },
      "*": {
        scrollbarWidth: "thin",
      },
    }}
  />
);

export default function App() {
  const [mode, setMode] = useState("light");
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  const toggleMode = () => setMode((m) => (m === "light" ? "dark" : "light"));

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {KEYFRAMES}
        <BrowserRouter>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
          <AvatarPreviewModal />
        </BrowserRouter>
        <GlobalSnackbar />
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
