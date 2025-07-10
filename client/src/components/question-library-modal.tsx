import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Search, Shuffle, Eye, Clock, Star, Filter, X, Sparkles, BookOpen, TrendingUp, Plus, Edit, Trash2, Save, List, Palette } from "lucide-react";
import { QuestionOfDay, getRandomQuestion, getVisualElements, getCategories, getUnusedQuestions, questionLibrary } from "@/lib/questionLibrary";

interface QuestionLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestion: (question: QuestionOfDay) => void;
  className?: string;
}

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

// Predefined emoji categories for smart suggestions
const EMOJI_CATEGORIES = {
  animals: ["🐶", "🐱", "🐰", "🐼", "🦊", "🐸", "🐙", "🦄", "🐯", "🐨"],
  food: ["🍕", "🍦", "🍎", "🍕", "🍔", "🍟", "🍿", "🍪", "🍩", "🍰"],
  colors: ["🔴", "🔵", "🟡", "🟢", "🟣", "🟠", "⚫", "⚪", "🟤", "💖"],
  emotions: ["😊", "😢", "😡", "😴", "🤔", "😎", "😍", "😱", "🤗", "😴"],
  activities: ["⚽", "🎨", "🎵", "📚", "🎮", "🚴", "🏊", "🎭", "🎪", "🎯"],
  weather: ["☀️", "🌧️", "❄️", "🌈", "⛈️", "🌤️", "🌙", "⭐", "☁️", "🌪️"],
  objects: ["📱", "🚗", "🏠", "🎁", "📝", "🔑", "💡", "🎈", "📷", "🎒"],
  nature: ["🌺", "🌳", "🌻", "🍀", "🌹", "🌴", "🌵", "🌸", "🌼", "🌷"]
};

const VISUAL_TYPES = [
  "colors", "animals", "food", "activities", "emotions", "weather", "objects", "nature", "custom"
];

