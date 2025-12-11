import React from 'react';
import { Users, MessageCircle, Bell, UserCircle, Search, Calendar } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useNotificationStore } from '../stores/notificationStore';

const Navbar: React.FC = () => {
  const { 
    currentUser, 
    activeTab, 
    setActiveTab, 
    conversations
  } = useUser();
  
  const { notifications, unreadCount } = useNotificationStore();
  
  // Count conversations with new messages
  const newMessages = conversations.filter(c => c.isNew).length;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-purple-600">Purely Plutonic</h1>
          </div>
          <nav className="flex items-center space-x-6">
            <button 
              onClick={() => setActiveTab('matches')}
              className={`text-sm flex flex-col items-center transition-colors ${
                activeTab === 'matches' ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <div className={`p-1 rounded-full ${activeTab === 'matches' ? 'bg-purple-100' : ''}`}>
                <Users className="h-6 w-6" />
              </div>
              <span>Matches</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('search')}
              className={`text-sm flex flex-col items-center transition-colors ${
                activeTab === 'search' ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <div className={`p-1 rounded-full ${activeTab === 'search' ? 'bg-purple-100' : ''}`}>
                <Search className="h-6 w-6" />
              </div>
              <span>Search</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('messages')}
              className={`text-sm flex flex-col items-center relative transition-colors ${
                activeTab === 'messages' ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <div className={`p-1 rounded-full ${activeTab === 'messages' ? 'bg-purple-100' : ''}`}>
                <MessageCircle className="h-6 w-6" />
                {newMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {newMessages}
                  </span>
                )}
              </div>
              <span>Messages</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('meetups')}
              className={`text-sm flex flex-col items-center transition-colors ${
                activeTab === 'meetups' ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <div className={`p-1 rounded-full ${activeTab === 'meetups' ? 'bg-purple-100' : ''}`}>
                <Calendar className="h-6 w-6" />
              </div>
              <span>Meetups</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`text-sm flex flex-col items-center relative transition-colors ${
                activeTab === 'notifications' ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <div className={`p-1 rounded-full ${activeTab === 'notifications' ? 'bg-purple-100' : ''}`}>
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span>Notifications</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('profile')}
              className={`text-sm flex flex-col items-center transition-colors ${
                activeTab === 'profile' ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <div className={`p-1 rounded-full ${activeTab === 'profile' ? 'bg-purple-100' : ''}`}>
                {currentUser?.profilePicture ? (
                  <img 
                    src={currentUser.profilePicture} 
                    alt={currentUser.name} 
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="h-6 w-6" />
                )}
              </div>
              <span>Profile</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;