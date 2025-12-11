import { useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNotificationStore } from '../stores/notificationStore';
import { PushNotificationService } from '../services/pushNotifications';

export const NotificationHandler = () => {
  const { currentUser, isAuthenticated } = useUser();
  const { initializeRealtime } = useNotificationStore();

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission();
    }

    // Initialize realtime subscriptions and push notifications when user is authenticated
    if (isAuthenticated && currentUser) {
      // Initialize mobile push notifications
      PushNotificationService.initialize(currentUser.id).catch(error => {
        console.error('Failed to initialize push notifications:', error);
      });

      // Initialize realtime subscriptions
      return initializeRealtime(currentUser.id);
    }
  }, [isAuthenticated, currentUser]);

  return null;
};