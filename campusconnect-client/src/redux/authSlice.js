import { createSlice } from "@reduxjs/toolkit";

const savedToken = typeof window !== "undefined" ? localStorage.getItem("campus_token") : null;
let savedUser = null;
try {
  savedUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("campus_user") || "null") : null;
} catch (e) {
  savedUser = null;
}

const initialState = { user: savedUser, token: savedToken, loading: false, error: null };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authStart: (state) => { state.loading = true; state.error = null; },
    authSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      try {
        localStorage.setItem("campus_token", action.payload.token);
        localStorage.setItem("campus_user", JSON.stringify(action.payload.user));
      } catch (e) {}
    },
    authFailure: (state, action) => { state.loading = false; state.error = action.payload; },
    logout: (state) => {
      state.user = null;
      state.token = null;
      try {
        localStorage.removeItem("campus_token");
        localStorage.removeItem("campus_user");
      } catch (e) {}
    },
    updateUserFriends: (state, action) => {
      if (state.user) {
        state.user.friends = action.payload;
        try {
          localStorage.setItem("campus_user", JSON.stringify(state.user));
        } catch (e) {}
      }
    },
    updateAuthUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        try {
          localStorage.setItem("campus_user", JSON.stringify(state.user));
        } catch (e) {}
      }
    },
  },
});

export const { authStart, authSuccess, authFailure, logout, updateUserFriends, updateAuthUser } = authSlice.actions;
export default authSlice.reducer;
