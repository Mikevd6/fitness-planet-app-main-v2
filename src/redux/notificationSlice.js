import { createSlice } from '@reduxjs/toolkit';

// Initial state with proper array structure
const initialState = {
  items: []
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.items.push({
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString(),
        read: false,
        ...action.payload
      });
    },
    markAsRead: (state, action) => {
      const notification = state.items.find(item => item.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    clearNotification: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.items = [];
    }
  }
});

export const { addNotification, markAsRead, clearNotification, clearAllNotifications } = notificationSlice.actions;

export default notificationSlice.reducer;