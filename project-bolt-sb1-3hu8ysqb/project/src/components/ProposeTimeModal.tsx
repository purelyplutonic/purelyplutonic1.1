import React, { useState } from 'react';
import { X, Calendar, Clock, Send } from 'lucide-react';
import { type MeetupInvite } from '../lib/supabase';
import { proposeMeetupTimeChange } from '../lib/supabase';

interface ProposeTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  invite: MeetupInvite;
  onSuccess: () => void;
}

const ProposeTimeModal: React.FC<ProposeTimeModalProps> = ({
  isOpen,
  onClose,
  invite,
  onSuccess
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Combine date and time
      const proposedDatetime = new Date(`${selectedDate}T${selectedTime}`);

      // Validate that the proposed time is in the future
      if (proposedDatetime <= new Date()) {
        setError('Please select a future date and time');
        return;
      }

      await proposeMeetupTimeChange(invite.id, proposedDatetime.toISOString());
      onSuccess();
    } catch (err) {
      console.error('Error proposing time change:', err);
      setError(err instanceof Error ? err.message : 'Failed to propose time change');
    } finally {
      setIsSubmitting(false);
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

  const originalTime = formatDateTime(invite.datetime);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Propose New Time</h2>
          <button
            onClick={onClose}
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

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Can't make it at the original time? Suggest a new time that works better for you.
          </p>

          {/* Original Time */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-gray-900 mb-2">Original Time</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <span>{originalTime.date}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                <span>{originalTime.time}</span>
              </div>
            </div>
          </div>

          {/* New Time Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proposed Date
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
                Proposed Time
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

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> The other person will receive a notification about your proposed time change and can accept or decline it.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedDate || !selectedTime}
            className={`flex items-center px-4 py-2 rounded-md ${
              !isSubmitting && selectedDate && selectedTime
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
                Propose Time
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProposeTimeModal;