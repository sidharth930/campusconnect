import React from "react";
import { Box, Typography, Stack } from "@mui/material";

const STACK = ["MongoDB Atlas", "Express", "React 18", "Node.js", "Redux Toolkit", "Socket.io", "Redis", "Cloudinary", "JWT + bcrypt"];

/** Small portfolio-friendly tech credit bar shown at the bottom of main pages. */
export default function TechFooter() {
  return (
    <Box textAlign="center" py={4} mt={2}>
      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
        Built on the MERN stack
      </Typography>
      <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
        {STACK.map((t) => (
          <Box
            key={t}
            sx={{
              fontSize: 11, fontWeight: 600, px: 1.3, py: 0.5, borderRadius: 20,
              bgcolor: "action.hover", color: "text.secondary",
            }}
          >
            {t}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
