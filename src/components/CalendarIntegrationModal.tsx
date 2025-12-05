import React from 'react';
import { X, Calendar, ExternalLink } from 'lucide-react';
import { type MeetupInvite } from '../lib/supabase';

interface CalendarIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  invite: MeetupInvite;
}

const CalendarIntegrationModal: React.FC<CalendarIntegrationModalProps> = ({
  isOpen,
  onClose,
  invite
}) => {
  if (!isOpen) return null;

  const formatDateForCalendar = (datetime: string) => {
    const date = new Date(datetime);
    // Format for calendar APIs (YYYYMMDDTHHMMSSZ)
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const createCalendarEvent = () => {
    const startTime = formatDateForCalendar(invite.datetime);
    const endDate = new Date(invite.datetime);
    endDate.setHours(endDate.getHours() + 2); // Default 2-hour duration
    const endTime = formatDateForCalendar(endDate.toISOString());

    const title = encodeURIComponent(`Meetup at ${invite.place.name}`);
    const description = encodeURIComponent(
      `Meetup with friend at ${invite.place.name}\n\n` +
      `Location: ${invite.place.address}\n` +
      (invite.message ? `Message: ${invite.message}\n` : '') +
      `\nCreated via Purely Plutonic`
    );
    const location = encodeURIComponent(`${invite.place.name}, ${invite.place.address}`);

    return {
      title,
      description,
      location,
      startTime,
      endTime
    };
  };

  const handleGoogleCalendar = () => {
    const event = createCalendarEvent();
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${event.title}&dates=${event.startTime}/${event.endTime}&details=${event.description}&location=${event.location}`;
    window.open(googleUrl, '_blank');
  };

  const handleOutlookCalendar = () => {
    const event = createCalendarEvent();
    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${event.title}&startdt=${event.startTime}&enddt=${event.endTime}&body=${event.description}&location=${event.location}`;
    window.open(outlookUrl, '_blank');
  };

  const handleAppleCalendar = () => {
    const event = createCalendarEvent();
    // Create ICS file content
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Purely Plutonic//EN
BEGIN:VEVENT
UID:${invite.id}@purelyplutonic.com
DTSTAMP:${formatDateForCalendar(new Date().toISOString())}
DTSTART:${event.startTime}
DTEND:${event.endTime}
SUMMARY:${decodeURIComponent(event.title)}
DESCRIPTION:${decodeURIComponent(event.description)}
LOCATION:${decodeURIComponent(event.location)}
END:VEVENT
END:VCALENDAR`;

    // Create and download ICS file
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meetup-${invite.place.name.replace(/\s+/g, '-').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAddEvent = () => {
    const event = createCalendarEvent();
    // Use AddEvent service for universal calendar integration
    const addEventUrl = `https://www.addevent.com/dir/?client=purelyplutonic&start=${event.startTime}&end=${event.endTime}&title=${event.title}&description=${event.description}&location=${event.location}`;
    window.open(addEventUrl, '_blank');
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

  const { date, time } = formatDateTime(invite.datetime);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-2 mr-3">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">🎉 It's a date!</h2>
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
            Want to add this meetup to your calendar?
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">{invite.place.name}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>{invite.place.address}</p>
              <p>{date}</p>
              <p>{time}</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoogleCalendar}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Add to Google Calendar
            </button>

            <button
              onClick={handleAppleCalendar}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Add to Apple Calendar
            </button>

            <button
              onClick={handleOutlookCalendar}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="#0078D4">
                <path d="M7 18h10v-2H7v2zM7 14h10v-2H7v2zM7 10h10V8H7v2zM7 6h10V4H7v2z"/>
              </svg>
              Add to Outlook
            </button>

            <button
              onClick={handleAddEvent}
              className="w-full flex items-center justify-center px-4 py-3 border border-purple-600 rounded-md text-purple-600 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <ExternalLink className="h-5 w-5 mr-3" />
              Universal Calendar
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarIntegrationModal;