import { createSlice } from "@reduxjs/toolkit";

const initialState = { items: [], unreadCount: 0 };

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.items = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.read).length;
    },
    addNotification: (state, action) => {
      state.items = [action.payload, ...state.items];
      state.unreadCount += 1;
    },
    markOneRead: (state, action) => {
      const notif = state.items.find((n) => n._id === action.payload);
      if (notif && !notif.read) { notif.read = true; state.unreadCount -= 1; }
    },
    markAllRead: (state) => {
      state.items = state.items.map((n) => ({ ...n, read: true }));
      state.unreadCount = 0;
    },
  },
});

export const { setNotifications, addNotification, markOneRead, markAllRead } = notificationSlice.actions;
export default notificationSlice.reducer;
