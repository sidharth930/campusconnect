import api from "./api";

export const getConversation = (friendId) => api.get(`/messages/${friendId}`).then((r) => r.data);
