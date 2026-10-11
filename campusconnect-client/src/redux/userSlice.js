import { createSlice } from "@reduxjs/toolkit";

const initialState = { profile: null, friends: [], searchResults: [], loading: false, error: null };

const userSlice = createSlice({
  name: "userState",
  initialState,
  reducers: {
    setProfile: (state, action) => { state.profile = action.payload; },
    updateProfile: (state, action) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    setFriends: (state, action) => { state.friends = action.payload; },
    setSearchResults: (state, action) => { state.searchResults = action.payload; },
    setUserLoading: (state, action) => { state.loading = action.payload; },
    setUserError: (state, action) => { state.error = action.payload; },
  },
});

export const { setProfile, updateProfile, setFriends, setSearchResults, setUserLoading, setUserError } = userSlice.actions;
export default userSlice.reducer;
