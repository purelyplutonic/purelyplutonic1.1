import React from 'react';
import { useUser } from '../context/UserContext';
import { Bell, UserPlus, Star, MessageCircle, Check } from 'lucide-react';
import { useNotificationStore } from '../stores/notificationStore';

const NotificationsPage: React.FC = () => {
  const { setActiveTab } = useUser();
  const { 
    notifications, 
    markAsRead: markNotificationAsRead, 
    markAllAsRead: markAllNotificationsAsRead 
  } = useNotificationStore();
  
  // Sort notifications by timestamp (newest first)
  const sortedNotifications = [...notifications].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
  
  // Group notifications by date
  const groupedNotifications: Record<string, typeof notifications> = {};
  
  sortedNotifications.forEach(notification => {
    const date = formatDate(notification.timestamp);
    if (!groupedNotifications[date]) {
      groupedNotifications[date] = [];
    }
    groupedNotifications[date].push(notification);
  });
  
  const handleNotificationClick = (notification: typeof notifications[0]) => {
    markNotificationAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.type === 'match' || notification.type === 'message') {
      setActiveTab('messages');
    } else if (notification.type === 'superLike') {
      setActiveTab('matches');
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case 'superLike':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'message':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-purple-500" />;
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
          {notifications.some(n => !n.isRead) && (
            <button 
              onClick={markAllNotificationsAsRead}
              className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
            >
              <Check className="h-4 w-4 mr-1" />
              Mark all as read
            </button>
          )}
        </div>
        
        <div className="divide-y divide-gray-200 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {Object.keys(groupedNotifications).length > 0 ? (
            Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
              <div key={date} className="p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">{date}</h3>
                <div className="space-y-3">
                  {dateNotifications.map(notification => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full text-left p-3 rounded-lg flex items-start hover:bg-gray-50 transition-colors ${
                        !notification.isRead ? 'bg-purple-50' : ''
                      }`}
                    >
                      <div className="flex-shrink-0 mr-3 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${!notification.isRead ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                          {notification.content}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimeAgo(notification.timestamp)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="ml-3 flex-shrink-0">
                          <div className="h-2 w-2 rounded-full bg-purple-600"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mx-auto h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
              <p className="text-gray-500 max-w-md text-center">
                When you receive matches, messages, or meetup invites, they'll appear here. Start connecting with friends to see notifications!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to format date
const formatDate = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  }
};

// Helper function to format time ago
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString();
};

export default NotificationsPage;