import { useMemo } from "react";
import { QuestionOfDay, getCategories, getUnusedQuestions, questionLibrary } from "@/lib/questionLibrary";

interface UseQuestionSearchProps {
  searchTerm: string;
  selectedCategory: string;
  selectedDifficulty: string;
  selectedVisualType: string;
  showFavorites: boolean;
}

export function useQuestionSearch({
  searchTerm,
  selectedCategory,
  selectedDifficulty,
  selectedVisualType,
  showFavorites
}: UseQuestionSearchProps) {
  const allQuestions: QuestionOfDay[] = questionLibrary;
  
  const categories = useMemo(() => {
    const builtInCategories = getCategories();
    return ["all", ...Array.from(new Set(builtInCategories))];
  }, []);

  const difficulties = ["all", "easy", "medium", "hard"];
  const visualTypes = ["all", "yesNo", "colors", "animals", "food", "activities", "emotions", "weather", "custom"];

  const filteredQuestions = useMemo(() => {
    let filtered = allQuestions;

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(question =>
        question.text.toLowerCase().includes(searchLower) ||
        question.category.toLowerCase().includes(searchLower) ||
        question.answers.some(answer => answer.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(question => question.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(question => question.difficulty === selectedDifficulty);
    }

    // Visual type filter
    if (selectedVisualType !== "all") {
      filtered = filtered.filter(question => question.visualType === selectedVisualType);
    }

    // Favorites filter (placeholder - would need to implement favorites system)
    if (showFavorites) {
      // For now, just return all questions since we don't have favorites implemented
      // filtered = filtered.filter(question => isFavorite(question.id));
    }

    return filtered;
  }, [allQuestions, searchTerm, selectedCategory, selectedDifficulty, selectedVisualType, showFavorites]);

  return {
    filteredQuestions,
    categories,
    difficulties,
    visualTypes
  };
} 