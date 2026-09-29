import React, { createContext, useContext, useMemo, useReducer } from 'react';

const NotificationContext = createContext();

const initialState = {
  items: []
};

const NOTIFICATION_ACTIONS = {
  ADD_NOTIFICATION: 'notifications/addNotification',
  MARK_AS_READ: 'notifications/markAsRead',
  CLEAR_NOTIFICATION: 'notifications/clearNotification',
  CLEAR_ALL_NOTIFICATIONS: 'notifications/clearAllNotifications'
};

const notificationReducer = (state, action) => {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        items: [
          ...state.items,
          {
            id: Date.now().toString(),
            time: new Date().toLocaleTimeString(),
            read: false,
            ...action.payload
          }
        ]
      };

    case NOTIFICATION_ACTIONS.MARK_AS_READ:
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload ? { ...item, read: true } : item
        )
      };

    case NOTIFICATION_ACTIONS.CLEAR_NOTIFICATION:
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload)
      };

    case NOTIFICATION_ACTIONS.CLEAR_ALL_NOTIFICATIONS:
      return {
        ...state,
        items: []
      };

    default:
      return state;
  }
};

export const addNotification = (payload) => ({
  type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION,
  payload
});

export const markAsRead = (payload) => ({
  type: NOTIFICATION_ACTIONS.MARK_AS_READ,
  payload
});

export const clearNotification = (payload) => ({
  type: NOTIFICATION_ACTIONS.CLEAR_NOTIFICATION,
  payload
});

export const clearAllNotifications = () => ({
  type: NOTIFICATION_ACTIONS.CLEAR_ALL_NOTIFICATIONS
});

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const value = useMemo(
    () => ({
      state,
      dispatch
    }),
    [state]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }

  return context;
};

export default NotificationContext;
