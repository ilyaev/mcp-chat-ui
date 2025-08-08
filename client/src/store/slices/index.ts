import { combineReducers } from "@reduxjs/toolkit";
import profileSlice from "./profileSlice";
import chatSessionSlice from "./chatSessionSlice";

const rootReducer = combineReducers({
  profile: profileSlice,
  chatSession: chatSessionSlice,
});

export default rootReducer;
