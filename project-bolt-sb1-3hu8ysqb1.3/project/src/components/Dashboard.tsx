import React from 'react';
import { useUser } from '../context/UserContext';
import MatchList from './MatchList';
import FriendsList from './FriendsList';
import MessagesPage from './MessagesPage';
import NotificationsPage from './NotificationsPage';
import ProfilePage from './ProfilePage';
import LocationSearch from './LocationSearch';
import MeetupInvitesPage from './MeetupInvitesPage';
import MeetupInviteModal from './MeetupInviteModal';
import MeetupConfirmationModal from './MeetupConfirmationModal';
import ErrorBoundary from './ErrorBoundary';
import { Match } from '../context/UserContext';

const Dashboard: React.FC = () => {
  const { activeTab } = useUser();
  const [selectedMatchForMeetup, setSelectedMatchForMeetup] = React.useState<Match | null>(null);
  const [showMeetupConfirmation, setShowMeetupConfirmation] = React.useState(false);
  const [meetupDetails, setMeetupDetails] = React.useState<{
    matchName: string;
    place: { name: string; address: string; type: string };
    datetime: string;
    message?: string;
  } | null>(null);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        {activeTab === 'matches' && <MatchesTab />}
        {activeTab === 'search' && <LocationSearch />}
        {activeTab === 'messages' && <MessagesPage />}
        {activeTab === 'meetups' && <MeetupInvitesPage />}
        {activeTab === 'notifications' && <NotificationsPage />}
        {activeTab === 'profile' && <ProfilePage />}
      
        {/* Meetup Invite Modal */}
        {selectedMatchForMeetup && (
          <MeetupInviteModal
            isOpen={!!selectedMatchForMeetup}
            onClose={() => setSelectedMatchForMeetup(null)}
            match={selectedMatchForMeetup}
            onSuccess={() => {
              setMeetupDetails({
                matchName: selectedMatchForMeetup.name,
                place: { name: 'Sample Place', address: 'Sample Address', type: 'café' },
                datetime: new Date().toISOString(),
                message: 'Looking forward to meeting up!'
              });
              setSelectedMatchForMeetup(null);
              setShowMeetupConfirmation(true);
            }}
          />
        )}
      
        {/* Meetup Confirmation Modal */}
        {meetupDetails && (
          <MeetupConfirmationModal
            isOpen={showMeetupConfirmation}
            onClose={() => {
              setShowMeetupConfirmation(false);
              setMeetupDetails(null);
            }}
            matchName={meetupDetails.matchName}
            place={meetupDetails.place}
            datetime={meetupDetails.datetime}
            message={meetupDetails.message}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

const MatchesTab: React.FC = () => {
  const { dailyMatches, acceptedMatches } = useUser();
  const [activeTab, setActiveTab] = React.useState<'suggestions' | 'friends'>('suggestions');
  const [selectedMatchForMeetup, setSelectedMatchForMeetup] = React.useState<Match | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="sm:hidden">
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as 'suggestions' | 'friends')}
          >
            <option value="suggestions">Today's Suggestions</option>
            <option value="friends">My Friends</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`${
                  activeTab === 'suggestions'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Today's Suggestions
                <span className={`${
                  activeTab === 'suggestions' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-900'
                } hidden ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium md:inline-block`}>
                  {dailyMatches.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('friends')}
                className={`${
                  activeTab === 'friends'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                My Friends
                <span className={`${
                  activeTab === 'friends' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-900'
                } hidden ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium md:inline-block`}>
                  {acceptedMatches.length}
                </span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      {activeTab === 'suggestions' && <MatchList />}
      {activeTab === 'friends' && (
        <FriendsList 
          friends={acceptedMatches} 
          onInviteToMeetup={setSelectedMatchForMeetup}
        />
      )}
      
      {/* Meetup Invite Modal */}
      {selectedMatchForMeetup && (
        <MeetupInviteModal
          isOpen={!!selectedMatchForMeetup}
          onClose={() => setSelectedMatchForMeetup(null)}
          match={selectedMatchForMeetup}
          onSuccess={() => {
            setSelectedMatchForMeetup(null);
            // You could add a success notification here
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;