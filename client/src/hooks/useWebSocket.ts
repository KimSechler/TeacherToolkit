import { useEffect, useRef, useState, useCallback } from 'react';

export function useWebSocket(sessionId?: string, userId?: string) {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.hostname}:3000`);
    wsRef.current = ws;
    
    const handleOpen = () => setConnected(true);
    const handleClose = () => setConnected(false);
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    const handleError = (error: Event) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };
    
    ws.addEventListener('open', handleOpen);
    ws.addEventListener('close', handleClose);
    ws.addEventListener('message', handleMessage);
    ws.addEventListener('error', handleError);
    
    return () => {
      ws.removeEventListener('open', handleOpen);
      ws.removeEventListener('close', handleClose);
      ws.removeEventListener('message', handleMessage);
      ws.removeEventListener('error', handleError);
      ws.close();
    };
  }, [sessionId, userId]);

  const send = useCallback((msg: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return { connected, messages, send };
} 