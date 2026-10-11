import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import userReducer from "./userSlice";
import postReducer from "./postSlice";
import notificationReducer from "./notificationSlice";
import uiReducer from "./uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    userState: userReducer,
    posts: postReducer,
    notifications: notificationReducer,
    ui: uiReducer,
  },
});
