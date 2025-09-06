import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { markAsRead, clearNotification } from '../redux/notificationSlice';
import '../styles/Notifications.css';

const Notifications = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(state => state.notifications.items) || [];
  const [showAll, setShowAll] = useState(false);

  // Make sure notifications is always an array
  const notificationItems = Array.isArray(notifications) ? notifications : [];
  
  // Get unread notifications count
  const unreadCount = notificationItems.filter(notification => !notification.read).length;

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleClear = (id) => {
    dispatch(clearNotification(id));
  };

  const handleMarkAllAsRead = () => {
    notificationItems.forEach(notification => {
      if (!notification.read) {
        dispatch(markAsRead(notification.id));
      }
    });
  };

  // Filter notifications based on showAll toggle
  const displayedNotifications = showAll 
    ? notificationItems 
    : notificationItems.filter(notification => !notification.read);

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h3>Notifications {unreadCount > 0 && <span className="badge">{unreadCount}</span>}</h3>
        <div className="notifications-actions">
          {unreadCount > 0 && (
            <button 
              className="notifications-action-btn"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
          )}
          <button 
            className="notifications-toggle-btn"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show unread' : 'Show all'}
          </button>
        </div>
      </div>
      
      <div className="notifications-list">
        {displayedNotifications.length === 0 ? (
          <div className="notification-empty">
            <p>No {showAll ? '' : 'unread'} notifications</p>
          </div>
        ) : (
          displayedNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
            >
              <div className="notification-icon">
                {notification.type === 'alert' && <i className="fas fa-exclamation-circle"></i>}
                {notification.type === 'info' && <i className="fas fa-info-circle"></i>}
                {notification.type === 'success' && <i className="fas fa-check-circle"></i>}
              </div>
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <span className="notification-time">{notification.time}</span>
              </div>
              <div className="notification-actions">
                {!notification.read && (
                  <button 
                    className="notification-btn"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <i className="fas fa-check"></i>
                  </button>
                )}
                <button 
                  className="notification-btn"
                  onClick={() => handleClear(notification.id)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;