import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Sparkles, Palette, Save } from 'lucide-react';
import { type QuestionOfDay } from '@/lib/questionLibrary';

interface CustomQuestionModalProps {
  onQuestionCreate: (question: QuestionOfDay) => void;
  onClose: () => void;
}

const visualTypes = [
  { value: 'colors', label: 'Colors', emoji: '🎨' },
  { value: 'animals', label: 'Animals', emoji: '🐾' },
  { value: 'food', label: 'Food', emoji: '🍕' },
  { value: 'emotions', label: 'Emotions', emoji: '😊' },
  { value: 'activities', label: 'Activities', emoji: '⚽' },
  { value: 'weather', label: 'Weather', emoji: '🌤️' },
  { value: 'yesNo', label: 'Yes/No', emoji: '✅' },
  { value: 'custom', label: 'Custom', emoji: '✨' }
];

const categories = [
  'general', 'math', 'science', 'language', 'social', 'creative', 'fun', 'educational'
];

const difficulties = [
  { value: 'easy', label: 'Easy', color: 'text-green-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'hard', label: 'Hard', color: 'text-red-600' }
];

export default function CustomQuestionModal({ onQuestionCreate, onClose }: CustomQuestionModalProps) {
  const [questionText, setQuestionText] = useState('');
  const [answers, setAnswers] = useState(['', '', '', '']);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [selectedVisualType, setSelectedVisualType] = useState('colors');
  const [isCreating, setIsCreating] = useState(false);

  const addAnswer = () => {
    if (answers.length < 8) {
      setAnswers([...answers, '']);
    }
  };

  const removeAnswer = (index: number) => {
    if (answers.length > 2) {
      const newAnswers = answers.filter((_, i) => i !== index);
      setAnswers(newAnswers);
    }
  };

  const updateAnswer = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleCreate = async () => {
    if (!questionText.trim() || answers.filter(a => a.trim()).length < 2) {
      alert('Please provide a question and at least 2 answers.');
      return;
    }

    setIsCreating(true);

    // Create new question object
    const newQuestion: QuestionOfDay = {
      id: Date.now(), // Generate unique ID
      text: questionText.trim(),
      answers: answers.filter(a => a.trim()),
      category: selectedCategory,
      difficulty: selectedDifficulty as 'easy' | 'medium' | 'hard',
      visualType: selectedVisualType as 'yesNo' | 'colors' | 'animals' | 'food' | 'activities' | 'emotions' | 'weather' | 'custom'
    };

    try {
      // Call the parent's onQuestionCreate function
      onQuestionCreate(newQuestion);
      onClose();
    } catch (error) {
      console.error('Error creating question:', error);
      alert('Failed to create question. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleCreate();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Create Custom Question
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onClose} className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text *
            </label>
            <Textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter your question here..."
              rows={3}
              className="w-full"
              onKeyDown={handleKeyPress}
            />
          </div>

          {/* Answer Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Answer Options * (at least 2)
            </label>
            <div className="space-y-2">
              {answers.map((answer, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={answer}
                    onChange={(e) => updateAnswer(index, e.target.value)}
                    placeholder={`Answer ${index + 1}`}
                    className="flex-1"
                  />
                  {answers.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAnswer(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {answers.length < 8 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAnswer}
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Answer
              </Button>
            )}
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      <span className="capitalize">{category}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map(difficulty => (
                    <SelectItem key={difficulty.value} value={difficulty.value}>
                      <span className={difficulty.color}>{difficulty.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Visual Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visual Style
              </label>
              <Select value={selectedVisualType} onValueChange={setSelectedVisualType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visualTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <span>{type.emoji}</span>
                        <span>{type.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview */}
          {questionText.trim() && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Preview:</h4>
              <p className="text-lg font-semibold mb-3">{questionText}</p>
              <div className="flex flex-wrap gap-2">
                {answers.filter(a => a.trim()).map((answer, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    {answer}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={isCreating || !questionText.trim() || answers.filter(a => a.trim()).length < 2}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Question
                </>
              )}
            </Button>
          </div>

          {/* Keyboard Shortcut Hint */}
          <div className="text-xs text-gray-500 text-center">
            💡 Press Ctrl+Enter to quickly create the question
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 