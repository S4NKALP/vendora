import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  getNotifications,
  markNotificationAsRead as markNotificationAsReadApi,
  deleteNotification as deleteNotificationApi,
  clearAllNotifications as clearAllNotificationsApi,
} from '../api';
import axios from 'axios';
import { API_URL } from '../config';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await markNotificationAsReadApi(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const clearNotification = async (notificationId) => {
    try {
      await deleteNotificationApi(notificationId);
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const clearAllNotifications = async () => {
    try {
      await clearAllNotificationsApi();
      setNotifications([]);
    } catch (err) {
      console.error('Error clearing notifications:', err);
      Alert.alert('Error', 'Failed to clear notifications');
    }
  };

  const getUnreadCount = () => {
    return notifications.filter((notification) => !notification.read).length;
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        clearNotification,
        clearAllNotifications,
        getUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext; 