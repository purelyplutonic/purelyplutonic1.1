import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { PushNotificationService } from '../services/pushNotifications';

export type Notification = {
  id: string;
  type: 'match' | 'superLike' | 'message';
  content: string;
  relatedUserId?: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
};

type NotificationStore = {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  initializeRealtime: (userId: string) => () => void;
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));

    // Show browser notification if supported
    if (Notification.permission === 'granted') {
      new Notification(notification.content);
    }
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: state.unreadCount - 1,
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  initializeRealtime: (userId) => {
    // Subscribe to matches
    const matchesSubscription = supabase
      .channel('matches')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `user2_id=eq.${userId}`,
        },
        async (payload) => {
          const match = payload.new as any;
          
          // Fetch user details
          const { data: user } = await supabase
            .from('users')
            .select('name')
            .eq('id', match.user1_id)
            .single();

          if (user) {
            const content = match.is_super_like
              ? `${user.name} Super Liked you!`
              : `${user.name} liked you!`;

            const notification: Notification = {
              id: `match-${match.id}`,
              type: match.is_super_like ? 'superLike' : 'match',
              content,
              relatedUserId: match.user1_id,
              timestamp: new Date(),
              isRead: false,
              actionUrl: `/matches`,
            };

            get().addNotification(notification);

            // Send push notification
            PushNotificationService.sendPushNotification(
              [match.user2_id],
              match.is_super_like ? 'New Super Like!' : 'New Match!',
              content,
              { matchId: match.id, type: 'match' }
            ).catch(err => console.error('Failed to send push notification:', err));
          }
        }
      )
      .subscribe();

    // Subscribe to messages
    const messagesSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=neq.${userId}`,
        },
        async (payload) => {
          const message = payload.new as any;
          
          // Fetch sender details
          const { data: sender } = await supabase
            .from('users')
            .select('name')
            .eq('id', message.sender_id)
            .single();

          if (sender) {
            const content = `New message from ${sender.name}`;

            const notification: Notification = {
              id: `message-${message.id}`,
              type: 'message',
              content,
              relatedUserId: message.sender_id,
              timestamp: new Date(),
              isRead: false,
              actionUrl: `/messages/${message.match_id}`,
            };

            get().addNotification(notification);

            // Get receiver ID from match
            const { data: matchData } = await supabase
              .from('matches')
              .select('user1_id, user2_id')
              .eq('id', message.match_id)
              .single();

            if (matchData) {
              const receiverId = matchData.user1_id === message.sender_id
                ? matchData.user2_id
                : matchData.user1_id;

              // Send push notification
              PushNotificationService.sendPushNotification(
                [receiverId],
                'New Message',
                `${sender.name}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`,
                { matchId: message.match_id, messageId: message.id, type: 'message' }
              ).catch(err => console.error('Failed to send push notification:', err));
            }
          }
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      supabase.removeChannel(matchesSubscription);
      supabase.removeChannel(messagesSubscription);
    };
  },
}));