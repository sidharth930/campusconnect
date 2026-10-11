import api from "./api";

export const getAnnouncements = () => api.get("/announcements").then((r) => r.data);
export const createAnnouncement = (payload) => api.post("/announcements", payload).then((r) => r.data);
export const deleteAnnouncement = (id) => api.delete(`/announcements/${id}`).then((r) => r.data);
