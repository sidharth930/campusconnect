import api from "./api";

export const getPosts = (userId) =>
  api.get(userId ? `/posts?userId=${userId}` : "/posts").then((r) => r.data);

export const searchPosts = (q) => api.get(`/posts/search?q=${encodeURIComponent(q)}`).then((r) => r.data);

// Media is uploaded separately first (services/mediaService.js), so this
// just sends JSON with the resulting URL already attached.
export const createPost = (payload) => api.post("/posts", payload).then((r) => r.data);

export const deletePost = (id) => api.delete(`/posts/${id}`).then((r) => r.data);
export const toggleLike = (id) => api.patch(`/posts/${id}/like`).then((r) => r.data);
export const addComment = (id, text) => api.post(`/posts/${id}/comment`, { text }).then((r) => r.data);
