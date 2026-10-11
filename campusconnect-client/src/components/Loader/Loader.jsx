import React from "react";
import { Box, CircularProgress } from "@mui/material";

export default function Loader({ size = 26 }) {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" p={3}>
      <CircularProgress size={size} thickness={4} />
    </Box>
  );
}
