import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface GameSession {
  id: string;
  hostId: string;
  participants: string[];
  state: any;
  started: boolean;
  createdAt: string;
}

export interface RealtimeMessage {
  type: 'session_created' | 'joined' | 'participant_joined' | 'participant_left' | 'state_update' | 'session_ended' | 'error';
  sessionId?: string;
  userId?: string;
  state?: any;
  message?: string;
}

export function useSupabaseRealtime(sessionId?: string, userId?: string) {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Join a game session
  const joinSession = useCallback(async (sessionId: string, userId: string) => {
    try {
      // Insert or update participant in database
      const { error } = await supabase
        .from('game_sessions')
        .upsert({
          id: sessionId,
          host_id: userId,
          participants: [userId],
          state: { started: true },
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Subscribe to real-time updates
      const channel = supabase
        .channel(`game-session-${sessionId}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'game_sessions',
            filter: `id=eq.${sessionId}`
          }, 
          (payload) => {
            console.log('Realtime update:', payload);
            
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const session = payload.new as GameSession;
              setCurrentSession(session);
              
              // Determine message type based on changes
              if (payload.eventType === 'INSERT') {
                setMessages(prev => [...prev, { type: 'session_created', sessionId }]);
              } else if (payload.eventType === 'UPDATE') {
                const oldParticipants = payload.old?.participants || [];
                const newParticipants = session.participants || [];
                
                // Check for new participants
                const newParticipant = newParticipants.find((p: string) => !oldParticipants.includes(p));
                if (newParticipant) {
                  setMessages(prev => [...prev, { 
                    type: 'participant_joined', 
                    sessionId, 
                    userId: newParticipant 
                  }]);
                }
                
                // Check for removed participants
                const leftParticipant = oldParticipants.find((p: string) => !newParticipants.includes(p));
                if (leftParticipant) {
                  setMessages(prev => [...prev, { 
                    type: 'participant_left', 
                    sessionId, 
                    userId: leftParticipant 
                  }]);
                }
                
                // State updates
                if (payload.old?.state !== session.state) {
                  setMessages(prev => [...prev, { 
                    type: 'state_update', 
                    sessionId, 
                    state: session.state 
                  }]);
                }
              }
            } else if (payload.eventType === 'DELETE') {
              setMessages(prev => [...prev, { type: 'session_ended', sessionId }]);
              setCurrentSession(null);
            }
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
          setConnected(status === 'SUBSCRIBED');
        });

      channelRef.current = channel;
      setConnected(true);
    } catch (error) {
      console.error('Error joining session:', error);
      setMessages(prev => [...prev, { 
        type: 'error', 
        message: 'Failed to join session' 
      }]);
    }
  }, []);

  // Leave a session
  const leaveSession = useCallback(async (sessionId: string, userId: string) => {
    try {
      // Remove participant from database
      const { data: session } = await supabase
        .from('game_sessions')
        .select('participants')
        .eq('id', sessionId)
        .single();

      if (session) {
        const updatedParticipants = session.participants.filter((p: string) => p !== userId);
        
        if (updatedParticipants.length === 0) {
          // Delete session if no participants left
          await supabase
            .from('game_sessions')
            .delete()
            .eq('id', sessionId);
        } else {
          // Update session with remaining participants
          await supabase
            .from('game_sessions')
            .update({ participants: updatedParticipants })
            .eq('id', sessionId);
        }
      }

      // Unsubscribe from channel
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      setConnected(false);
      setCurrentSession(null);
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  }, []);

  // Update game state
  const updateState = useCallback(async (sessionId: string, state: any) => {
    try {
      await supabase
        .from('game_sessions')
        .update({ state })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Error updating state:', error);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  return {
    connected,
    messages,
    currentSession,
    joinSession,
    leaveSession,
    updateState
  };
} 