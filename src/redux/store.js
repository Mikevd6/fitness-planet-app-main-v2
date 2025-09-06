import { configureStore } from '@reduxjs/toolkit';
import notificationReducer from './notificationSlice';
// Import your other reducers here

export const store = configureStore({
  reducer: {
    notifications: notificationReducer,
    // Add your other reducers here
  }
});

export default store;