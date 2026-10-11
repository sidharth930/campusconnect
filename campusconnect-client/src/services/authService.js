import api from "./api";

export const registerUser = (payload) => api.post("/auth/register", payload).then((r) => r.data);
export const loginUser = (payload) => api.post("/auth/login", payload).then((r) => r.data);
export const resetPassword = (payload) => api.post("/auth/reset-password", payload).then((r) => r.data);

