import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { Refresh } from "@mui/icons-material";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          minHeight="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={3}
          bgcolor="background.default"
        >
          <Paper
            variant="outlined"
            sx={{
              p: 4,
              maxWidth: 480,
              textAlign: "center",
              borderRadius: 3.5,
              boxShadow: "0 12px 32px -10px rgba(0,0,0,0.15)",
            }}
          >
            <Typography variant="h5" fontWeight={700} color="error.main" mb={1}>
              Oops! Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              An unexpected display issue occurred. Try reloading the application.
            </Typography>
            {this.state.error && (
              <Box
                p={1.5}
                bgcolor="action.hover"
                borderRadius={2}
                mb={3}
                textAlign="left"
                sx={{ overflowX: "auto" }}
              >
                <Typography variant="caption" fontFamily="monospace" color="text.secondary">
                  {String(this.state.error?.message || this.state.error)}
                </Typography>
              </Box>
            )}
            <Button
              variant="contained"
              onClick={this.handleReload}
              startIcon={<Refresh />}
              sx={{ px: 3, borderRadius: 2.5 }}
            >
              Reload Page
            </Button>
          </Paper>
        </Box>
      );
    }
    return this.props.children;
  }
}
