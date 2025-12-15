import React from 'react';
import { MessageCircle, Clock, Calendar } from 'lucide-react';
import { Match } from '../context/UserContext';

interface FriendsListProps {
  friends: Match[];
  onInviteToMeetup?: (friend: Match) => void;
}

const FriendsList: React.FC<FriendsListProps> = ({ friends, onInviteToMeetup }) => {
  if (friends.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900">No friends yet</h3>
        <p className="mt-2 text-sm text-gray-500">
          Accept some friend suggestions to start building your network!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {friends.map((friend) => (
        <div key={friend.id} className="bg-white rounded-lg shadow-md p-4 flex items-center">
          <div className="flex-shrink-0 mr-4 relative">
            {friend.profilePicture ? (
              <img 
                src={friend.profilePicture} 
                alt={friend.name} 
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{friend.name.charAt(0)}</span>
              </div>
            )}
            {friend.isOnline && (
              <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-400 border-2 border-white"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{friend.name}</h3>
              {friend.lastActive && (
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>
                    {friend.isOnline 
                      ? 'Online now' 
                      : `Last active ${formatLastActive(friend.lastActive)}`}
                  </span>
                </div>
              )}
            </div>
            
            {friend.headline && (
              <p className="text-sm text-gray-600 mb-1 italic">"{friend.headline}"</p>
            )}
            
            <div className="flex flex-wrap gap-2 mt-1">
              {friend.interests.slice(0, 3).map((interest) => (
                <span 
                  key={interest.id} 
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                >
                  {interest.name}
                </span>
              ))}
            </div>
          </div>
          
          <div className="ml-4 flex space-x-2">
            <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
              <MessageCircle className="h-4 w-4 mr-1" />
              Message
            </button>
            {onInviteToMeetup && (
              <button 
                onClick={() => onInviteToMeetup(friend)}
                className="inline-flex items-center px-3 py-2 border border-purple-600 text-sm leading-4 font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Meet Up
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper function to format last active time
const formatLastActive = (date: Date): string => {
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

export default FriendsList;