import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { ArrowLeft, Send, Smile, MessageCircle } from 'lucide-react';

const MessagesPage: React.FC = () => {
  const { conversations, messages, sendMessage, acceptedMatches } = useUser();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sort conversations by most recent message
  const sortedConversations = [...conversations].sort((a, b) => {
    const aLastMessage = messages[a.id]?.length ? messages[a.id][messages[a.id].length - 1].timestamp : new Date(0);
    const bLastMessage = messages[b.id]?.length ? messages[b.id][messages[b.id].length - 1].timestamp : new Date(0);
    return bLastMessage.getTime() - aLastMessage.getTime();
  });

  // Get new matches (conversations with no messages)
  const newMatches = sortedConversations.filter(c => !messages[c.id]?.length);

  // Scroll to bottom of messages when new message is sent
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation, messages]);

  const handleSendMessage = () => {
    if (selectedConversation && messageInput.trim()) {
      sendMessage(selectedConversation, messageInput);
      setMessageInput('');
    }
  };

  const getMatchFromConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return null;
    
    const matchId = conversation.participants.find(p => p !== 'user1');
    if (!matchId) return null;
    
    return acceptedMatches.find(m => m.id === matchId);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex h-[calc(100vh-12rem)]">
          {/* Conversations List */}
          <div className={`w-full md:w-1/3 border-r border-gray-200 ${selectedConversation ? 'hidden md:block' : ''}`}>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
            </div>
            
            {/* New Matches Section */}
            {newMatches.length > 0 && (
              <div className="p-4 border-b border-gray-200 bg-purple-50">
                <h3 className="text-sm font-medium text-purple-800 mb-3">New Matches</h3>
                <p className="text-xs text-purple-600 mb-3">Start a conversation with your new friends!</p>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {newMatches.map(conversation => {
                    const match = getMatchFromConversation(conversation.id);
                    return (
                      <button
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation.id)}
                        className="flex flex-col items-center min-w-[4rem]"
                      >
                        <div className="relative">
                          {match?.profilePicture ? (
                            <img 
                              src={match.profilePicture} 
                              alt={match.name} 
                              className="h-12 w-12 rounded-full object-cover border-2 border-purple-400"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center border-2 border-purple-400">
                              <span className="text-lg font-bold text-white">{match?.name.charAt(0)}</span>
                            </div>
                          )}
                          {match?.isOnline && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white"></div>
                          )}
                        </div>
                        <span className="text-xs mt-1 truncate max-w-[4rem]">{match?.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Conversations List */}
            <div className="overflow-y-auto h-[calc(100%-8rem)]">
              {sortedConversations
                .filter(c => messages[c.id]?.length > 0)
                .map(conversation => {
                  const match = getMatchFromConversation(conversation.id);
                  const conversationMessages = messages[conversation.id] || [];
                  const lastMessage = conversationMessages.length > 0 
                    ? conversationMessages[conversationMessages.length - 1] 
                    : null;
                  
                  return (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`w-full text-left p-4 border-b border-gray-200 hover:bg-gray-50 flex items-center ${
                        selectedConversation === conversation.id ? 'bg-purple-50' : ''
                      } ${conversation.isNew ? 'bg-blue-50' : ''}`}
                    >
                      <div className="relative mr-3">
                        {match?.profilePicture ? (
                          <img 
                            src={match.profilePicture} 
                            alt={match.name} 
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center">
                            <span className="text-lg font-bold text-white">{match?.name.charAt(0)}</span>
                          </div>
                        )}
                        {match?.isOnline && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{match?.name}</h3>
                          {lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatTime(lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        {lastMessage && (
                          <p className={`text-sm truncate ${
                            conversation.isNew && lastMessage.senderId !== 'user1' 
                              ? 'font-semibold text-gray-900' 
                              : 'text-gray-500'
                          }`}>
                            {lastMessage.senderId === 'user1' ? 'You: ' : ''}{lastMessage.content}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
          
          {/* Chat Window */}
          {selectedConversation ? (
            <div className="w-full md:w-2/3 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center">
                <button 
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden mr-2 text-gray-500"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                
                {(() => {
                  const match = getMatchFromConversation(selectedConversation);
                  return (
                    <div className="flex items-center">
                      <div className="relative mr-3">
                        {match?.profilePicture ? (
                          <img 
                            src={match.profilePicture} 
                            alt={match.name} 
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center">
                            <span className="text-lg font-bold text-white">{match?.name.charAt(0)}</span>
                          </div>
                        )}
                        {match?.isOnline && (
                          <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-white"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{match?.name}</h3>
                        <p className="text-xs text-gray-500">
                          {match?.isOnline ? 'Online now' : match?.lastActive ? `Last active ${formatTimeAgo(match.lastActive)}` : ''}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {(() => {
                  const conversationMessages = messages[selectedConversation] || [];
                  let lastDate: string | null = null;
                  
                  return (
                    <>
                      {conversationMessages.map((message, index) => {
                        const isCurrentUser = message.senderId === 'user1';
                        const messageDate = formatDate(message.timestamp);
                        const showDateDivider = messageDate !== lastDate;
                        lastDate = messageDate;
                        
                        return (
                          <React.Fragment key={message.id}>
                            {showDateDivider && (
                              <div className="flex justify-center my-4">
                                <span className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-full">
                                  {messageDate}
                                </span>
                              </div>
                            )}
                            <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
                              <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                isCurrentUser 
                                  ? 'bg-purple-600 text-white rounded-br-none' 
                                  : 'bg-white text-gray-800 rounded-bl-none shadow'
                              }`}>
                                <p className="text-sm">{message.content}</p>
                                <span className={`text-xs ${isCurrentUser ? 'text-purple-200' : 'text-gray-500'} block text-right mt-1`}>
                                  {formatTime(message.timestamp)}
                                </span>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  );
                })()}
              </div>
              
              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 flex">
                <button className="text-gray-500 hover:text-gray-700 mr-2">
                  <Smile className="h-6 w-6" />
                </button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className={`ml-2 rounded-full p-2 ${
                    messageInput.trim() 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex md:w-2/3 items-center justify-center bg-gray-50">
              <div className="text-center p-8">
                <div className="mx-auto h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your Messages</h3>
                <p className="text-gray-500 max-w-md">
                  Select a conversation from the list to start chatting, or match with new friends to begin a conversation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
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
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export default MessagesPage;