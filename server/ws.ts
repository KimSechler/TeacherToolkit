import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

// In-memory game sessions
const sessions: Record<string, {
  host: string;
  participants: Record<string, WebSocket>;
  state: any;
}> = {};

export function setupWebSocket(httpServer: HttpServer) {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws) => {
    let currentSession: string = '';
    let userId: string = '';

    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        if (data.type === 'host') {
          // Teacher starts a session
          const sessionId = data.sessionId || Math.random().toString(36).slice(2, 8);
          userId = data.userId || 'host';
          sessions[sessionId] = {
            host: userId,
            participants: { [userId]: ws },
            state: { ...data.state, started: true },
          };
          currentSession = sessionId;
          ws.send(JSON.stringify({ type: 'session_created', sessionId }));
        } else if (data.type === 'join') {
          // Student joins a session
          const sessionId = data.sessionId;
          const joinId = data.userId || Math.random().toString(36).slice(2, 8);
          if (sessions[sessionId]) {
            sessions[sessionId].participants[joinId] = ws;
            currentSession = sessionId;
            userId = joinId;
            ws.send(JSON.stringify({ type: 'joined', sessionId }));
            // Notify host/others
            broadcast(sessionId, { type: 'participant_joined', userId: joinId });
          } else {
            ws.send(JSON.stringify({ type: 'error', message: 'Session not found' }));
          }
        } else if (data.type === 'state_update') {
          // Host or participant updates game state
          const sessionId = data.sessionId;
          const state = data.state;
          if (sessions[sessionId]) {
            sessions[sessionId].state = state;
            broadcast(sessionId, { type: 'state_update', state });
          }
        } else if (data.type === 'leave') {
          // User leaves session
          const sessionId = data.sessionId;
          const leaveId = data.userId;
          if (sessions[sessionId]) {
            delete sessions[sessionId].participants[leaveId];
            broadcast(sessionId, { type: 'participant_left', userId: leaveId });
          }
        }
      } catch (e) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      if (currentSession && userId && sessions[currentSession]) {
        delete sessions[currentSession].participants[userId];
        broadcast(currentSession, { type: 'participant_left', userId });
        // If host leaves, end session
        if (sessions[currentSession].host === userId) {
          broadcast(currentSession, { type: 'session_ended' });
          delete sessions[currentSession];
        }
      }
    });
  });
}

function broadcast(sessionId: string, message: any) {
  const session = sessions[sessionId];
  if (!session) return;
  
  Object.values(session.participants).forEach(ws => {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error('Error broadcasting message:', error);
    }
  });
} 