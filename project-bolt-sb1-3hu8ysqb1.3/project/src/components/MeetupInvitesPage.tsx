import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Check, 
  X, 
  Edit, 
  ExternalLink,
  User,
  MessageCircle
} from 'lucide-react';
import { 
  getUserMeetupInvites, 
  updateMeetupInviteStatus, 
  proposeMeetupTimeChange,
  acceptProposedTime,
  type MeetupInvite 
} from '../lib/supabase';
import CalendarIntegrationModal from './CalendarIntegrationModal';
import ProposeTimeModal from './ProposeTimeModal';
import LoadingSpinner from './LoadingSpinner';

// Demo meetup invites data
const demoMeetupInvites: MeetupInvite[] = [
  {
    id: 'invite-1',
    sender_id: 'mike-chen',
    receiver_id: 'demo-user',
    match_id: 'match-1',
    place: {
      name: 'Central Park Cafe',
      address: '123 Park Ave, New York, NY',
      type: 'cafe'
    },
    datetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    message: 'Would love to grab coffee and chat about our shared interests!',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sender: {
      id: 'mike-chen',
      name: 'Mike Chen',
      profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    receiver: {
      id: 'demo-user',
      name: 'Demo User',
      profile_picture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    id: 'invite-2',
    sender_id: 'demo-user',
    receiver_id: 'sarah-johnson',
    match_id: 'match-2',
    place: {
      name: 'Brooklyn Bridge Park',
      address: 'Brooklyn Bridge Park, Brooklyn, NY',
      type: 'park'
    },
    datetime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    message: 'Perfect weather for a walk in the park!',
    status: 'accepted',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sender: {
      id: 'demo-user',
      name: 'Demo User',
      profile_picture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    receiver: {
      id: 'sarah-johnson',
      name: 'Sarah Johnson',
      profile_picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    }
  }
];

const MeetupInvitesPage: React.FC = () => {
  const { currentUser } = useUser();
  const [invites, setInvites] = useState<MeetupInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvite, setSelectedInvite] = useState<MeetupInvite | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showProposeTimeModal, setShowProposeTimeModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  useEffect(() => {
    if (currentUser) {
      loadInvites();
    }
  }, [currentUser]);

  const loadInvites = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      // Use demo data instead of Supabase to avoid fetch errors
      if (currentUser.email === 'demo@test.com') {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setInvites(demoMeetupInvites);
      } else {
        const data = await getUserMeetupInvites(currentUser.id);
        setInvites(data || []);
      }
    } catch (err) {
      console.error('Error loading invites:', err);
      setError('Failed to load meetup invites. Using demo mode - please use demo@test.com to sign in.');
      // Fallback to demo data
      setInvites(demoMeetupInvites);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invite: MeetupInvite) => {
    try {
      if (currentUser?.email === 'demo@test.com') {
        // Update demo data locally
        setInvites(prev => prev.map(inv => 
          inv.id === invite.id ? { ...inv, status: 'accepted' } : inv
        ));
      } else {
        await updateMeetupInviteStatus(invite.id, 'accepted');
      }
      setSelectedInvite(invite);
      setShowCalendarModal(true);
      if (currentUser?.email !== 'demo@test.com') {
        await loadInvites();
      }
    } catch (err) {
      console.error('Error accepting invite:', err);
      setError('Failed to accept invite');
    }
  };

  const handleDecline = async (inviteId: string) => {
    try {
      if (currentUser?.email === 'demo@test.com') {
        // Update demo data locally
        setInvites(prev => prev.map(inv => 
          inv.id === inviteId ? { ...inv, status: 'declined' } : inv
        ));
      } else {
        await updateMeetupInviteStatus(inviteId, 'declined');
        await loadInvites();
      }
    } catch (err) {
      console.error('Error declining invite:', err);
      setError('Failed to decline invite');
    }
  };

  const handleProposeTime = (invite: MeetupInvite) => {
    setSelectedInvite(invite);
    setShowProposeTimeModal(true);
  };

  const handleAcceptProposedTime = async (inviteId: string) => {
    try {
      if (currentUser?.email === 'demo@test.com') {
        // Update demo data locally
        setInvites(prev => prev.map(inv => 
          inv.id === inviteId ? { 
            ...inv, 
            status: 'accepted',
            datetime: inv.proposed_datetime || inv.datetime,
            proposed_datetime: undefined
          } : inv
        ));
      } else {
        await acceptProposedTime(inviteId);
        await loadInvites();
      }
    } catch (err) {
      console.error('Error accepting proposed time:', err);
      setError('Failed to accept proposed time');
    }
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'proposed_change':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'declined':
        return 'Declined';
      case 'proposed_change':
        return 'Time Change Proposed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const receivedInvites = invites.filter(invite => invite.receiver_id === currentUser?.id);
  const sentInvites = invites.filter(invite => invite.sender_id === currentUser?.id);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner text="Loading meetup invites..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">Meetup Invites</h2>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('received')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'received'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Received ({receivedInvites.length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'sent'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sent ({sentInvites.length})
            </button>
          </nav>
        </div>

        {/* Invites List */}
        <div className="divide-y divide-gray-200">
          {(activeTab === 'received' ? receivedInvites : sentInvites).length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {activeTab} invites
              </h3>
              <p className="text-gray-500">
                {activeTab === 'received' 
                  ? "You haven't received any meetup invites yet."
                  : "You haven't sent any meetup invites yet."}
              </p>
            </div>
          ) : (
            (activeTab === 'received' ? receivedInvites : sentInvites).map((invite) => {
              const { date, time } = formatDateTime(invite.datetime);
              const proposedTime = invite.proposed_datetime ? formatDateTime(invite.proposed_datetime) : null;
              
              return (
                <div key={invite.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">
                          {activeTab === 'received' ? 'From' : 'To'}: {invite.sender?.name || invite.receiver?.name}
                        </span>
                        <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invite.status)}`}>
                          {getStatusText(invite.status)}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <div>
                            <span className="font-medium">{invite.place.name}</span>
                            <span className="text-gray-500 ml-1">• {invite.place.address}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{date}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{time}</span>
                        </div>

                        {proposedTime && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-800 mb-1">Proposed New Time:</p>
                            <div className="flex items-center text-sm text-blue-700">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{proposedTime.date} at {proposedTime.time}</span>
                            </div>
                          </div>
                        )}

                        {invite.message && (
                          <div className="flex items-start text-sm text-gray-600">
                            <MessageCircle className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                            <span>"{invite.message}"</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {activeTab === 'received' && invite.status === 'pending' && (
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleAccept(invite)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleDecline(invite.id)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Decline
                          </button>
                          <button
                            onClick={() => handleProposeTime(invite)}
                            className="inline-flex items-center px-3 py-2 border border-purple-600 text-sm leading-4 font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Propose New Time
                          </button>
                        </div>
                      )}

                      {activeTab === 'sent' && invite.status === 'proposed_change' && (
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleAcceptProposedTime(invite.id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept New Time
                          </button>
                          <button
                            onClick={() => handleDecline(invite.id)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Decline
                          </button>
                        </div>
                      )}

                      {invite.status === 'accepted' && (
                        <button
                          onClick={() => {
                            setSelectedInvite(invite);
                            setShowCalendarModal(true);
                          }}
                          className="inline-flex items-center px-3 py-2 border border-purple-600 text-sm leading-4 font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Add to Calendar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Calendar Integration Modal */}
      {selectedInvite && (
        <CalendarIntegrationModal
          isOpen={showCalendarModal}
          onClose={() => {
            setShowCalendarModal(false);
            setSelectedInvite(null);
          }}
          invite={selectedInvite}
        />
      )}

      {/* Propose Time Modal */}
      {selectedInvite && (
        <ProposeTimeModal
          isOpen={showProposeTimeModal}
          onClose={() => {
            setShowProposeTimeModal(false);
            setSelectedInvite(null);
          }}
          invite={selectedInvite}
          onSuccess={() => {
            setShowProposeTimeModal(false);
            setSelectedInvite(null);
            loadInvites();
          }}
        />
      )}
    </div>
  );
};

export default MeetupInvitesPage;