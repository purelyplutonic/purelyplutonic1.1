import { useEffect, useState } from 'react';
import { supabase, getMatchMessages, sendMessage as sendMessageToDb } from '../lib/supabase';
import { Message, Conversation } from '../context/UserContext';

export function useMessages(userId: string | null, acceptedMatches: any[]) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || acceptedMatches.length === 0) {
      setConversations([]);
      setMessages({});
      setLoading(false);
      return;
    }

    const loadConversations = async () => {
      try {
        const convs: Conversation[] = acceptedMatches.map(match => ({
          id: match.id,
          participants: [userId, match.id],
          isNew: false
        }));

        setConversations(convs);

        const allMessages: Record<string, Message[]> = {};

        for (const conv of convs) {
          try {
            const matchMessages = await getMatchMessages(conv.id);
            allMessages[conv.id] = matchMessages.map((msg: any) => ({
              id: msg.id,
              senderId: msg.sender_id,
              receiverId: msg.sender_id === userId ? conv.participants.find(p => p !== userId)! : userId,
              content: msg.content,
              timestamp: new Date(msg.created_at),
              isRead: msg.is_read
            }));
          } catch (error) {
            console.error(`Error loading messages for ${conv.id}:`, error);
            allMessages[conv.id] = [];
          }
        }

        setMessages(allMessages);
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();

    const subscriptions = acceptedMatches.map(match => {
      return supabase
        .channel(`messages:${match.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `match_id=eq.${match.id}`
          },
          (payload) => {
            const newMessage: Message = {
              id: payload.new.id,
              senderId: payload.new.sender_id,
              receiverId: payload.new.sender_id === userId ? match.id : userId,
              content: payload.new.content,
              timestamp: new Date(payload.new.created_at),
              isRead: payload.new.is_read
            };

            setMessages(prev => ({
              ...prev,
              [match.id]: [...(prev[match.id] || []), newMessage]
            }));
          }
        )
        .subscribe();
    });

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [userId, acceptedMatches]);

  const sendMessage = async (matchId: string, content: string) => {
    if (!userId) return;

    try {
      await sendMessageToDb(matchId, userId, content);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return {
    conversations,
    messages,
    sendMessage,
    loading
  };
}
