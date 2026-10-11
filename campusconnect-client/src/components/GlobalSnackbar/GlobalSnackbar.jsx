import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Snackbar, Alert } from "@mui/material";
import { clearError } from "../../redux/uiSlice";

/**
 * Renders once at the app root. Any component dispatches showError("...")
 * and this surfaces it — fixes the "it just fails silently" problem for
 * like/comment/connect/post-creation across the whole app.
 */
export default function GlobalSnackbar() {
  const dispatch = useDispatch();
  const errorMessage = useSelector((s) => s.ui.errorMessage);

  return (
    <Snackbar
      open={!!errorMessage} autoHideDuration={5000}
      onClose={() => dispatch(clearError())}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert severity="error" variant="filled" onClose={() => dispatch(clearError())} sx={{ fontWeight: 500 }}>
        {errorMessage}
      </Alert>
    </Snackbar>
  );
}
