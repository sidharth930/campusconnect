import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, useTheme } from "@mui/material";
import { PeopleAltOutlined } from "@mui/icons-material";
import UserCard from "../UserCard/UserCard";
import api from "../../services/api";
import { showError } from "../../redux/uiSlice";
import { getErrorMessage } from "../../services/api";

/** Right-sidebar "people you may know" — real users, filtered to exclude yourself and existing connections. */
export default function FriendSuggestions() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const currentUser = useSelector((s) => s.auth.user);
  const [suggestions, setSuggestions] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!currentUser?._id) return;
    api.get("/users")
      .then(({ data }) => {
        const friendIds = new Set((currentUser.friends || []).map((f) => f._id || f));
        setSuggestions(data.filter((u) => u._id !== currentUser._id && !friendIds.has(u._id)).slice(0, 5));
      })
      .catch((err) => dispatch(showError(getErrorMessage(err))));
  }, [currentUser?._id, currentUser?.friends, refreshKey]); // eslint-disable-line

  return (
    <Box
      bgcolor="background.paper"
      border="1px solid"
      borderColor="divider"
      borderRadius={3.5}
      p={2.5}
      sx={{
        boxShadow:
          theme.palette.mode === "light"
            ? "0 4px 20px -6px rgba(15, 23, 42, 0.06)"
            : "0 8px 28px -10px rgba(0, 0, 0, 0.7)",
      }}
    >
      <Box display="flex" alignItems="center" gap={1} mb={1.5}>
        <PeopleAltOutlined fontSize="small" color="primary" />
        <Typography variant="subtitle2" fontWeight={700}>People you may know</Typography>
      </Box>
      {suggestions.length === 0 && (
        <Typography variant="body2" color="text.secondary">No suggestions right now.</Typography>
      )}
      <Box display="flex" flexDirection="column">
        {suggestions.map((u) => (
          <UserCard key={u._id} user={u} connected={false} onChanged={() => setRefreshKey((k) => k + 1)} />
        ))}
      </Box>
    </Box>
  );
}
