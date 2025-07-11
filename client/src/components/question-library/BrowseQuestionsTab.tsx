import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Shuffle, Eye, Clock, Star, Filter, X, Sparkles, BookOpen, TrendingUp } from "lucide-react";
import { QuestionOfDay } from "@/lib/questionLibrary";
import { QuestionCard } from "./components/QuestionCard";
import { SearchFilters } from "./components/SearchFilters";
import { useQuestionSearch } from "./hooks/useQuestionSearch";

interface BrowseQuestionsTabProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (difficulty: string) => void;
  selectedVisualType: string;
  setSelectedVisualType: (type: string) => void;
  showFavorites: boolean;
  setShowFavorites: (show: boolean) => void;
  recentlyUsedQuestions: string[];
  favoritesUpdateTrigger: number;
  onSelectQuestion: (question: QuestionOfDay) => void;
  onClose: () => void;
}

export function BrowseQuestionsTab({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedVisualType,
  setSelectedVisualType,
  showFavorites,
  setShowFavorites,
  recentlyUsedQuestions,
  favoritesUpdateTrigger,
  onSelectQuestion,
  onClose
}: BrowseQuestionsTabProps) {
  const { filteredQuestions, categories, difficulties, visualTypes } = useQuestionSearch({
    searchTerm,
    selectedCategory,
    selectedDifficulty,
    selectedVisualType,
    showFavorites
  });

  const handleRandomQuestion = () => {
    if (filteredQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
      const randomQuestion = filteredQuestions[randomIndex];
      onSelectQuestion(randomQuestion);
      onClose();
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedDifficulty("all");
    setSelectedVisualType("all");
    setShowFavorites(false);
  };

  const hasActiveFilters = searchTerm || selectedCategory !== "all" || selectedDifficulty !== "all" || selectedVisualType !== "all" || showFavorites;

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleRandomQuestion} variant="outline" className="flex items-center gap-2">
            <Shuffle className="h-4 w-4" />
            Random
          </Button>
        </div>

        <SearchFilters
          categories={categories}
          difficulties={difficulties}
          visualTypes={visualTypes}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          selectedVisualType={selectedVisualType}
          setSelectedVisualType={setSelectedVisualType}
          showFavorites={showFavorites}
          setShowFavorites={setShowFavorites}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
        />
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''} found
          </h3>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="ghost" size="sm" className="text-gray-500">
              <X className="h-4 w-4 mr-1" />
              Clear filters
            </Button>
          )}
        </div>

        {filteredQuestions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No questions found</h3>
              <p className="text-gray-500 text-center">
                Try adjusting your search terms or filters to find more questions.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredQuestions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                recentlyUsedQuestions={recentlyUsedQuestions}
                favoritesUpdateTrigger={favoritesUpdateTrigger}
                onSelect={() => onSelectQuestion(question)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 