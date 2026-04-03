import { configureStore } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";

// Reducer
export const store = configureStore({
  reducer: {

  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persist = persistStore(store);
export default store;