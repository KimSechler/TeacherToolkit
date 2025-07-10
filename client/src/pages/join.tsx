import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Sparkles, Gamepad2, ArrowLeft } from 'lucide-react';
import LiveGameControls from '../components/live-game-controls';

export default function JoinPage() {
  const [, setLocation] = useLocation();
  const [userId] = useState(`student_${Math.random().toString(36).slice(2, 8)}`);
  const [sessionCode, setSessionCode] = useState('');

  useEffect(() => {
    // Extract session code from URL path
    const path = window.location.pathname;
    const match = path.match(/\/join\/([A-Z0-9]+)/);
    if (match) {
      setSessionCode(match[1]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-yellow-500 mr-3" />
            <h1 className="text-4xl font-bold text-purple-700">Magic Word Hunt</h1>
            <Sparkles className="w-8 h-8 text-yellow-500 ml-3" />
          </div>
          
          <p className="text-lg text-gray-600">
            Join your teacher's magical learning adventure!
          </p>
        </div>

        <LiveGameControls 
          userId={userId} 
          isTeacher={false}
          initialSessionCode={sessionCode}
        />

        <div className="mt-8 text-center">
          <Card className="max-w-md mx-auto bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-purple-700">
                How to Play
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs mt-0.5">
                  1
                </div>
                <p>Enter the session code your teacher gave you</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs mt-0.5">
                  2
                </div>
                <p>Wait for your teacher to start the game</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs mt-0.5">
                  3
                </div>
                <p>Click on letters to discover the magic word!</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs mt-0.5">
                  4
                </div>
                <p>Work together with your classmates to find all the letters</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 