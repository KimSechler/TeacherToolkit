import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  questionLibrary, 
  getCategories, 
  getQuestionsByCategory, 
  getRandomQuestion,
  getUnusedQuestions,
  getVisualElements,
  addCustomQuestion,
  type QuestionOfDay 
} from '@/lib/questionLibrary';
import { Search, Shuffle, Filter, BookOpen, Plus } from 'lucide-react';
import CustomQuestionModal from './custom-question-modal';

interface QuestionSelectorProps {
  onQuestionSelect: (question: QuestionOfDay) => void;
  currentQuestion?: string;
  onClose: () => void;
}

export default function QuestionSelector({ 
  onQuestionSelect, 
  currentQuestion, 
  onClose 
}: QuestionSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [showCustomModal, setShowCustomModal] = useState(false);

  const categories = getCategories();
  
  // Filter questions based on search, category, and difficulty
  const filteredQuestions = questionLibrary.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || question.category === selectedCategory;
    const matchesDifficulty = difficultyFilter === 'all' || question.difficulty === difficultyFilter;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleRandomQuestion = () => {
    const randomQuestion = getRandomQuestion(selectedCategory === 'all' ? undefined : selectedCategory);
    onQuestionSelect(randomQuestion);
  };

  const handleSmartRandom = () => {
    // Get questions that haven't been used recently (in the last 7 days)
    const unusedQuestions = getUnusedQuestions();
    const availableQuestions = selectedCategory === 'all' 
      ? unusedQuestions 
      : unusedQuestions.filter((q: QuestionOfDay) => q.category === selectedCategory);
    
    if (availableQuestions.length === 0) {
      // If all questions have been used recently, show a message
      alert('All questions in this category have been used recently. Try a different category or use regular random.');
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const smartRandomQuestion = availableQuestions[randomIndex];
    onQuestionSelect(smartRandomQuestion);
  };

  const handleQuestionSelect = (question: QuestionOfDay) => {
    onQuestionSelect(question);
  };

  const handleCustomQuestionCreate = (question: QuestionOfDay) => {
    // Add the custom question to the library using the proper function
    addCustomQuestion(question);
    // Select the new question
    onQuestionSelect(question);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Question Library
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onClose} className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <Button onClick={handleRandomQuestion} className="bg-purple-600 hover:bg-purple-700">
                <Shuffle className="w-4 h-4 mr-2" />
                Random
              </Button>
              <Button onClick={handleSmartRandom} className="bg-green-600 hover:bg-green-700">
                <Shuffle className="w-4 h-4 mr-2" />
                Smart Random
              </Button>
              <Button onClick={() => setShowCustomModal(true)} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Custom
              </Button>
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                className={`cursor-pointer ${selectedCategory === 'all' ? 'bg-purple-600' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All Categories
              </Badge>
              {categories.map(category => (
                <Badge 
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className={`cursor-pointer capitalize ${selectedCategory === category ? 'bg-purple-600' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
            
            {/* Difficulty Filter */}
            <div className="flex gap-2">
              <Badge 
                variant={difficultyFilter === 'all' ? 'default' : 'outline'}
                className={`cursor-pointer ${difficultyFilter === 'all' ? 'bg-green-600' : ''}`}
                onClick={() => setDifficultyFilter('all')}
              >
                All Levels
              </Badge>
              <Badge 
                variant={difficultyFilter === 'easy' ? 'default' : 'outline'}
                className={`cursor-pointer ${difficultyFilter === 'easy' ? 'bg-green-600' : ''}`}
                onClick={() => setDifficultyFilter('easy')}
              >
                Easy
              </Badge>
              <Badge 
                variant={difficultyFilter === 'medium' ? 'default' : 'outline'}
                className={`cursor-pointer ${difficultyFilter === 'medium' ? 'bg-yellow-600' : ''}`}
                onClick={() => setDifficultyFilter('medium')}
              >
                Medium
              </Badge>
              <Badge 
                variant={difficultyFilter === 'hard' ? 'default' : 'outline'}
                className={`cursor-pointer ${difficultyFilter === 'hard' ? 'bg-red-600' : ''}`}
                onClick={() => setDifficultyFilter('hard')}
              >
                Hard
              </Badge>
            </div>
          </div>

          {/* Questions List */}
          <div className="max-h-[60vh] overflow-y-auto space-y-4">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No questions found matching your criteria.</p>
                <p className="text-sm">Try adjusting your search or filters.</p>
              </div>
            ) : (
              filteredQuestions.map(question => {
                const visualElements = getVisualElements(question.visualType);
                const isCurrentQuestion = currentQuestion === question.text;
                
                return (
                  <Card 
                    key={question.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      isCurrentQuestion ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                    }`}
                    onClick={() => handleQuestionSelect(question)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{question.text}</h3>
                          
                          {/* Answer Preview */}
                          <div className="flex gap-2 mb-3">
                            {question.answers.map((answer, index) => (
                              <div 
                                key={index}
                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                                  visualElements.colors[index] || 'bg-gray-200'
                                } text-white`}
                              >
                                <span className="text-lg">{visualElements.emojis[index] || '📝'}</span>
                                <span>{answer}</span>
                              </div>
                            ))}
                          </div>
                          
                          {/* Tags */}
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {question.category}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                question.difficulty === 'easy' ? 'text-green-600' :
                                question.difficulty === 'medium' ? 'text-yellow-600' :
                                'text-red-600'
                              }`}
                            >
                              {question.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {question.visualType}
                            </Badge>
                          </div>
                        </div>
                        
                        {isCurrentQuestion && (
                          <Badge className="bg-purple-600 text-white">
                            Current
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
          
          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Showing {filteredQuestions.length} of {questionLibrary.length} questions</span>
              <span>Click any question to select it</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Custom Question Modal */}
      {showCustomModal && (
        <CustomQuestionModal
          onQuestionCreate={handleCustomQuestionCreate}
          onClose={() => setShowCustomModal(false)}
        />
      )}
    </div>
  );
} 