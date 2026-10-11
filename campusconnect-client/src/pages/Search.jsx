import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  InputBase,
  Typography,
  Paper,
  Button,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Grow,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear,
  PeopleAltOutlined,
  ArticleOutlined,
  AutoAwesome,
} from "@mui/icons-material";
import Navbar from "../components/Navbar/Navbar";
import UserCard from "../components/UserCard/UserCard";
import PostCard from "../components/PostCard/PostCard";
import SkeletonPostCard from "../components/SkeletonPostCard/SkeletonPostCard";
import { searchUsers } from "../services/userService";
import { searchPosts } from "../services/postService";
import { setSearchResults, setUserLoading } from "../redux/userSlice";
import { showError } from "../redux/uiSlice";
import { getErrorMessage } from "../services/api";

const POPULAR_TAGS = [
  "systemdesign",
  "dsa",
  "hackathon",
  "docker",
  "mca",
  "amazon",
  "Sidharth",
  "Ananya",
];

export default function Search() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [params, setParams] = useSearchParams();
  const results = useSelector((s) => s.userState.searchResults);
  const loading = useSelector((s) => s.userState.loading);
  const currentUser = useSelector((s) => s.auth.user);

  const initialQuery = params.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [postResults, setPostResults] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "users" | "posts"

  async function executeSearch(searchQuery) {
    const q = (searchQuery || "").trim();
    if (!q) {
      dispatch(setSearchResults([]));
      setPostResults([]);
      return;
    }

    dispatch(setUserLoading(true));
    try {
      const [users, posts] = await Promise.all([searchUsers(q), searchPosts(q)]);
      dispatch(setSearchResults(users || []));
      setPostResults(posts || []);
    } catch (err) {
      dispatch(showError(getErrorMessage(err)));
    } finally {
      dispatch(setUserLoading(false));
    }
  }

  // Synchronize when URL search param changes (e.g. from Navbar or bookmarks)
  useEffect(() => {
    const urlQ = params.get("q") || "";
    setQuery(urlQ);
    if (urlQ.trim()) {
      executeSearch(urlQ);
    } else {
      dispatch(setSearchResults([]));
      setPostResults([]);
    }
    // eslint-disable-next-line
  }, [params]);

  function handleFormSubmit(e) {
    e?.preventDefault();
    const q = query.trim();
    if (q) {
      setParams({ q });
      executeSearch(q);
    }
  }

  function handleClear() {
    setQuery("");
    setParams({});
    dispatch(setSearchResults([]));
    setPostResults([]);
  }

  function handleQuickTag(tag) {
    setQuery(tag);
    setParams({ q: tag });
    executeSearch(tag);
  }

  const totalUsers = results.length;
  const totalPosts = postResults.length;
  const nothingFound = !loading && query && totalUsers === 0 && totalPosts === 0;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        backgroundImage:
          theme.palette.mode === "light"
            ? "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.08), transparent 70%)"
            : "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.16), transparent 70%)",
        backgroundAttachment: "fixed",
      }}
    >
      <Navbar />

      <Box maxWidth={780} mx="auto" px={{ xs: 2, sm: 3 }} py={4}>
        {/* Search Bar Form */}
        <Paper
          component="form"
          onSubmit={handleFormSubmit}
          variant="outlined"
          sx={{
            p: "6px 8px 6px 16px",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            borderRadius: 3.5,
            mb: 2,
            bgcolor: "background.paper",
            boxShadow:
              theme.palette.mode === "light"
                ? "0 4px 20px -6px rgba(15, 23, 42, 0.08)"
                : "0 8px 24px -10px rgba(0, 0, 0, 0.6)",
            transition: "border-color 160ms, box-shadow 160ms",
            "&:focus-within": {
              borderColor: "primary.main",
              boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.15)",
            },
          }}
        >
          <SearchIcon color="primary" sx={{ fontSize: 22 }} />
          <InputBase
            fullWidth
            placeholder="Search by peer name, skill, batch, or post keyword…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ fontSize: "0.95rem" }}
          />

          {query && (
            <IconButton size="small" onClick={handleClear} sx={{ color: "text.secondary" }}>
              <Clear fontSize="small" />
            </IconButton>
          )}

          <Button
            type="submit"
            variant="contained"
            startIcon={<SearchIcon />}
            sx={{
              borderRadius: 2.5,
              px: 3,
              py: 0.9,
              fontWeight: 700,
              background: "linear-gradient(135deg, #4F46E5, #06B6D4)",
              "&:hover": {
                background: "linear-gradient(135deg, #4338CA, #0891B2)",
              },
            }}
          >
            Search
          </Button>
        </Paper>

        {/* Quick Tag Pills */}
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={3} px={0.5}>
          <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
            <AutoAwesome sx={{ fontSize: 14, color: "primary.main" }} />
            <Typography variant="caption" fontWeight={700}>
              Suggestions:
            </Typography>
          </Box>
          {POPULAR_TAGS.map((tag) => (
            <Chip
              key={tag}
              label={tag.startsWith("#") ? tag : `#${tag}`}
              size="small"
              onClick={() => handleQuickTag(tag)}
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                bgcolor: "action.hover",
                border: `1px solid ${theme.palette.divider}`,
                "&:hover": {
                  borderColor: "primary.main",
                  color: "primary.main",
                  bgcolor: "action.selected",
                },
              }}
            />
          ))}
        </Box>

        {/* Results Filter Tabs (Only shown when results exist) */}
        {(totalUsers > 0 || totalPosts > 0) && (
          <Box mb={3} borderBottom={`1px solid ${theme.palette.divider}`}>
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab value="all" label={`All Results (${totalUsers + totalPosts})`} />
              <Tab
                value="users"
                icon={<PeopleAltOutlined sx={{ fontSize: 18 }} />}
                iconPosition="start"
                label={`Peers (${totalUsers})`}
              />
              <Tab
                value="posts"
                icon={<ArticleOutlined sx={{ fontSize: 18 }} />}
                iconPosition="start"
                label={`Posts & Resources (${totalPosts})`}
              />
            </Tabs>
          </Box>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <Box display="flex" flexDirection="column" gap={2}>
            <SkeletonPostCard />
            <SkeletonPostCard />
          </Box>
        )}

        {/* Results Display */}
        {!loading && (
          <>
            {/* Empty State before search */}
            {!query && (
              <Box textAlign="center" py={8}>
                <SearchIcon sx={{ fontSize: 48, color: "text.secondary", opacity: 0.4, mb: 1.5 }} />
                <Typography variant="h6" fontWeight={700} color="text.primary" mb={0.5}>
                  Discover peers, study resources & campus thoughts
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type any topic, skill, course, or student name above, or click one of the suggested tags.
                </Typography>
              </Box>
            )}

            {/* No Results Found */}
            {nothingFound && (
              <Box textAlign="center" py={8} bgcolor="background.paper" borderRadius={3.5} p={4} border={`1px solid ${theme.palette.divider}`}>
                <Typography variant="h6" fontWeight={700} color="text.primary" mb={1}>
                  No results found for "{query}"
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Try searching by a broader keyword, single name, or general topic like <b>systemdesign</b>, <b>mca</b>, or <b>dsa</b>.
                </Typography>
                <Button variant="outlined" onClick={handleClear} sx={{ borderRadius: 2 }}>
                  Clear Search
                </Button>
              </Box>
            )}

            {/* Peers Section */}
            {(activeTab === "all" || activeTab === "users") && results.length > 0 && (
              <Box mb={4}>
                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                  <PeopleAltOutlined color="primary" fontSize="small" />
                  <Typography variant="subtitle2" fontWeight={700} textTransform="uppercase" letterSpacing="0.05em">
                    Peers & Mentors ({results.length})
                  </Typography>
                </Box>
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 3.5,
                    p: 1.5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  {results.map((u, i) => (
                    <Grow in key={u._id} timeout={250 + Math.min(i, 6) * 70}>
                      <Box>
                        <UserCard
                          user={u}
                          connected={currentUser?.friends?.some((f) => (f._id || f) === u._id)}
                          onChanged={() => executeSearch(query)}
                        />
                      </Box>
                    </Grow>
                  ))}
                </Paper>
              </Box>
            )}

            {/* Posts Section */}
            {(activeTab === "all" || activeTab === "posts") && postResults.length > 0 && (
              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <ArticleOutlined color="primary" fontSize="small" />
                  <Typography variant="subtitle2" fontWeight={700} textTransform="uppercase" letterSpacing="0.05em">
                    Posts, Doubts & Resources ({postResults.length})
                  </Typography>
                </Box>
                <Box display="flex" flexDirection="column" gap={2.5}>
                  {postResults.map((p, i) => (
                    <Grow in key={p._id} timeout={250 + Math.min(i, 6) * 70}>
                      <Box>
                        <PostCard post={p} />
                      </Box>
                    </Grow>
                  ))}
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
