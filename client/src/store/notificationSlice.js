import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
  },
  reducers: {
    addNotification: (state, action) => {
      const newNotif = {
        id: Date.now() + Math.random(),
        isRead: false,
        timestamp: new Date().toISOString(),
        ...action.payload,
      };
      state.items.unshift(newNotif);
      state.unreadCount += 1;
    },
    markAllAsRead: (state) => {
      state.items.forEach((item) => {
        item.isRead = true;
      });
      state.unreadCount = 0;
    },
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
  },
});

export const { addNotification, markAllAsRead, clearNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;
