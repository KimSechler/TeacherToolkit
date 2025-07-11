import { useState, useMemo } from "react";
import { QuestionOfDay, getCategories, getUnusedQuestions, questionLibrary } from "@/lib/questionLibrary";

// Custom question interface
interface CustomQuestion {
  id: string;
  text: string;
  answers: string[];
  emojis: string[];
  visualType: 'yesNo' | 'colors' | 'animals' | 'food' | 'activities' | 'emotions' | 'weather' | 'custom';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  listName: string;
  createdAt: Date;
  lastUsed?: Date;
}

export function useQuestionLibraryState() {
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedVisualType, setSelectedVisualType] = useState<string>("all");
  const [showFavorites, setShowFavorites] = useState(false);
  const [recentlyUsedQuestions, setRecentlyUsedQuestions] = useState<string[]>([]);
  const [favoritesUpdateTrigger, setFavoritesUpdateTrigger] = useState(0);
  
  // Custom question state
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [questionLists, setQuestionLists] = useState<string[]>(["My Questions"]);
  const [selectedList, setSelectedList] = useState<string>("My Questions");
  const [lastEditedList, setLastEditedList] = useState<string>("My Questions");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<CustomQuestion | null>(null);
  const [showListManager, setShowListManager] = useState(false);
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [editingList, setEditingList] = useState<string | null>(null);
  
  // Emoji picker state
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);
  const [emojiSearchTerm, setEmojiSearchTerm] = useState("");
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState("all");
  
  // Private list state for random selection
  const [privateListForRandom, setPrivateListForRandom] = useState<string>("all");
  
  // Form state
  const [formData, setFormData] = useState({
    text: "",
    answers: ["", ""],
    emojis: ["", ""],
    visualType: "yesNo" as 'yesNo' | 'colors' | 'animals' | 'food' | 'activities' | 'emotions' | 'weather' | 'custom',
    category: "general",
    difficulty: "easy" as 'easy' | 'medium' | 'hard',
    listName: "My Questions"
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState<{
    text?: string;
    answers?: string;
    emojis?: string;
  }>({});

  // Computed values
  const allQuestions: QuestionOfDay[] = questionLibrary;
  
  const categories = useMemo(() => {
    const builtInCategories = getCategories();
    const customCategories = Array.from(new Set(customQuestions.map(q => q.category)));
    const allCategories = [...builtInCategories, ...customCategories];
    return ["all", ...Array.from(new Set(allCategories))];
  }, [customQuestions]);

  const difficulties = ["all", "easy", "medium", "hard"];
  const visualTypes = ["all", "yesNo", "colors", "animals", "food", "activities", "emotions", "weather", "custom"];

  return {
    // Search and filter state
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
    setRecentlyUsedQuestions,
    favoritesUpdateTrigger,
    setFavoritesUpdateTrigger,
    
    // Custom question state
    customQuestions,
    setCustomQuestions,
    questionLists,
    setQuestionLists,
    selectedList,
    setSelectedList,
    lastEditedList,
    setLastEditedList,
    showCreateForm,
    setShowCreateForm,
    editingQuestion,
    setEditingQuestion,
    showListManager,
    setShowListManager,
    showListDropdown,
    setShowListDropdown,
    newListName,
    setNewListName,
    editingList,
    setEditingList,
    
    // Emoji picker state
    showEmojiPicker,
    setShowEmojiPicker,
    emojiSearchTerm,
    setEmojiSearchTerm,
    selectedEmojiCategory,
    setSelectedEmojiCategory,
    
    // Private list state
    privateListForRandom,
    setPrivateListForRandom,
    
    // Form state
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    
    // Computed values
    allQuestions,
    categories,
    difficulties,
    visualTypes
  };
} 