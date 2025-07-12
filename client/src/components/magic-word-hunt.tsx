import { useState, useEffect, useRef } from 'react';
import { useGameSessionRealtime } from '../hooks/useSupabaseRealtime';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sparkles, Star, Trophy, Users, Volume2, VolumeX } from 'lucide-react';

interface MagicWordHuntProps {
  sessionId: string;
  userId: string;
  isTeacher: boolean;
}

interface GameState {
  currentWord: string;
  discoveredLetters: string[];
  participants: string[];
  score: Record<string, number>;
  gamePhase: 'waiting' | 'playing' | 'finished';
  timeLeft: number;
}

const KINDERGARTEN_WORDS = [
  'CAT', 'DOG', 'SUN', 'MOON', 'STAR', 'TREE', 'BOOK', 'BALL',
  'HAT', 'CUP', 'MAP', 'BAG', 'PEN', 'BOX', 'KEY', 'CAR'
];

const LETTER_ANIMATIONS = [
  'bounce', 'spin', 'glow', 'shake', 'pulse', 'wiggle'
];

export default function MagicWordHunt({ sessionId, userId, isTeacher }: MagicWordHuntProps) {
  const [gameState, setGameState] = useState<GameState>({
    currentWord: 'CAT',
    discoveredLetters: [],
    participants: [],
    score: {},
    gamePhase: 'waiting',
    timeLeft: 60
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { connected, gameUpdates, updateGameState } = useGameSessionRealtime(sessionId);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = 0.3;
  }, []);

  // Handle incoming game updates
  useEffect(() => {
    gameUpdates.forEach(update => {
      if (update.eventType === 'INSERT' && update.new?.gameState) {
        setGameState(update.new.gameState);
      } else if (update.eventType === 'UPDATE' && update.new?.gameState) {
        setGameState(update.new.gameState);
      }
    });
  }, [gameUpdates]);

  const playSound = (type: 'success' | 'discovery' | 'magic') => {
    if (!soundEnabled || !audioRef.current) return;
    
    const sounds = {
      success: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
      discovery: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
      magic: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
    };
    
    audioRef.current.src = sounds[type];
    audioRef.current.play().catch(() => {});
  };

  const startGame = async () => {
    const newWord = KINDERGARTEN_WORDS[Math.floor(Math.random() * KINDERGARTEN_WORDS.length)];
    const newState: GameState = {
      currentWord: newWord,
      discoveredLetters: [],
      participants: gameState.participants,
      score: gameState.score,
      gamePhase: 'playing',
      timeLeft: 60
    };
    
    await updateGameState({
      sessionId,
      gameState: newState,
      status: 'playing',
      updatedAt: new Date().toISOString()
    });
    playSound('magic');
  };

  const selectLetter = async (letter: string) => {
    if (gameState.gamePhase !== 'playing') return;
    
    setSelectedLetter(letter);
    playSound('discovery');
    
    setTimeout(async () => {
      setSelectedLetter(null);
      
      if (gameState.currentWord.includes(letter) && !gameState.discoveredLetters.includes(letter)) {
        const newDiscovered = [...gameState.discoveredLetters, letter];
        const newScore = { ...gameState.score };
        newScore[userId] = (newScore[userId] || 0) + 10;
        
        const newState = {
          ...gameState,
          discoveredLetters: newDiscovered,
          score: newScore
        };
        
        await updateGameState({
          sessionId,
          gameState: newState,
          status: 'playing',
          updatedAt: new Date().toISOString()
        });
        playSound('success');
        
        // Check if word is complete
        if (newDiscovered.length === new Set(gameState.currentWord.split('')).size) {
          setTimeout(async () => {
            const finishedState = { ...newState, gamePhase: 'finished' as const };
            await updateGameState({
              sessionId,
              gameState: finishedState,
              status: 'finished',
              updatedAt: new Date().toISOString()
            });
            playSound('magic');
          }, 1000);
        }
      }
    }, 300);
  };

  const getLetterDisplay = (letter: string) => {
    const isDiscovered = gameState.discoveredLetters.includes(letter);
    const isSelected = selectedLetter === letter;
    
    return (
      <div
        key={letter}
        className={`
          w-16 h-16 rounded-lg border-2 flex items-center justify-center text-2xl font-bold cursor-pointer
          transition-all duration-300 transform
          ${isDiscovered 
            ? 'bg-green-100 border-green-400 text-green-700 shadow-lg scale-110' 
            : 'bg-blue-50 border-blue-200 text-blue-400 hover:bg-blue-100'
          }
          ${isSelected ? 'animate-bounce scale-125' : ''}
          ${isDiscovered ? 'animate-pulse' : 'hover:scale-105'}
        `}
        onClick={() => selectLetter(letter)}
      >
        {isDiscovered ? (
          <div className="flex items-center">
            {letter}
            <Sparkles className="w-4 h-4 ml-1 text-yellow-500" />
          </div>
        ) : (
          <div className="w-8 h-8 bg-blue-200 rounded flex items-center justify-center">
            ?
          </div>
        )}
      </div>
    );
  };

  const getUniqueLetters = (word: string) => {
    return Array.from(new Set(word.split('')));
  };

  const getScoreDisplay = () => {
    const sortedScores = Object.entries(gameState.score)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    return (
      <div className="flex items-center space-x-4">
        {sortedScores.map(([playerId, score], index) => (
          <div key={playerId} className="flex items-center space-x-2">
            {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
            {index === 1 && <Trophy className="w-5 h-5 text-gray-400" />}
            {index === 2 && <Trophy className="w-5 h-5 text-orange-600" />}
            <Badge variant="outline">
              {playerId === userId ? 'You' : `Player ${playerId.slice(-3)}`}: {score}
            </Badge>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="max-w-4xl mx-auto bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-purple-700 flex items-center justify-center">
          <Sparkles className="w-8 h-8 mr-3 text-yellow-500" />
          Magic Word Hunt
          <Sparkles className="w-8 h-8 ml-3 text-yellow-500" />
        </CardTitle>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <Badge variant={connected ? "default" : "destructive"}>
              {connected ? 'Connected' : 'Disconnected'}
            </Badge>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>{gameState.participants.length} players</span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Game Status */}
        <div className="text-center">
          {gameState.gamePhase === 'waiting' && (
            <div className="space-y-4">
              <p className="text-lg text-gray-600">Waiting for teacher to start the game...</p>
              {isTeacher && (
                <Button 
                  onClick={startGame}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Start Magic Hunt!
                </Button>
              )}
            </div>
          )}
          
          {gameState.gamePhase === 'playing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  Time: {gameState.timeLeft}s
                </Badge>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  Found: {gameState.discoveredLetters.length}/{getUniqueLetters(gameState.currentWord).length}
                </Badge>
              </div>
              
              <p className="text-lg text-gray-600">
                Find all the letters to discover the magic word!
              </p>
            </div>
          )}
          
          {gameState.gamePhase === 'finished' && (
            <div className="space-y-4">
              <div className="text-2xl font-bold text-green-600 animate-pulse">
                🎉 Magic Word Found! 🎉
              </div>
              <div className="text-xl text-purple-700">
                The word was: <span className="font-bold">{gameState.currentWord}</span>
              </div>
              {isTeacher && (
                <Button 
                  onClick={startGame}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Play Again!
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Word Display */}
        {gameState.gamePhase !== 'waiting' && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center text-purple-700">
              Magic Word:
            </h3>
            <div className="flex justify-center space-x-2">
              {gameState.currentWord.split('').map((letter, index) => (
                <div
                  key={index}
                  className={`
                    w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold
                    ${gameState.discoveredLetters.includes(letter)
                      ? 'bg-green-100 border-green-400 text-green-700'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                    }
                  `}
                >
                  {gameState.discoveredLetters.includes(letter) ? letter : '_'}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Letter Grid */}
        {gameState.gamePhase === 'playing' && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center text-purple-700">
              Click the letters to find them!
            </h3>
            <div className="grid grid-cols-8 gap-3 justify-items-center">
              {getUniqueLetters(gameState.currentWord).map(letter => 
                getLetterDisplay(letter)
              )}
            </div>
          </div>
        )}

        {/* Scoreboard */}
        {Object.keys(gameState.score).length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-purple-700">🏆 Leaderboard</h3>
            {getScoreDisplay()}
          </div>
        )}

        {/* Session Info */}
        <div className="text-center text-sm text-gray-500">
          Session Code: <span className="font-mono font-bold">{sessionId}</span>
        </div>
      </CardContent>
    </Card>
  );
} 