import React from "react";
import { Box, Skeleton, useTheme } from "@mui/material";

/** Animated placeholder card shown while the feed / profile data is loading. */
export default function SkeletonPostCard() {
  const theme = useTheme();
  return (
    <Box bgcolor="background.paper" border={`1px solid ${theme.palette.divider}`} borderRadius={3.5} p={2.5}>
      <Box display="flex" gap={1.5} mb={1.5}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box flex={1}>
          <Skeleton variant="text" width="40%" height={20} />
          <Skeleton variant="text" width="25%" height={16} />
        </Box>
      </Box>
      <Skeleton variant="text" width="90%" />
      <Skeleton variant="text" width="70%" />
      <Skeleton variant="rounded" height={160} sx={{ mt: 1.5, borderRadius: 2 }} />
    </Box>
  );
}
