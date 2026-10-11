import { createSlice } from "@reduxjs/toolkit";

const initialState = { posts: [], loading: false, error: null };

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setPosts: (state, action) => { state.posts = action.payload; },
    addPost: (state, action) => { state.posts = [action.payload, ...state.posts]; },
    updatePost: (state, action) => {
      state.posts = state.posts.map((p) => (p._id === action.payload._id ? action.payload : p));
    },
    removePost: (state, action) => {
      state.posts = state.posts.filter((p) => p._id !== action.payload);
    },
    setPostsLoading: (state, action) => { state.loading = action.payload; },
  },
});

export const { setPosts, addPost, updatePost, removePost, setPostsLoading } = postSlice.actions;
export default postSlice.reducer;
