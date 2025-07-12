import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useSupabaseRealtime(tableName: string, filter?: string) {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // Create a unique channel name
    const channelName = `${tableName}-${filter || 'all'}-${Date.now()}`;
    
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    // Subscribe to all changes on the table
    channel
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: tableName,
        filter: filter
      }, (payload) => {
        console.log('Real-time update received:', payload);
        setMessages((prev) => [...prev, payload]);
      })
      .on('presence', { event: 'sync' }, () => {
        console.log('Presence sync');
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('Presence join:', key, newPresences);
        setConnected(true);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('Presence leave:', key, leftPresences);
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
        setConnected(status === 'SUBSCRIBED');
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [tableName, filter]);

  const send = useCallback(async (data: any) => {
    try {
      // For attendance records, insert into the database
      if (tableName === 'attendance_records') {
        const { data: result, error } = await supabase
          .from('attendance_records')
          .insert(data)
          .select()
          .single();
        
        if (error) throw error;
        return result;
      }
      
      // For other tables, you can add specific logic here
      console.log('Sending data:', data);
    } catch (error) {
      console.error('Error sending data:', error);
      throw error;
    }
  }, [tableName]);

  return { connected, messages, send };
}

// Specialized hook for attendance tracking
export function useAttendanceRealtime(classId: number) {
  const [attendanceUpdates, setAttendanceUpdates] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channelName = `attendance-${classId}-${Date.now()}`;
    
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    channel
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'attendance_records',
        filter: `class_id=eq.${classId}`
      }, (payload) => {
        console.log('Attendance update:', payload);
        setAttendanceUpdates((prev) => [...prev, payload]);
      })
      .subscribe((status) => {
        console.log('Attendance subscription status:', status);
        setConnected(status === 'SUBSCRIBED');
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [classId]);

  const markAttendance = useCallback(async (studentId: number, status: string, date: Date = new Date()) => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .insert({
          student_id: studentId,
          class_id: classId,
          status: status,
          date: date.toISOString(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  }, [classId]);

  const updateAttendance = useCallback(async (recordId: number, status: string) => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', recordId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  }, []);

  return { 
    connected, 
    attendanceUpdates, 
    markAttendance, 
    updateAttendance 
  };
}

// Specialized hook for game sessions
export function useGameSessionRealtime(sessionId: string) {
  const [gameUpdates, setGameUpdates] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channelName = `game-session-${sessionId}`;
    
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    channel
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'game_sessions',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        console.log('Game session update:', payload);
        setGameUpdates((prev) => [...prev, payload]);
      })
      .subscribe((status) => {
        console.log('Game session subscription status:', status);
        setConnected(status === 'SUBSCRIBED');
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [sessionId]);

  const updateGameState = useCallback(async (state: any) => {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .upsert({
          session_id: sessionId,
          game_state: state,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating game state:', error);
      throw error;
    }
  }, [sessionId]);

  return { 
    connected, 
    gameUpdates, 
    updateGameState 
  };
} 