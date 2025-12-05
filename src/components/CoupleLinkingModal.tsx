import React, { useState, useEffect } from 'react';
import { X, Heart, Users, Mail, Loader, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';

interface CoupleLinkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PendingRequest {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  status: 'married' | 'couple';
  isIncoming: boolean;
}

const CoupleLinkingModal: React.FC<CoupleLinkingModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser } = useUser();
  const [step, setStep] = useState<'menu' | 'send' | 'pending'>('menu');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [relationshipStatus, setRelationshipStatus] = useState<'married' | 'couple'>('couple');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadPendingRequests();
    }
  }, [isOpen]);

  const loadPendingRequests = async () => {
    if (!currentUser) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data, error } = await supabase
        .from('couples')
        .select('*')
        .or(`user1_id.eq.${session.session.user.id},user2_id.eq.${session.session.user.id}`)
        .eq('confirmed', false);

      if (error) throw error;

      if (data && data.length > 0) {
        const requests = await Promise.all(
          data.map(async (couple) => {
            const isUser1 = couple.user1_id === session.session.user.id;
            const partnerId = isUser1 ? couple.user2_id : couple.user1_id;
            const isIncoming = couple.pending_user_id !== session.session.user.id;

            const { data: partnerData } = await supabase
              .from('profiles')
              .select('name, email')
              .eq('id', partnerId)
              .maybeSingle();

            return {
              id: couple.id,
              partnerId,
              partnerName: partnerData?.name || 'Unknown',
              partnerEmail: partnerData?.email || '',
              status: couple.status,
              isIncoming,
            };
          })
        );

        setPendingRequests(requests);
        if (requests.length > 0) {
          setStep('pending');
        }
      }
    } catch (err) {
      console.error('Error loading pending requests:', err);
    }
  };

  const sendLinkRequest = async () => {
    if (!currentUser || !partnerEmail.trim()) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      const { data: partnerData, error: partnerError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', partnerEmail.trim().toLowerCase())
        .maybeSingle();

      if (partnerError) throw partnerError;
      if (!partnerData) {
        setError('No user found with that email address');
        setIsLoading(false);
        return;
      }

      if (partnerData.id === session.session.user.id) {
        setError('You cannot link your account with yourself');
        setIsLoading(false);
        return;
      }

      const { data: existingCouple, error: checkError } = await supabase
        .from('couples')
        .select('*')
        .or(`and(user1_id.eq.${session.session.user.id},user2_id.eq.${partnerData.id}),and(user1_id.eq.${partnerData.id},user2_id.eq.${session.session.user.id})`)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existingCouple) {
        setError('A link request already exists with this user');
        setIsLoading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('couples')
        .insert({
          user1_id: session.session.user.id,
          user2_id: partnerData.id,
          status: relationshipStatus,
          pending_user_id: session.session.user.id,
          confirmed: false,
        });

      if (insertError) throw insertError;

      setPartnerEmail('');
      await loadPendingRequests();
    } catch (err: any) {
      console.error('Error sending link request:', err);
      setError(err.message || 'Failed to send link request');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmRequest = async (requestId: string) => {
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('couples')
        .update({ confirmed: true, linked_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error confirming request:', err);
      setError(err.message || 'Failed to confirm request');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelRequest = async (requestId: string) => {
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('couples')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      await loadPendingRequests();
      if (pendingRequests.length <= 1) {
        setStep('menu');
      }
    } catch (err: any) {
      console.error('Error canceling request:', err);
      setError(err.message || 'Failed to cancel request');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>

          {step === 'menu' && (
            <>
              <div className="flex items-center mb-6">
                <Heart className="h-6 w-6 text-rose-500 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">Link Accounts</h2>
              </div>

              <p className="text-gray-600 mb-6">
                Connect your account with your partner to show you're in a relationship together
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => setStep('send')}
                  className="w-full flex items-center justify-center px-4 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Send Link Request
                </button>

                {pendingRequests.length > 0 && (
                  <button
                    onClick={() => setStep('pending')}
                    className="w-full flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    <Users className="h-5 w-5 mr-2" />
                    View Pending Requests ({pendingRequests.length})
                  </button>
                )}
              </div>
            </>
          )}

          {step === 'send' && (
            <>
              <button
                onClick={() => setStep('menu')}
                className="text-sm text-gray-600 hover:text-gray-800 mb-4"
              >
                ← Back
              </button>

              <div className="flex items-center mb-6">
                <Mail className="h-6 w-6 text-rose-500 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">Send Link Request</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partner's Email
                  </label>
                  <input
                    type="email"
                    value={partnerEmail}
                    onChange={(e) => setPartnerEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="partner@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship Status
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setRelationshipStatus('couple')}
                      className={`px-4 py-2 rounded-lg border-2 transition ${
                        relationshipStatus === 'couple'
                          ? 'border-rose-500 bg-rose-50 text-rose-700'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      Couple
                    </button>
                    <button
                      onClick={() => setRelationshipStatus('married')}
                      className={`px-4 py-2 rounded-lg border-2 transition ${
                        relationshipStatus === 'married'
                          ? 'border-rose-500 bg-rose-50 text-rose-700'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      Married
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={sendLinkRequest}
                  disabled={isLoading || !partnerEmail.trim()}
                  className="w-full flex items-center justify-center px-4 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  {isLoading ? (
                    <>
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Send Request'
                  )}
                </button>
              </div>
            </>
          )}

          {step === 'pending' && (
            <>
              <button
                onClick={() => setStep('menu')}
                className="text-sm text-gray-600 hover:text-gray-800 mb-4"
              >
                ← Back
              </button>

              <div className="flex items-center mb-6">
                <Users className="h-6 w-6 text-blue-500 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">Pending Requests</h2>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900">{request.partnerName}</p>
                        <p className="text-sm text-gray-500">{request.partnerEmail}</p>
                        <p className="text-xs text-gray-400 mt-1 capitalize">
                          {request.isIncoming ? 'Incoming' : 'Outgoing'} • {request.status}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {request.isIncoming ? (
                        <>
                          <button
                            onClick={() => confirmRequest(request.id)}
                            disabled={isLoading}
                            className="flex-1 flex items-center justify-center px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:bg-gray-300 transition"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </button>
                          <button
                            onClick={() => cancelRequest(request.id)}
                            disabled={isLoading}
                            className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 disabled:bg-gray-100 transition"
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => cancelRequest(request.id)}
                          disabled={isLoading}
                          className="w-full px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 disabled:bg-gray-100 transition"
                        >
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoupleLinkingModal;