export default function QuestionLibraryModal({
  isOpen,
  onClose,
  onSelectQuestion,
  className = ""
}: QuestionLibraryModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedVisualType, setSelectedVisualType] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("browse");
  const [recentlyUsedQuestions, setRecentlyUsedQuestions] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  
  // Custom question creation state
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [questionLists, setQuestionLists] = useState<string[]>(["My Questions"]);
  const [selectedList, setSelectedList] = useState<string>("My Questions");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<CustomQuestion | null>(null);
  const [showListManager, setShowListManager] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [editingList, setEditingList] = useState<string | null>(null);
  
  // Form state for creating/editing questions
  const [formData, setFormData] = useState({
    text: "",
    answers: ["", ""],
    emojis: ["", ""],
    visualType: "custom" as 'yesNo' | 'colors' | 'animals' | 'food' | 'activities' | 'emotions' | 'weather' | 'custom',
    category: "custom",
    difficulty: "easy" as 'easy' | 'medium' | 'hard',
    listName: "My Questions"
  });
  
  // Use imported question library
  const allQuestions: QuestionOfDay[] = questionLibrary;
  
  const categories = ["all", ...getCategories()];
  const difficulties = ["all", "easy", "medium", "hard"];
  const visualTypes = ["all", "yesNo", "colors", "animals", "food", "activities", "emotions", "weather", "custom"];

  // Load custom questions and lists from localStorage
  useEffect(() => {
    try {
      const savedQuestions = localStorage.getItem('customQuestions');
      const savedLists = localStorage.getItem('questionLists');
      if (savedQuestions) {
        setCustomQuestions(JSON.parse(savedQuestions));
      }
      if (savedLists) {
        setQuestionLists(JSON.parse(savedLists));
      }
    } catch {
      // Ignore errors
    }
  }, []);

  // Save custom questions and lists to localStorage
  useEffect(() => {
    localStorage.setItem('customQuestions', JSON.stringify(customQuestions));
    localStorage.setItem('questionLists', JSON.stringify(questionLists));
  }, [customQuestions, questionLists]);

  // Load recently used questions from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentlyUsedQuestions');
      if (saved) {
        setRecentlyUsedQuestions(JSON.parse(saved));
      }
    } catch {
      // Ignore errors
    }
  }, []);

  // Save recently used questions to localStorage
  useEffect(() => {
    localStorage.setItem('recentlyUsedQuestions', JSON.stringify(recentlyUsedQuestions));
  }, [recentlyUsedQuestions]);

  // Enhanced fuzzy search function
  const fuzzySearch = (searchTerm: string, text: string): boolean => {
    const search = searchTerm.toLowerCase();
    const target = text.toLowerCase();
    let searchIndex = 0;
    
    for (let i = 0; i < target.length && searchIndex < search.length; i++) {
      if (target[i] === search[searchIndex]) {
        searchIndex++;
      }
    }
    
    return searchIndex === search.length;
  };

  // Filter questions based on search and filters
  const filteredQuestions = useMemo(() => {
    let filtered = allQuestions;

    // Enhanced search filter with fuzzy matching
    if (searchTerm) {
      filtered = filtered.filter(q =>
        fuzzySearch(searchTerm, q.text) ||
        fuzzySearch(searchTerm, q.category) ||
        q.answers.some(answer => fuzzySearch(searchTerm, answer)) ||
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answers.some(answer => answer.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
    }

    // Visual type filter
    if (selectedVisualType !== "all") {
      filtered = filtered.filter(q => q.visualType === selectedVisualType);
    }

    // Favorites filter
    if (showFavorites) {
      try {
        const favorites = JSON.parse(localStorage.getItem('favoriteQuestions') || '[]');
        filtered = filtered.filter(q => favorites.includes(q.id.toString()));
      } catch {
        // Ignore errors
      }
    }

    return filtered;
  }, [allQuestions, searchTerm, selectedCategory, selectedDifficulty, selectedVisualType, showFavorites]);

  // Filter custom questions based on search and selected list
  const filteredCustomQuestions = useMemo(() => {
    console.log("Filtering custom questions:", { customQuestions, searchTerm, selectedList });
    
    return customQuestions.filter(question => {
      const matchesSearch = !searchTerm || 
        fuzzySearch(searchTerm, question.text) ||
        question.answers.some(answer => fuzzySearch(searchTerm, answer));
      const matchesList = selectedList === "all" || question.listName === selectedList;
      return matchesSearch && matchesList;
    });
  }, [customQuestions, searchTerm, selectedList]);

  // Get unused questions for random selection
  const unusedQuestions = useMemo(() => {
    return getUnusedQuestions(recentlyUsedQuestions);
  }, [recentlyUsedQuestions]);

  const handleRandomQuestion = () => {
    const randomQuestion = getRandomQuestion(undefined, recentlyUsedQuestions);
    if (randomQuestion) {
      onSelectQuestion(randomQuestion);
      onClose();
    }
  };

  const handleSelectQuestion = (question: QuestionOfDay) => {
    // Add to recently used
    setRecentlyUsedQuestions(prev => {
      const newList = [question.id.toString(), ...prev.slice(0, 9)]; // Keep last 10
      return newList;
    });
    
    onSelectQuestion(question);
    onClose();
  };

  const handleToggleFavorite = (questionId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const favorites = JSON.parse(localStorage.getItem('favoriteQuestions') || '[]');
      const questionIdStr = questionId.toString();
      const newFavorites = favorites.includes(questionIdStr)
        ? favorites.filter((id: string) => id !== questionIdStr)
        : [...favorites, questionIdStr];
      localStorage.setItem('favoriteQuestions', JSON.stringify(newFavorites));
      // Force re-render
      setShowFavorites(showFavorites);
    } catch {
      // Ignore errors
    }
  };

  const isFavorite = (questionId: number): boolean => {
    try {
      const favorites = JSON.parse(localStorage.getItem('favoriteQuestions') || '[]');
      return favorites.includes(questionId.toString());
    } catch {
      return false;
    }
  };

  const getUsageStatus = (question: QuestionOfDay) => {
    if (recentlyUsedQuestions.includes(question.id.toString())) {
      return { status: "recent", text: "Used recently", icon: <Clock className="w-3 h-3" />, color: "text-orange-600" };
    }
    if (question.lastUsed) {
      const daysSinceUsed = Math.floor((Date.now() - new Date(question.lastUsed).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceUsed <= 7) {
        return { status: "week", text: `Used ${daysSinceUsed} days ago`, icon: <Clock className="w-3 h-3" />, color: "text-yellow-600" };
      }
    }
    return { status: "fresh", text: "Not used recently", icon: <Star className="w-3 h-3" />, color: "text-green-600" };
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedDifficulty("all");
    setSelectedVisualType("all");
    setShowFavorites(false);
  };

  const hasActiveFilters = searchTerm || selectedCategory !== "all" || selectedDifficulty !== "all" || selectedVisualType !== "all" || showFavorites;

  // Custom question functions
  const handleCreateQuestion = () => {
    console.log("handleCreateQuestion called", formData);
    
    if (!formData.text.trim() || formData.answers.some(a => !a.trim())) {
      console.log("Validation failed", { text: formData.text.trim(), answers: formData.answers });
      return;
    }

    const newQuestion: CustomQuestion = {
      id: Date.now().toString(),
      text: formData.text.trim(),
      answers: formData.answers.filter(a => a.trim()),
      emojis: formData.emojis.filter(e => e.trim()),
      visualType: formData.visualType,
      category: formData.category,
      difficulty: formData.difficulty as 'easy' | 'medium' | 'hard',
      listName: formData.listName,
      createdAt: new Date()
    };

    console.log("Creating new question", newQuestion);
    
    setCustomQuestions(prev => {
      const updated = [...prev, newQuestion];
      console.log("Updated custom questions:", updated);
      return updated;
    });
    
    // Add new list if it doesn't exist
    if (!questionLists.includes(formData.listName)) {
      setQuestionLists(prev => [...prev, formData.listName]);
    }
    
    // Reset form
    setFormData({
      text: "",
      answers: ["", ""],
      emojis: ["", ""],
      visualType: "yesNo",
      category: "general",
      difficulty: "easy",
      listName: "My Questions"
    });
    
    setShowCreateForm(false);
    setEditingQuestion(null);
    console.log("Question created successfully");
  };

  const handleEditQuestion = (question: CustomQuestion) => {
    setEditingQuestion(question);
    setFormData({
      text: question.text,
      answers: [...question.answers],
      emojis: [...question.emojis],
      visualType: question.visualType,
      category: question.category,
      difficulty: question.difficulty,
      listName: question.listName
    });
    setShowCreateForm(true);
  };

  const handleUpdateQuestion = () => {
    if (!editingQuestion || !formData.text.trim() || formData.answers.some(a => !a.trim())) {
      return;
    }

    const updatedQuestion: CustomQuestion = {
      ...editingQuestion,
      text: formData.text.trim(),
      answers: formData.answers.filter(a => a.trim()),
      emojis: formData.emojis.filter(e => e.trim()),
      visualType: formData.visualType,
      category: formData.category,
      difficulty: formData.difficulty,
      listName: formData.listName
    };

    setCustomQuestions(prev => 
      prev.map(q => q.id === editingQuestion.id ? updatedQuestion : q)
    );

    // Reset form
    setFormData({
      text: "",
      answers: ["", ""],
      emojis: ["", ""],
      visualType: "custom",
      category: "custom",
      difficulty: "easy",
      listName: selectedList
    });
    
    setShowCreateForm(false);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setCustomQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const handleAddAnswer = () => {
    setFormData(prev => ({
      ...prev,
      answers: [...prev.answers, ""],
      emojis: [...prev.emojis, ""]
    }));
  };

  const handleRemoveAnswer = (index: number) => {
    if (formData.answers.length <= 2) return;
    setFormData(prev => ({
      ...prev,
      answers: prev.answers.filter((_, i) => i !== index),
      emojis: prev.emojis.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateAnswer = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      answers: prev.answers.map((a, i) => i === index ? value : a)
    }));
  };

  const handleUpdateEmoji = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      emojis: prev.emojis.map((e, i) => i === index ? value : e)
    }));
  };

  const getEmojiSuggestions = (visualType: string): string[] => {
    return EMOJI_CATEGORIES[visualType as keyof typeof EMOJI_CATEGORIES] || EMOJI_CATEGORIES.animals;
  };

  // List management functions
  const handleCreateList = () => {
    if (!newListName.trim() || questionLists.includes(newListName.trim())) {
      return;
    }
    setQuestionLists(prev => [...prev, newListName.trim()]);
    setNewListName("");
    setShowListManager(false);
  };

  const handleEditList = (oldName: string, newName: string) => {
    if (!newName.trim() || (newName.trim() !== oldName && questionLists.includes(newName.trim()))) {
      return;
    }
    
    // Update list names
    setQuestionLists(prev => prev.map(list => list === oldName ? newName.trim() : list));
    
    // Update questions in that list
    setCustomQuestions(prev => 
      prev.map(q => q.listName === oldName ? { ...q, listName: newName.trim() } : q)
    );
    
    // Update selected list if it was the edited one
    if (selectedList === oldName) {
      setSelectedList(newName.trim());
    }
    
    setEditingList(null);
  };

  const handleDeleteList = (listName: string) => {
    if (listName === "My Questions") {
      // Don't allow deletion of default list
      return;
    }
    
    // Move questions to "My Questions" list
    setCustomQuestions(prev => 
      prev.map(q => q.listName === listName ? { ...q, listName: "My Questions" } : q)
    );
    
    // Remove the list
    setQuestionLists(prev => prev.filter(list => list !== listName));
    
    // Update selected list if it was the deleted one
    if (selectedList === listName) {
      setSelectedList("My Questions");
    }
  };

  const handleSelectCustomQuestion = (question: CustomQuestion) => {
    console.log("handleSelectCustomQuestion called with:", question);
    
    // Convert custom question to QuestionOfDay format
    const questionOfDay: QuestionOfDay = {
      id: parseInt(question.id),
      text: question.text,
      answers: question.answers,
      visualType: question.visualType,
      category: question.category,
      difficulty: question.difficulty,
      lastUsed: question.lastUsed?.toISOString() || null
    };
    
    console.log("Converted to QuestionOfDay:", questionOfDay);
    
    // Add to recently used
    setRecentlyUsedQuestions(prev => {
      const newList = [question.id, ...prev.slice(0, 9)];
      return newList;
    });
    
    // Update last used
    setCustomQuestions(prev => 
      prev.map(q => 
        q.id === question.id 
          ? { ...q, lastUsed: new Date() }
          : q
      )
    );
    
    console.log("Calling onSelectQuestion with:", questionOfDay);
    onSelectQuestion(questionOfDay);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            Question Library
            <Badge variant="secondary" className="ml-2">
              {filteredQuestions.length} of {allQuestions.length} questions
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="browse">Browse Questions</TabsTrigger>
            <TabsTrigger value="random">Random Selection</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="custom">Custom Questions</TabsTrigger>
          </TabsList>

          {/* Browse Questions Tab */}
          <TabsContent value="browse" className="space-y-4">
            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search questions with fuzzy matching..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRandomQuestion}
                  className="whitespace-nowrap"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Random
                </Button>
                <Button
                  variant={showFavorites ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFavorites(!showFavorites)}
                  className="whitespace-nowrap"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Favorites
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div>
                  <Label className="text-xs text-gray-600">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Difficulty</Label>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map((difficulty) => (
                        <SelectItem key={difficulty} value={difficulty}>
                          {difficulty === "all" ? "All Difficulties" : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Visual Type</Label>
                  <Select value={selectedVisualType} onValueChange={setSelectedVisualType}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {visualTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type === "all" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="w-full h-9"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Questions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredQuestions.map((question) => {
                const usageStatus = getUsageStatus(question);
                const visualElements = getVisualElements(question.visualType);
                const favorite = isFavorite(question.id);
                
                return (
                  <Card 
                    key={question.id} 
                    className={`hover:shadow-md transition-shadow cursor-pointer ${
                      usageStatus.status === "recent" ? "border-orange-200 bg-orange-50" : ""
                    } ${favorite ? "ring-2 ring-yellow-400" : ""}`}
                    onClick={() => handleSelectQuestion(question)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm font-medium line-clamp-2">
                          {question.text}
                        </CardTitle>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => handleToggleFavorite(question.id, e)}
                          >
                            <Star className={`w-3 h-3 ${favorite ? "fill-yellow-400 text-yellow-600" : "text-gray-400"}`} />
                          </Button>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${usageStatus.color}`}
                          >
                            {usageStatus.icon}
                            {usageStatus.text}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {question.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {question.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {question.visualType}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-2">
                        {question.answers.map((answer, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 rounded-md bg-gray-50 border border-gray-200"
                          >
                            {visualElements && visualElements.emojis[index] && (
                              <span className="text-lg">{visualElements.emojis[index]}</span>
                            )}
                            <span className="text-sm font-medium text-gray-700 truncate">
                              {answer}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredQuestions.length === 0 && (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">No questions found</p>
                <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="mt-3">
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Random Selection Tab */}
          <TabsContent value="random" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Smart Random Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Quick Random</h4>
                    <p className="text-sm text-gray-600">
                      Get a completely random question from the library
                    </p>
                    <Button onClick={handleRandomQuestion} className="w-full">
                      <Shuffle className="w-4 h-4 mr-2" />
                      Pick Random Question
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Category Random</h4>
                    <p className="text-sm text-gray-600">
                      Get a random question from a specific category
                    </p>
                    <div className="flex gap-2">
                      <Select onValueChange={(category) => {
                        if (category !== "all") {
                          const randomQuestion = getRandomQuestion(category, recentlyUsedQuestions);
                          if (randomQuestion) {
                            handleSelectQuestion(randomQuestion);
                          }
                        }
                      }}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.filter(c => c !== "all").map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Recently Used Questions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recentlyUsedQuestions.slice(0, 6).map((questionId) => {
                      const question = allQuestions.find(q => q.id.toString() === questionId);
                      if (!question) return null;
                      
                      return (
                        <div
                          key={questionId}
                          className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200"
                        >
                          <Clock className="w-4 h-4 text-orange-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{question.text}</p>
                            <p className="text-xs text-gray-600">{question.category}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {recentlyUsedQuestions.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No recently used questions
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  Favorite Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {(() => {
                    try {
                      const favorites = JSON.parse(localStorage.getItem('favoriteQuestions') || '[]');
                      const favoriteQuestions = allQuestions.filter(q => favorites.includes(q.id.toString()));
                      
                      if (favoriteQuestions.length === 0) {
                        return (
                          <div className="col-span-2 text-center py-8">
                            <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 mb-2">No favorite questions yet</p>
                            <p className="text-sm text-gray-500">Click the star icon on any question to add it to favorites</p>
                          </div>
                        );
                      }

                      return favoriteQuestions.map((question) => {
                        const visualElements = getVisualElements(question.visualType);
                        
                        return (
                          <Card 
                            key={question.id} 
                            className="hover:shadow-md transition-shadow cursor-pointer ring-2 ring-yellow-400"
                            onClick={() => handleSelectQuestion(question)}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <CardTitle className="text-sm font-medium line-clamp-2">
                                  {question.text}
                                </CardTitle>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => handleToggleFavorite(question.id, e)}
                                >
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-600" />
                                </Button>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {question.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {question.difficulty}
                                </Badge>
                              </div>
                            </CardHeader>
                            
                            <CardContent className="pt-0">
                              <div className="grid grid-cols-2 gap-2">
                                {question.answers.map((answer, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 p-2 rounded-md bg-gray-50 border border-gray-200"
                                  >
                                    {visualElements && visualElements.emojis[index] && (
                                      <span className="text-lg">{visualElements.emojis[index]}</span>
                                    )}
                                    <span className="text-sm font-medium text-gray-700 truncate">
                                      {answer}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      });
                    } catch {
                      return (
                        <div className="col-span-2 text-center py-8">
                          <p className="text-gray-600">Error loading favorites</p>
                        </div>
                      );
                    }
                  })()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

                     {/* Custom Questions Tab */}
           <TabsContent value="custom" className="space-y-4">
             {/* List Selection and Search */}
             <div className="flex gap-3">
               <div className="flex-1 relative">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <Input
                   placeholder="Search custom questions..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-10"
                 />
               </div>
               <Select value={selectedList} onValueChange={setSelectedList}>
                 <SelectTrigger className="w-48">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   {questionLists.map((list) => (
                     <SelectItem key={list} value={list}>
                       {list}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => setShowListManager(true)}
                 className="whitespace-nowrap"
               >
                 <List className="w-4 h-4 mr-2" />
                 Manage Lists
               </Button>
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => setShowCreateForm(true)}
                 className="whitespace-nowrap"
               >
                 <Plus className="w-4 h-4 mr-2" />
                 New Question
               </Button>
             </div>

             {/* Questions List */}
             <Card>
               <CardHeader>
                 <CardTitle className="text-lg flex items-center gap-2">
                   <List className="w-5 h-5 text-blue-600" />
                   {selectedList} ({filteredCustomQuestions.length} questions)
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   {filteredCustomQuestions.map((question) => {
                     const visualElements = getVisualElements(question.visualType);
                     const usageStatus = getUsageStatus({ 
                       id: parseInt(question.id), 
                       text: question.text, 
                       answers: question.answers, 
                       visualType: question.visualType, 
                       category: question.category, 
                       difficulty: question.difficulty, 
                       lastUsed: question.lastUsed?.toISOString() || null
                     });
                     const favorite = isFavorite(parseInt(question.id));

                     return (
                       <Card 
                         key={question.id} 
                         className={`hover:shadow-md transition-shadow cursor-pointer ${
                           usageStatus.status === "recent" ? "border-orange-200 bg-orange-50" : ""
                         } ${favorite ? "ring-2 ring-yellow-400" : ""}`}
                       >
                         <CardHeader className="pb-3">
                           <div className="flex items-start justify-between">
                             <CardTitle 
                               className="text-sm font-medium line-clamp-2 cursor-pointer hover:text-blue-600"
                               onClick={() => handleSelectCustomQuestion(question)}
                             >
                               {question.text}
                             </CardTitle>
                             <div className="flex items-center gap-1">
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 className="h-6 w-6 p-0"
                                 onClick={(e) => handleToggleFavorite(parseInt(question.id), e)}
                               >
                                 <Star className={`w-3 h-3 ${favorite ? "fill-yellow-400 text-yellow-600" : "text-gray-400"}`} />
                               </Button>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 className="h-6 w-6 p-0"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleEditQuestion(question);
                                 }}
                               >
                                 <Edit className="w-3 h-3 text-blue-500" />
                               </Button>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 className="h-6 w-6 p-0"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleDeleteQuestion(question.id);
                                 }}
                               >
                                 <Trash2 className="w-3 h-3 text-red-500" />
                               </Button>
                               <Badge 
                                 variant="secondary" 
                                 className={`text-xs ${usageStatus.color}`}
                               >
                                 {usageStatus.icon}
                                 {usageStatus.text}
                               </Badge>
                             </div>
                           </div>
                           <div className="flex items-center gap-2">
                             <Badge variant="outline" className="text-xs">
                               {question.category}
                             </Badge>
                             <Badge variant="outline" className="text-xs">
                               {question.difficulty}
                             </Badge>
                             <Badge variant="outline" className="text-xs">
                               {question.visualType}
                             </Badge>
                             <Badge variant="outline" className="text-xs">
                               {question.listName}
                             </Badge>
                           </div>
                         </CardHeader>
                         
                         <CardContent className="pt-0">
                           <div className="grid grid-cols-2 gap-2">
                             {question.answers.map((answer, index) => (
                               <div
                                 key={index}
                                 className="flex items-center gap-2 p-2 rounded-md bg-gray-50 border border-gray-200"
                               >
                                 {question.emojis[index] && (
                                   <span className="text-lg">{question.emojis[index]}</span>
                                 )}
                                 <span className="text-sm font-medium text-gray-700 truncate">
                                   {answer}
                                 </span>
                               </div>
                             ))}
                           </div>
                         </CardContent>
                       </Card>
                     );
                   })}
                 </div>
                 {filteredCustomQuestions.length === 0 && (
                   <div className="text-center py-8">
                     <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                     <p className="text-gray-600 mb-2">No questions found in this list</p>
                     <p className="text-sm text-gray-500">Try adding some questions!</p>
                   </div>
                 )}
               </CardContent>
             </Card>

             {/* List Manager Modal */}
             {showListManager && (
               <Card className="mt-4">
                 <CardHeader className="flex justify-between items-center">
                   <CardTitle className="text-lg flex items-center gap-2">
                     <List className="w-5 h-5 text-blue-600" />
                     Manage Lists
                   </CardTitle>
                   <Button variant="ghost" size="sm" onClick={() => setShowListManager(false)}>
                     <X className="w-4 h-4" />
                   </Button>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-4">
                     {/* Create New List */}
                     <div className="flex gap-2">
                       <Input
                         placeholder="New list name"
                         value={newListName}
                         onChange={(e) => setNewListName(e.target.value)}
                         className="flex-1"
                       />
                       <Button onClick={handleCreateList} disabled={!newListName.trim()}>
                         <Plus className="w-4 h-4 mr-2" />
                         Create List
                       </Button>
                     </div>

                     {/* List Management */}
                     <div className="space-y-2">
                       <h4 className="font-medium">Your Lists</h4>
                       {questionLists.map((list) => (
                         <div key={list} className="flex items-center justify-between p-3 border rounded-lg">
                           <div className="flex items-center gap-3">
                             <List className="w-4 h-4 text-blue-600" />
                             <span className="font-medium">{list}</span>
                             <Badge variant="outline" className="text-xs">
                               {customQuestions.filter(q => q.listName === list).length} questions
                             </Badge>
                           </div>
                           <div className="flex items-center gap-1">
                             {editingList === list ? (
                               <div className="flex gap-1">
                                 <Input
                                   value={newListName}
                                   onChange={(e) => setNewListName(e.target.value)}
                                   className="w-32"
                                   autoFocus
                                 />
                                 <Button
                                   size="sm"
                                   onClick={() => handleEditList(list, newListName)}
                                   disabled={!newListName.trim()}
                                 >
                                   Save
                                 </Button>
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => {
                                     setEditingList(null);
                                     setNewListName("");
                                   }}
                                 >
                                   Cancel
                                 </Button>
                               </div>
                             ) : (
                               <>
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => {
                                     setEditingList(list);
                                     setNewListName(list);
                                   }}
                                   disabled={list === "My Questions"}
                                 >
                                   <Edit className="w-3 h-3" />
                                 </Button>
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => handleDeleteList(list)}
                                   disabled={list === "My Questions"}
                                 >
                                   <Trash2 className="w-3 h-3 text-red-500" />
                                 </Button>
                               </>
                             )}
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 </CardContent>
               </Card>
             )}

            {showCreateForm && (
              <Card className="mt-4">
                <CardHeader className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {editingQuestion ? <Edit className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
                    {editingQuestion ? "Edit Question" : "Create New Question"}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="questionText">Question Text</Label>
                      <Textarea
                        id="questionText"
                        value={formData.text}
                        onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                        placeholder="Enter the question text"
                        className="min-h-[100px]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="answers">Answers</Label>
                      {formData.answers.map((answer, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <Input
                            placeholder={`Answer ${index + 1}`}
                            value={answer}
                            onChange={(e) => handleUpdateAnswer(index, e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            placeholder={`Emoji for Answer ${index + 1}`}
                            value={formData.emojis[index]}
                            onChange={(e) => handleUpdateEmoji(index, e.target.value)}
                            className="w-16"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAnswer(index)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={handleAddAnswer} className="w-full">
                        Add Answer
                      </Button>
                    </div>
                                         <div>
                       <Label htmlFor="visualType">Visual Type</Label>
                       <Select value={formData.visualType} onValueChange={(type) => setFormData(prev => ({ ...prev, visualType: type as any }))}>
                         <SelectTrigger className="h-9">
                           <SelectValue placeholder="Select visual type" />
                         </SelectTrigger>
                         <SelectContent>
                           {VISUAL_TYPES.map((type) => (
                             <SelectItem key={type} value={type}>
                               {type.charAt(0).toUpperCase() + type.slice(1)}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                       {formData.visualType !== "custom" && (
                         <div className="mt-2">
                           <Label className="text-xs text-gray-600">Emoji Suggestions</Label>
                           <div className="flex flex-wrap gap-1 mt-1">
                             {getEmojiSuggestions(formData.visualType).map((emoji, index) => (
                               <button
                                 key={index}
                                 type="button"
                                 className="text-lg hover:scale-110 transition-transform cursor-pointer"
                                 onClick={() => {
                                   const emptyEmojiIndex = formData.emojis.findIndex(e => !e);
                                   if (emptyEmojiIndex !== -1) {
                                     handleUpdateEmoji(emptyEmojiIndex, emoji);
                                   }
                                 }}
                               >
                                 {emoji}
                               </button>
                             ))}
                           </div>
                         </div>
                       )}
                     </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(category) => setFormData(prev => ({ ...prev, category }))}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select value={formData.difficulty} onValueChange={(difficulty) => setFormData(prev => ({ ...prev, difficulty: difficulty as 'easy' | 'medium' | 'hard' }))}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          {difficulties.map((difficulty) => (
                            <SelectItem key={difficulty} value={difficulty}>
                              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="listName">List Name</Label>
                      <Select value={formData.listName} onValueChange={(listName) => setFormData(prev => ({ ...prev, listName }))}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select list" />
                        </SelectTrigger>
                        <SelectContent>
                          {questionLists.map((list) => (
                            <SelectItem key={list} value={list}>
                              {list.charAt(0).toUpperCase() + list.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={editingQuestion ? handleUpdateQuestion : handleCreateQuestion} className="w-full">
                      {editingQuestion ? <Save className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      {editingQuestion ? "Save Changes" : "Create Question"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 