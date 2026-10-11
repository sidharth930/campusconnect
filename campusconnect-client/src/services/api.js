import axios from "axios";
import { store } from "../redux/store";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Turns any axios error into a message worth showing a user.
 * This is the fix for "it just says failed" — we now surface:
 *  1. the backend's own message (e.g. "Invalid credentials", "User already exists")
 *  2. a clear network-level explanation if the server never responded
 *     (wrong URL, CORS block, server not running) instead of a generic string
 */
export function getErrorMessage(err) {
  if (err?.response?.data?.message) {
    return err.response.data.message;
  }
  if (err?.response) {
    return `Server responded with ${err.response.status}: ${err.response.statusText || "Unknown error"}`;
  }
  if (err?.request) {
    return `Could not reach the server at ${BASE_URL}. Is the backend running, and does CLIENT_URL in its .env match this app's URL?`;
  }
  return err?.message || "Something went wrong";
}

export default api;
