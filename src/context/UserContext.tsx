import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useMatches } from '../hooks/useMatches';
import { useMessages } from '../hooks/useMessages';

export type Interest = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  name: string;
  gender: string[];
  lookingToMeet: string[];
  bio: string;
  headline: string;
  aboutMe: string;
  profilePicture?: string;
  interests: Interest[];
  socialStyle: 'introvert' | 'extrovert' | 'ambivert';
  email: string;
  password: string;
  confirmPassword: string;
  verificationSent: boolean;
  verified: boolean;
  lookingFor: string;
  isPremium: boolean;
  superLikesRemaining: number;
  lastResetDate: Date;
};

export type Match = {
  id: string;
  name: string;
  bio: string;
  gender: string[];
  profilePicture?: string;
  interests: Interest[];
  socialStyle: 'introvert' | 'extrovert' | 'ambivert';
  compatibilityScore: number;
  isNew: boolean;
  isSuperLiked?: boolean;
  headline?: string;
  aboutMe?: string;
  isOnline?: boolean;
  lastActive: Date;
  location?: {
    lat: number;
    lng: number;
    city?: string;
    distance?: number;
  };
  coupleStatus?: 'married' | 'couple';
};

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
};

export type Conversation = {
  id: string;
  participants: string[];
  lastMessage?: Message;
  isNew?: boolean;
};

export type Notification = {
  id: string;
  type: 'match' | 'superLike' | 'message';
  content: string;
  relatedUserId?: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
};

type UserContextType = {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  dailyMatches: Match[];
  acceptedMatches: Match[];
  acceptMatch: (matchId: string) => void;
  declineMatch: (matchId: string) => void;
  superLikeMatch: (matchId: string) => void;
  undoLastAction: () => boolean;
  superLikesRemaining: number;
  isPremium: boolean;
  upgradeToPermium: () => void;
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  sendMessage: (conversationId: string, content: string) => void;
  notifications: Notification[];
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  activeTab: 'matches' | 'messages' | 'notifications' | 'profile' | 'search';
  setActiveTab: (tab: 'matches' | 'messages' | 'notifications' | 'profile' | 'search' | 'meetups') => void;
  locationMatches: Match[];
  searchMatchesByLocation: (location: {lat: number, lng: number}, radius: number) => void;
  userLocation: {lat: number, lng: number} | null;
  setUserLocation: (location: {lat: number, lng: number} | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [superLikesRemaining, setSuperLikesRemaining] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'matches' | 'messages' | 'notifications' | 'profile' | 'search' | 'meetups'>('matches');
  const [locationMatches, setLocationMatches] = useState<Match[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  const { dailyMatches, acceptedMatches, acceptMatch: acceptMatchDb, declineMatch: declineMatchDb } = useMatches(currentUser?.id || null);
  const { conversations, messages, sendMessage: sendMessageDb } = useMessages(currentUser?.id || null, acceptedMatches);

  React.useEffect(() => {
    if (currentUser) {
      setIsPremium(false);
      setSuperLikesRemaining(1);
    }
  }, [currentUser]);

  const acceptMatch = (matchId: string) => {
    acceptMatchDb(matchId);
  };

  const declineMatch = (matchId: string) => {
    declineMatchDb(matchId);
  };

  const superLikeMatch = (matchId: string) => {
    if (superLikesRemaining > 0 || isPremium) {
      acceptMatchDb(matchId);
      if (!isPremium) {
        setSuperLikesRemaining(prev => prev - 1);
      }
    }
  };

  const undoLastAction = () => {
    return isPremium;
  };

  const upgradeToPermium = () => {
    setIsPremium(true);
    setSuperLikesRemaining(999);
  };

  const sendMessage = (conversationId: string, content: string) => {
    sendMessageDb(conversationId, content);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const searchMatchesByLocation = (location: {lat: number, lng: number}, radius: number) => {
    // This would normally search for matches near the location
    setLocationMatches([]);
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      setCurrentUser,
      isAuthenticated,
      setIsAuthenticated,
      dailyMatches,
      acceptedMatches,
      acceptMatch,
      declineMatch,
      superLikeMatch,
      undoLastAction,
      superLikesRemaining,
      isPremium,
      upgradeToPermium,
      conversations,
      messages,
      sendMessage,
      notifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      activeTab,
      setActiveTab,
      locationMatches,
      searchMatchesByLocation,
      userLocation,
      setUserLocation
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};