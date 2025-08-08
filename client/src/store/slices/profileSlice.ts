import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import Config from "@/const";

export interface ProfileState {
  name: string;
  email: string;
  picture: string;
  googleIdToken: string;
  noAuth: boolean;
}

const initialState: ProfileState = {
  name: "",
  email: "",
  picture: "",
  googleIdToken: "",
  noAuth: Config.GOOGLE_CLIENT_ID ? false : true,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<ProfileState>) {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.picture = action.payload.picture;
      state.googleIdToken = action.payload.googleIdToken;
    },
    setName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    setEmail(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },
  },
});

export const { setProfile, setName, setEmail } = profileSlice.actions;
export default profileSlice.reducer;
