import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  errorMessage: "",
  avatarModal: {
    open: false,
    user: null,
    editable: false,
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showError: (state, action) => { state.errorMessage = action.payload; },
    clearError: (state) => { state.errorMessage = ""; },
    openAvatarModal: (state, action) => {
      state.avatarModal = {
        open: true,
        user: action.payload.user,
        editable: Boolean(action.payload.editable),
      };
    },
    closeAvatarModal: (state) => {
      state.avatarModal = { open: false, user: null, editable: false };
    },
    updateAvatarModalUser: (state, action) => {
      if (state.avatarModal.user) {
        state.avatarModal.user = { ...state.avatarModal.user, ...action.payload };
      }
    },
  },
});

export const {
  showError,
  clearError,
  openAvatarModal,
  closeAvatarModal,
  updateAvatarModalUser,
} = uiSlice.actions;
export default uiSlice.reducer;
