import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shuffle, BookOpen, Plus, Sparkles, Play } from "lucide-react";
import { QuestionOfDay, getRandomQuestion, getVisualElements } from "@/lib/questionLibrary";
import { getAllThemes } from "@/lib/attendanceThemes";

interface QuestionOfDayProps {
  currentQuestion: QuestionOfDay | null;
  onShuffle: () => void;
  onPickFromLibrary: () => void;
  onCreateCustom: () => void;
  className?: string;
  classId?: number;
  onQuickStart?: (themeId: string) => void;
}

export default function QuestionOfDayComponent({
  currentQuestion,
  onShuffle,
  onPickFromLibrary,
  onCreateCustom,
  className = "",
  classId,
  onQuickStart
}: QuestionOfDayProps) {
  const [isShuffling, setIsShuffling] = useState(false);
  const [showQuickStartMenu, setShowQuickStartMenu] = useState(false);

  const handleShuffle = async () => {
    setIsShuffling(true);
    // Add a small delay for visual feedback
    setTimeout(() => {
      onShuffle();
      setIsShuffling(false);
    }, 300);
  };

  const handleQuickStart = (themeId: string) => {
    setShowQuickStartMenu(false);
    if (onQuickStart) {
      onQuickStart(themeId);
    }
  };

  // Get visual elements for the question
  const visualElements = currentQuestion ? getVisualElements(currentQuestion.visualType) : null;
  const themes = getAllThemes();

  return (
    <Card className={`${className} bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 shadow-lg`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-blue-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Question of the Day
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {currentQuestion?.category || "No Question"}
            </Badge>
            {classId && currentQuestion && (
              <div className="relative">
                <Button
                  onClick={() => setShowQuickStartMenu(!showQuickStartMenu)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Quick Start
                </Button>
                {showQuickStartMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10 min-w-[200px]">
                    <div className="text-xs font-medium text-gray-600 mb-2 px-2">Choose Theme:</div>
                    {themes.slice(0, 3).map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => handleQuickStart(theme.id)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center gap-2"
                      >
                        <span className="text-lg">{theme.icon}</span>
                        <span>{theme.name}</span>
                      </button>
                    ))}
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        onClick={() => handleQuickStart('puppy')}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center gap-2"
                      >
                        <span className="text-lg">🐶</span>
                        <span>Puppy Theme</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {currentQuestion ? (
          <>
            {/* Question Display */}
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {currentQuestion.text}
              </h3>
              
              {/* Answer Options */}
              <div className="grid grid-cols-2 gap-2">
                {currentQuestion.answers.map((answer, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-md bg-gray-50 border border-gray-200"
                  >
                    {visualElements && visualElements.emojis[index] && (
                      <span className="text-xl">{visualElements.emojis[index]}</span>
                    )}
                    <span className="text-sm font-medium text-gray-700">{answer}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShuffle}
                disabled={isShuffling}
                className="bg-white hover:bg-blue-50 border-blue-300 text-blue-700"
              >
                <Shuffle className={`w-4 h-4 mr-1 ${isShuffling ? 'animate-spin' : ''}`} />
                Shuffle
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onPickFromLibrary}
                className="bg-white hover:bg-green-50 border-green-300 text-green-700"
              >
                <BookOpen className="w-4 h-4 mr-1" />
                Pick One
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onCreateCustom}
                className="bg-white hover:bg-purple-50 border-purple-300 text-purple-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Create
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No question selected</p>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShuffle}
                className="bg-white hover:bg-blue-50 border-blue-300 text-blue-700"
              >
                <Shuffle className="w-4 h-4 mr-1" />
                Pick Random Question
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 