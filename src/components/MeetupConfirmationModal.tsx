import React from 'react';
import { Check, MapPin, Calendar, Clock, X } from 'lucide-react';

interface MeetupConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchName: string;
  place: {
    name: string;
    address: string;
    type: string;
  };
  datetime: string;
  message?: string;
}

const MeetupConfirmationModal: React.FC<MeetupConfirmationModalProps> = ({
  isOpen,
  onClose,
  matchName,
  place,
  datetime,
  message
}) => {
  if (!isOpen) return null;

  const date = new Date(datetime);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-2 mr-3">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Invite Sent!</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Your meetup invitation has been sent to <span className="font-medium">{matchName}</span>. 
            They'll receive a notification and can accept or decline your invite.
          </p>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Meetup Details</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{place.name}</p>
                  <p className="text-gray-500">{place.address}</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <span>{date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                <span>{date.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}</span>
              </div>
            </div>
            
            {message && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Your message:</span> "{message}"
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Safety Tip:</strong> Always meet in public places and let someone know where you're going. 
                Trust your instincts and prioritize your safety.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetupConfirmationModal;