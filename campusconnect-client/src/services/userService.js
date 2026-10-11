import api from "./api";

export const getUser = (id) => api.get(`/users/${id}`).then((r) => r.data);
export const getFriends = (id) => api.get(`/users/${id}/friends`).then((r) => r.data);
export const searchUsers = (q) => api.get(`/users/search?q=${encodeURIComponent(q)}`).then((r) => r.data);
export const toggleFriend = (id, friendId) => api.patch(`/users/${id}/${friendId}`).then((r) => r.data);
export const updateUser = (id, payload) => api.patch(`/users/${id}`, payload).then((r) => r.data);
