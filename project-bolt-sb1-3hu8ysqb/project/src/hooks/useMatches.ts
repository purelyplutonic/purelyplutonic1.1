import { useEffect, useState } from 'react';
import { supabase, getUserMatches, createMatch, updateMatchStatus } from '../lib/supabase';
import { Match } from '../context/UserContext';

export function useMatches(userId: string | null) {
  const [dailyMatches, setDailyMatches] = useState<Match[]>([]);
  const [acceptedMatches, setAcceptedMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setDailyMatches([]);
      setAcceptedMatches([]);
      setLoading(false);
      return;
    }

    const loadMatches = async () => {
      try {
        const matches = await getUserMatches(userId);

        const pending: Match[] = [];
        const accepted: Match[] = [];

        matches.forEach((match: any) => {
          const otherUser = match.user1_id === userId ? match.user2 : match.user1;

          if (!otherUser) return;

          const matchData: Match = {
            id: match.id,
            name: otherUser.name,
            bio: otherUser.headline || '',
            gender: [],
            profilePicture: otherUser.profile_picture,
            interests: [],
            socialStyle: 'ambivert',
            compatibilityScore: 85,
            isNew: match.status === 'pending',
            isSuperLiked: match.is_super_like,
            headline: otherUser.headline,
            aboutMe: '',
            isOnline: false,
            lastActive: new Date(match.created_at)
          };

          if (match.status === 'pending' && match.user2_id === userId) {
            pending.push(matchData);
          } else if (match.status === 'accepted') {
            accepted.push(matchData);
          }
        });

        setDailyMatches(pending);
        setAcceptedMatches(accepted);
      } catch (error) {
        console.error('Error loading matches:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();

    const subscription = supabase
      .channel('matches')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `user1_id=eq.${userId},user2_id=eq.${userId}`
        },
        () => {
          loadMatches();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const acceptMatch = async (matchId: string) => {
    try {
      await updateMatchStatus(matchId, 'accepted');
      const match = dailyMatches.find(m => m.id === matchId);
      if (match) {
        setAcceptedMatches(prev => [...prev, match]);
        setDailyMatches(prev => prev.filter(m => m.id !== matchId));
      }
    } catch (error) {
      console.error('Error accepting match:', error);
    }
  };

  const declineMatch = async (matchId: string) => {
    try {
      await updateMatchStatus(matchId, 'declined');
      setDailyMatches(prev => prev.filter(m => m.id !== matchId));
    } catch (error) {
      console.error('Error declining match:', error);
    }
  };

  return {
    dailyMatches,
    acceptedMatches,
    acceptMatch,
    declineMatch,
    loading
  };
}
