import { useState } from 'react';
import { useGameSessionRealtime } from '../hooks/useSupabaseRealtime';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Sparkles, Users, Gamepad2, QrCode, Copy, Check } from 'lucide-react';
import MagicWordHunt from './magic-word-hunt';

export default function LiveGameControls({ userId, isTeacher, initialSessionCode }: { userId: string; isTeacher: boolean; initialSessionCode?: string }) {
  const [sessionId, setSessionId] = useState<string>('');
  const [joinCode, setJoinCode] = useState(initialSessionCode || '');
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const { connected, gameUpdates, updateGameState } = useGameSessionRealtime(sessionId);

  const startSession = async () => {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    setSessionId(code);
    
    // Initialize game session in Supabase
    await updateGameState({
      sessionId: code,
      hostId: userId,
      participants: [userId],
      status: 'active',
      gameType: 'magic-word-hunt',
      createdAt: new Date().toISOString()
    });
  };

  const joinSession = async () => {
    const sessionCode = joinCode.toUpperCase();
    setSessionId(sessionCode);
    
    // Join existing session
    await updateGameState({
      sessionId: sessionCode,
      participants: [userId],
      status: 'joined',
      joinedAt: new Date().toISOString()
    });
  };

  const copyToClipboard = async () => {
    const joinUrl = `${window.location.origin}/join/${sessionId}`;
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = joinUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateQRCode = () => {
    const joinUrl = `${window.location.origin}/join/${sessionId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(joinUrl)}`;
  };

  // Count participants from game updates
  const participantCount = gameUpdates.filter(update => 
    update.eventType === 'INSERT' && update.new?.status === 'joined'
  ).length + 1;

  if (sessionId) {
    return (
      <div className="space-y-6">
        <MagicWordHunt sessionId={sessionId} userId={userId} isTeacher={isTeacher} />
        
        {isTeacher && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gamepad2 className="w-5 h-5 mr-2" />
                Session Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Session Code:</span>
                  <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                    {sessionId}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Players:</span>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">
                      {participantCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQR(!showQR)}
                  className="flex-1"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Code
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex-1"
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
              </div>

              {showQR && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <img 
                    src={generateQRCode()} 
                    alt="QR Code for joining session"
                    className="mx-auto border rounded-lg"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Students can scan this to join
                  </p>
                </div>
              )}

              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setSessionId('');
                  setShowQR(false);
                }}
                className="w-full"
              >
                End Session
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <Card className="max-w-md mx-auto mt-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-purple-700 flex items-center justify-center">
          <Sparkles className="w-6 h-6 mr-2 text-yellow-500" />
          Live Game Session
          <Sparkles className="w-6 h-6 ml-2 text-yellow-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isTeacher ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Start a magical learning adventure for your kindergarten class!
              </p>
              <Button 
                onClick={startSession} 
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg w-full"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Magic Word Hunt
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Join your teacher's magical word hunt!
              </p>
            </div>
            <div className="space-y-2">
              <Input 
                placeholder="Enter Session Code (e.g., ABC123)" 
                value={joinCode} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJoinCode(e.target.value.toUpperCase())}
                className="text-center text-lg font-mono"
                maxLength={6}
              />
              <Button 
                onClick={joinSession} 
                disabled={!joinCode || joinCode.length < 3}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg w-full"
              >
                <Gamepad2 className="w-5 h-5 mr-2" />
                Join the Hunt!
              </Button>
            </div>
          </div>
        )}
        
        <div className="text-center text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 