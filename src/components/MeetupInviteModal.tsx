import React, { useState } from 'react';
import { X, MapPin, Calendar, Clock, Send, Search } from 'lucide-react';
import { Match } from '../context/UserContext';
import { createMeetupInvite } from '../lib/supabase';
import { useUser } from '../context/UserContext';

interface MeetupInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  onSuccess: () => void;
}

// Predefined places for quick selection
const predefinedPlaces = [
  { name: 'Starbucks Coffee', type: 'café', address: 'Various locations' },
  { name: 'Central Park', type: 'park', address: 'New York, NY' },
  { name: 'Local Library', type: 'library', address: 'Community center' },
  { name: 'Barnes & Noble', type: 'bookstore', address: 'Various locations' },
  { name: 'Whole Foods Market', type: 'grocery', address: 'Various locations' },
  { name: 'Local Gym', type: 'fitness', address: 'Fitness center' },
  { name: 'Art Museum', type: 'museum', address: 'Cultural district' },
  { name: 'Food Court', type: 'restaurant', address: 'Shopping mall' },
  { name: 'Public Beach', type: 'outdoor', address: 'Waterfront area' },
  { name: 'Bowling Alley', type: 'entertainment', address: 'Recreation center' }
];

const MeetupInviteModal: React.FC<MeetupInviteModalProps> = ({
  isOpen,
  onClose,
  match,
  onSuccess
}) => {
  const { currentUser } = useUser();
  const [step, setStep] = useState(1);
  const [selectedPlace, setSelectedPlace] = useState<{ name: string; address: string; type: string } | null>(null);
  const [customPlace, setCustomPlace] = useState({ name: '', address: '', type: 'other' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter places based on search query
  const filteredPlaces = predefinedPlaces.filter(place =>
    place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlaceSelect = (place: { name: string; address: string; type: string }) => {
    setSelectedPlace(place);
    setCustomPlace({ name: '', address: '', type: 'other' });
  };

  const handleCustomPlaceSubmit = () => {
    if (customPlace.name && customPlace.address) {
      setSelectedPlace(customPlace);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser || !selectedPlace || !selectedDate || !selectedTime) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Combine date and time
      const datetime = new Date(`${selectedDate}T${selectedTime}`);

      // Create the meetup invite
      await createMeetupInvite({
        sender_id: currentUser.id,
        receiver_id: match.id,
        match_id: match.id, // Assuming match.id corresponds to a match record
        place: selectedPlace,
        datetime: datetime.toISOString(),
        message: message.trim() || undefined,
        status: 'pending'
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating meetup invite:', err);
      setError(err instanceof Error ? err.message : 'Failed to send invite');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedPlace(null);
    setCustomPlace({ name: '', address: '', type: 'other' });
    setSearchQuery('');
    setSelectedDate('');
    setSelectedTime('');
    setMessage('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Invite {match.name} to Meet Up
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Step indicator */}
        <div className="flex justify-between mb-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                i === step
                  ? 'bg-purple-600 text-white'
                  : i < step
                  ? 'bg-purple-200 text-purple-800'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {i}
            </div>
          ))}
        </div>

        {/* Step 1: Choose Place */}
        {step === 1 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Choose a Place</h3>
            
            {/* Search */}
            <div className="relative mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a place..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Predefined places */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Places</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredPlaces.map((place, index) => (
                  <button
                    key={index}
                    onClick={() => handlePlaceSelect(place)}
                    className={`w-full text-left p-3 border rounded-md hover:bg-gray-50 ${
                      selectedPlace?.name === place.name
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="font-medium text-gray-900">{place.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{place.type} • {place.address}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom place */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Add Custom Place</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  value={customPlace.name}
                  onChange={(e) => setCustomPlace({ ...customPlace, name: e.target.value })}
                  placeholder="Place name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
                <input
                  type="text"
                  value={customPlace.address}
                  onChange={(e) => setCustomPlace({ ...customPlace, address: e.target.value })}
                  placeholder="Address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
                <button
                  onClick={handleCustomPlaceSubmit}
                  disabled={!customPlace.name || !customPlace.address}
                  className={`w-full py-2 px-4 rounded-md ${
                    customPlace.name && customPlace.address
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Add Custom Place
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Choose Date & Time */}
        {step === 2 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pick Date & Time</h3>
            
            {selectedPlace && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <p className="font-medium text-gray-900">{selectedPlace.name}</p>
                    <p className="text-sm text-gray-500">{selectedPlace.address}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={today}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Add Message */}
        {step === 3 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add a Message (Optional)</h3>
            
            {/* Summary */}
            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">Meetup Details</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{selectedPlace?.name}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{new Date(selectedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{selectedTime}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personal Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal note to your invite..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {message.length}/200 characters
              </p>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !selectedPlace) ||
                (step === 2 && (!selectedDate || !selectedTime))
              }
              className={`px-4 py-2 rounded-md ${
                (step === 1 && selectedPlace) || (step === 2 && selectedDate && selectedTime)
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedPlace || !selectedDate || !selectedTime}
              className={`flex items-center px-4 py-2 rounded-md ${
                !isSubmitting && selectedPlace && selectedDate && selectedTime
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invite
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetupInviteModal;