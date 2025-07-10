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
import { Search, Shuffle, Eye, Clock, Star, Filter, X, Sparkles, BookOpen, TrendingUp, Plus, Edit, Trash2, Save, List, Palette, ChevronDown, Settings } from "lucide-react";
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
  const [favoritesUpdateTrigger, setFavoritesUpdateTrigger] = useState(0);
  
  // Custom question state - completely overhauled
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [questionLists, setQuestionLists] = useState<string[]>(["My Questions"]);
  const [selectedList, setSelectedList] = useState<string>("My Questions");
  const [lastEditedList, setLastEditedList] = useState<string>("My Questions"); // Track most recently edited list
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<CustomQuestion | null>(null);
  const [showListManager, setShowListManager] = useState(false);
  const [showListDropdown, setShowListDropdown] = useState(false); // New: toggle for list dropdown
  const [newListName, setNewListName] = useState("");
  const [editingList, setEditingList] = useState<string | null>(null);
  
  // Emoji picker state
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);
  const [emojiSearchTerm, setEmojiSearchTerm] = useState("");
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState("all");
  
  // Private list state for random selection
  const [privateListForRandom, setPrivateListForRandom] = useState<string>("all");
  
  // Improved form state with better validation
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
  
  // Use imported question library
  const allQuestions: QuestionOfDay[] = questionLibrary;
  
  const categories = useMemo(() => {
    const builtInCategories = getCategories();
    const customCategories = Array.from(new Set(customQuestions.map(q => q.category)));
    const allCategories = [...builtInCategories, ...customCategories];
    return ["all", ...Array.from(new Set(allCategories))];
  }, [customQuestions]);
  const difficulties = ["all", "easy", "medium", "hard"];
  const visualTypes = ["all", "yesNo", "colors", "animals", "food", "activities", "emotions", "weather", "custom"];

  // Comprehensive emoji database with searchable data
  const EMOJI_DATABASE = {
    animals: {
      name: "Animals",
      emojis: [
        { emoji: "🐶", name: "dog", keywords: ["pet", "puppy", "canine", "friendly"] },
        { emoji: "🐱", name: "cat", keywords: ["pet", "kitten", "feline", "cute"] },
        { emoji: "🐰", name: "rabbit", keywords: ["bunny", "hop", "ears", "soft"] },
        { emoji: "🐼", name: "panda", keywords: ["bear", "bamboo", "black", "white"] },
        { emoji: "🦊", name: "fox", keywords: ["wild", "orange", "sly", "forest"] },
        { emoji: "🐸", name: "frog", keywords: ["green", "jump", "pond", "ribbit"] },
        { emoji: "🐙", name: "octopus", keywords: ["ocean", "tentacles", "sea", "eight"] },
        { emoji: "🦄", name: "unicorn", keywords: ["magical", "horn", "rainbow", "fantasy"] },
        { emoji: "🐯", name: "tiger", keywords: ["wild", "stripes", "orange", "fierce"] },
        { emoji: "🐨", name: "koala", keywords: ["australia", "eucalyptus", "sleepy", "gray"] },
        { emoji: "🦁", name: "lion", keywords: ["king", "mane", "wild", "roar"] },
        { emoji: "🐷", name: "pig", keywords: ["pink", "farm", "oink", "mud"] },
        { emoji: "🐮", name: "cow", keywords: ["farm", "milk", "moo", "black", "white"] },
        { emoji: "🐵", name: "monkey", keywords: ["primate", "banana", "climb", "funny"] },
        { emoji: "🐔", name: "chicken", keywords: ["farm", "egg", "cluck", "bird"] },
        { emoji: "🦆", name: "duck", keywords: ["water", "quack", "swim", "yellow"] },
        { emoji: "🦉", name: "owl", keywords: ["night", "wise", "hoot", "bird"] },
        { emoji: "🦋", name: "butterfly", keywords: ["insect", "wings", "fly", "beautiful"] },
        { emoji: "🐞", name: "ladybug", keywords: ["insect", "red", "spots", "lucky"] },
        { emoji: "🐜", name: "ant", keywords: ["insect", "small", "work", "colony"] }
      ]
    },
    food: {
      name: "Food & Drinks",
      emojis: [
        { emoji: "🍕", name: "pizza", keywords: ["italian", "cheese", "slice", "dinner"] },
        { emoji: "🍦", name: "ice cream", keywords: ["dessert", "cold", "sweet", "cone"] },
        { emoji: "🍎", name: "apple", keywords: ["fruit", "red", "healthy", "crunch"] },
        { emoji: "🍔", name: "hamburger", keywords: ["fast food", "meat", "bun", "lunch"] },
        { emoji: "🍟", name: "french fries", keywords: ["potato", "salty", "side", "fast food"] },
        { emoji: "🍿", name: "popcorn", keywords: ["movie", "snack", "butter", "theater"] },
        { emoji: "🍪", name: "cookie", keywords: ["dessert", "sweet", "baked", "chocolate chip"] },
        { emoji: "🍩", name: "doughnut", keywords: ["dessert", "sweet", "hole", "glazed"] },
        { emoji: "🍰", name: "cake", keywords: ["dessert", "birthday", "celebration", "sweet"] },
        { emoji: "🍫", name: "chocolate", keywords: ["sweet", "candy", "brown", "treat"] },
        { emoji: "🍭", name: "lollipop", keywords: ["candy", "sweet", "stick", "sucker"] },
        { emoji: "🍬", name: "candy", keywords: ["sweet", "treat", "colorful", "sugar"] },
        { emoji: "🍡", name: "dango", keywords: ["japanese", "dessert", "sweet", "rice"] },
        { emoji: "🍧", name: "shaved ice", keywords: ["dessert", "cold", "refreshing", "summer"] },
        { emoji: "🍨", name: "ice cream", keywords: ["dessert", "cold", "sweet", "bowl"] },
        { emoji: "🍯", name: "honey", keywords: ["sweet", "natural", "golden", "bee"] },
        { emoji: "🥞", name: "pancakes", keywords: ["breakfast", "syrup", "stack", "fluffy"] },
        { emoji: "🧀", name: "cheese", keywords: ["dairy", "yellow", "melt", "pizza"] },
        { emoji: "🥨", name: "pretzel", keywords: ["bread", "twisted", "salty", "snack"] },
        { emoji: "🥖", name: "bread", keywords: ["baked", "fresh", "loaf", "food"] }
      ]
    },
    emotions: {
      name: "Emotions & Faces",
      emojis: [
        { emoji: "😊", name: "smiling", keywords: ["happy", "joy", "content", "peaceful"] },
        { emoji: "😢", name: "crying", keywords: ["sad", "tears", "upset", "emotional"] },
        { emoji: "😡", name: "angry", keywords: ["mad", "furious", "rage", "red"] },
        { emoji: "😴", name: "sleeping", keywords: ["tired", "rest", "zzz", "bed"] },
        { emoji: "🤔", name: "thinking", keywords: ["thoughtful", "pondering", "curious", "question"] },
        { emoji: "😎", name: "cool", keywords: ["sunglasses", "awesome", "stylish", "confident"] },
        { emoji: "😍", name: "heart eyes", keywords: ["love", "adore", "infatuated", "romance"] },
        { emoji: "😱", name: "screaming", keywords: ["shocked", "surprised", "fear", "amazed"] },
        { emoji: "🤗", name: "hugging", keywords: ["love", "care", "warm", "friendly"] },
        { emoji: "😂", name: "laughing", keywords: ["funny", "joy", "tears", "humor"] },
        { emoji: "🥰", name: "smiling hearts", keywords: ["love", "happy", "romance", "sweet"] },
        { emoji: "😇", name: "angel", keywords: ["innocent", "good", "pure", "heaven"] },
        { emoji: "🤩", name: "star struck", keywords: ["amazed", "wow", "impressed", "famous"] },
        { emoji: "😋", name: "yum", keywords: ["delicious", "tasty", "food", "satisfied"] },
        { emoji: "🤪", name: "zany", keywords: ["crazy", "wild", "fun", "silly"] },
        { emoji: "😜", name: "winking tongue", keywords: ["playful", "fun", "silly", "joke"] },
        { emoji: "😝", name: "squinting tongue", keywords: ["crazy", "fun", "silly", "wild"] },
        { emoji: "🤓", name: "nerd", keywords: ["smart", "intelligent", "glasses", "studious"] },
        { emoji: "😎", name: "sunglasses", keywords: ["cool", "stylish", "awesome", "confident"] },
        { emoji: "😀", name: "grinning", keywords: ["happy", "joy", "smile", "cheerful"] },
        { emoji: "😃", name: "grinning big", keywords: ["happy", "joy", "excited", "cheerful"] }
      ]
    },
    activities: {
      name: "Activities & Sports",
      emojis: [
        { emoji: "⚽", name: "soccer", keywords: ["football", "sport", "game", "ball"] },
        { emoji: "🎨", name: "art", keywords: ["creative", "paint", "draw", "artist"] },
        { emoji: "🎵", name: "music", keywords: ["song", "melody", "sound", "audio"] },
        { emoji: "📚", name: "books", keywords: ["reading", "study", "education", "knowledge"] },
        { emoji: "🎮", name: "gaming", keywords: ["video game", "play", "controller", "fun"] },
        { emoji: "🚴", name: "cycling", keywords: ["bike", "exercise", "sport", "outdoor"] },
        { emoji: "🏊", name: "swimming", keywords: ["pool", "water", "sport", "exercise"] },
        { emoji: "🎭", name: "theater", keywords: ["drama", "acting", "performance", "stage"] },
        { emoji: "🎪", name: "circus", keywords: ["entertainment", "tent", "show", "fun"] },
        { emoji: "🎯", name: "target", keywords: ["aim", "goal", "precision", "dart"] },
        { emoji: "🎲", name: "dice", keywords: ["game", "chance", "luck", "random"] },
        { emoji: "🎸", name: "guitar", keywords: ["music", "instrument", "rock", "string"] },
        { emoji: "🎹", name: "piano", keywords: ["music", "instrument", "keys", "classical"] },
        { emoji: "🎺", name: "trumpet", keywords: ["music", "instrument", "brass", "jazz"] },
        { emoji: "🎻", name: "violin", keywords: ["music", "instrument", "string", "classical"] },
        { emoji: "🎤", name: "microphone", keywords: ["singing", "karaoke", "voice", "performance"] },
        { emoji: "🎧", name: "headphones", keywords: ["music", "audio", "listening", "sound"] },
        { emoji: "🎬", name: "clapperboard", keywords: ["movie", "film", "cinema", "director"] },
        { emoji: "🎭", name: "performing arts", keywords: ["theater", "drama", "acting", "stage"] },
        { emoji: "🎪", name: "circus tent", keywords: ["entertainment", "show", "fun", "tent"] }
      ]
    },
    nature: {
      name: "Nature & Weather",
      emojis: [
        { emoji: "🌺", name: "flower", keywords: ["bloom", "beautiful", "spring", "petals"] },
        { emoji: "🌳", name: "tree", keywords: ["nature", "green", "forest", "outdoor"] },
        { emoji: "🌻", name: "sunflower", keywords: ["yellow", "sun", "tall", "summer"] },
        { emoji: "🍀", name: "clover", keywords: ["lucky", "green", "four leaf", "nature"] },
        { emoji: "🌹", name: "rose", keywords: ["flower", "romance", "red", "love"] },
        { emoji: "🌴", name: "palm tree", keywords: ["tropical", "beach", "vacation", "island"] },
        { emoji: "🌵", name: "cactus", keywords: ["desert", "prickly", "drought", "plant"] },
        { emoji: "🌸", name: "cherry blossom", keywords: ["spring", "pink", "japan", "beautiful"] },
        { emoji: "🌼", name: "daisy", keywords: ["flower", "white", "simple", "innocent"] },
        { emoji: "🌷", name: "tulip", keywords: ["flower", "spring", "colorful", "garden"] },
        { emoji: "🌱", name: "seedling", keywords: ["growth", "new", "plant", "green"] },
        { emoji: "🌿", name: "herb", keywords: ["plant", "green", "natural", "medicine"] },
        { emoji: "☘️", name: "shamrock", keywords: ["ireland", "lucky", "green", "three leaf"] },
        { emoji: "🍃", name: "leaf", keywords: ["nature", "green", "wind", "fall"] },
        { emoji: "🌾", name: "sheaf", keywords: ["harvest", "wheat", "autumn", "farm"] },
        { emoji: "🌽", name: "corn", keywords: ["vegetable", "yellow", "farm", "food"] },
        { emoji: "🥕", name: "carrot", keywords: ["vegetable", "orange", "healthy", "rabbit"] },
        { emoji: "🥬", name: "lettuce", keywords: ["vegetable", "green", "salad", "healthy"] },
        { emoji: "🥦", name: "broccoli", keywords: ["vegetable", "green", "healthy", "tree"] },
        { emoji: "🍄", name: "mushroom", keywords: ["fungus", "forest", "red", "poisonous"] }
      ]
    },
    objects: {
      name: "Objects & Items",
      emojis: [
        { emoji: "📱", name: "phone", keywords: ["mobile", "call", "text", "communication"] },
        { emoji: "🚗", name: "car", keywords: ["vehicle", "drive", "transport", "road"] },
        { emoji: "🏠", name: "house", keywords: ["home", "building", "live", "residence"] },
        { emoji: "🎁", name: "gift", keywords: ["present", "birthday", "celebration", "wrapped"] },
        { emoji: "📝", name: "memo", keywords: ["note", "write", "paper", "document"] },
        { emoji: "🔑", name: "key", keywords: ["lock", "door", "access", "security"] },
        { emoji: "💡", name: "lightbulb", keywords: ["idea", "bright", "invention", "light"] },
        { emoji: "🎈", name: "balloon", keywords: ["party", "celebration", "float", "birthday"] },
        { emoji: "📷", name: "camera", keywords: ["photo", "picture", "capture", "memory"] },
        { emoji: "🎒", name: "backpack", keywords: ["bag", "school", "travel", "carry"] },
        { emoji: "📚", name: "books", keywords: ["reading", "study", "education", "knowledge"] },
        { emoji: "✏️", name: "pencil", keywords: ["write", "draw", "school", "tool"] },
        { emoji: "📏", name: "ruler", keywords: ["measure", "straight", "school", "tool"] },
        { emoji: "📐", name: "triangle", keywords: ["math", "geometry", "shape", "school"] },
        { emoji: "🔍", name: "magnifying glass", keywords: ["search", "find", "investigate", "look"] },
        { emoji: "🔎", name: "magnifying glass tilted", keywords: ["search", "find", "investigate", "look"] },
        { emoji: "💎", name: "gem", keywords: ["precious", "jewelry", "sparkle", "valuable"] },
        { emoji: "💍", name: "ring", keywords: ["jewelry", "marriage", "engagement", "precious"] },
        { emoji: "👑", name: "crown", keywords: ["royal", "king", "queen", "power"] },
        { emoji: "🏆", name: "trophy", keywords: ["winner", "achievement", "award", "success"] }
      ]
    },
    symbols: {
      name: "Symbols & Hearts",
      emojis: [
        { emoji: "❤️", name: "heart", keywords: ["love", "red", "romance", "emotion"] },
        { emoji: "🧡", name: "orange heart", keywords: ["love", "orange", "warm", "friendship"] },
        { emoji: "💛", name: "yellow heart", keywords: ["love", "yellow", "bright", "joy"] },
        { emoji: "💚", name: "green heart", keywords: ["love", "green", "nature", "growth"] },
        { emoji: "💙", name: "blue heart", keywords: ["love", "blue", "calm", "trust"] },
        { emoji: "💜", name: "purple heart", keywords: ["love", "purple", "royal", "mystery"] },
        { emoji: "🖤", name: "black heart", keywords: ["love", "dark", "gothic", "mysterious"] },
        { emoji: "🤍", name: "white heart", keywords: ["love", "pure", "innocent", "clean"] },
        { emoji: "🤎", name: "brown heart", keywords: ["love", "earth", "natural", "warm"] },
        { emoji: "💔", name: "broken heart", keywords: ["sad", "hurt", "pain", "breakup"] },
        { emoji: "❣️", name: "heart exclamation", keywords: ["love", "emphasis", "passion", "strong"] },
        { emoji: "💕", name: "two hearts", keywords: ["love", "romance", "couple", "together"] },
        { emoji: "💞", name: "revolving hearts", keywords: ["love", "romance", "spinning", "magical"] },
        { emoji: "💓", name: "beating heart", keywords: ["love", "pulse", "alive", "passion"] },
        { emoji: "💗", name: "growing heart", keywords: ["love", "growth", "developing", "blooming"] },
        { emoji: "💖", name: "sparkling heart", keywords: ["love", "sparkle", "magical", "special"] },
        { emoji: "💘", name: "heart arrow", keywords: ["love", "cupid", "romance", "target"] },
        { emoji: "💝", name: "heart ribbon", keywords: ["love", "gift", "present", "wrapped"] },
        { emoji: "💟", name: "heart decoration", keywords: ["love", "ornament", "decorative", "pretty"] },
        { emoji: "☮️", name: "peace", keywords: ["peace", "symbol", "harmony", "nonviolence"] }
      ]
    }
  };

  const VISUAL_TYPES = [
    "colors", "animals", "food", "activities", "emotions", "weather", "objects", "nature", "custom"
  ];

  // Load custom questions and lists from localStorage
  useEffect(() => {
    try {
      const savedQuestions = localStorage.getItem('customQuestions');
      const savedLists = localStorage.getItem('questionLists');
      const savedLastEdited = localStorage.getItem('lastEditedList');
      const savedPrivateList = localStorage.getItem('privateListForRandom');
      
      if (savedQuestions) {
        setCustomQuestions(JSON.parse(savedQuestions));
      }
      if (savedLists) {
        const lists = JSON.parse(savedLists);
        setQuestionLists(lists);
        // Auto-sync to most recently edited list
        if (savedLastEdited && lists.includes(savedLastEdited)) {
          setSelectedList(savedLastEdited);
          setLastEditedList(savedLastEdited);
        }
      }
      if (savedPrivateList && savedPrivateList !== "") {
        setPrivateListForRandom(savedPrivateList);
      }
    } catch (error) {
      console.error('Error loading custom questions:', error);
    }
  }, []);

  // Save custom questions and lists to localStorage
  useEffect(() => {
    try {
    localStorage.setItem('customQuestions', JSON.stringify(customQuestions));
    localStorage.setItem('questionLists', JSON.stringify(questionLists));
      localStorage.setItem('lastEditedList', lastEditedList);
      localStorage.setItem('privateListForRandom', privateListForRandom);
    } catch (error) {
      console.error('Error saving custom questions:', error);
    }
  }, [customQuestions, questionLists, lastEditedList, privateListForRandom]);

  // Auto-sync selected list to last edited list when it changes
  useEffect(() => {
    if (questionLists.includes(lastEditedList)) {
      setSelectedList(lastEditedList);
    }
  }, [lastEditedList, questionLists]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showEmojiPicker !== null && !target.closest('.emoji-picker-container') && !target.closest('[data-emoji-button]')) {
        closeEmojiPicker();
      }
      if (showListDropdown && !target.closest('.list-dropdown-container')) {
        setShowListDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker, showListDropdown]);

  // Load recently used questions from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentlyUsedQuestions');
      if (saved) {
        setRecentlyUsedQuestions(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading recently used questions:', error);
    }
  }, []);

  // Save recently used questions to localStorage
  useEffect(() => {
    try {
    localStorage.setItem('recentlyUsedQuestions', JSON.stringify(recentlyUsedQuestions));
    } catch (error) {
      console.error('Error saving recently used questions:', error);
    }
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

  // Enhanced search that includes both built-in and custom questions
  const searchAllQuestions = (searchTerm: string) => {
    if (!searchTerm.trim()) return [];
    
    const searchLower = searchTerm.toLowerCase();
    const results: Array<{ question: QuestionOfDay; type: 'built-in' | 'custom'; listName?: string }> = [];
    
    // Search built-in questions
    allQuestions.forEach(q => {
      if (fuzzySearch(searchTerm, q.text) ||
          fuzzySearch(searchTerm, q.category) ||
          q.answers.some(answer => fuzzySearch(searchTerm, answer)) ||
          q.text.toLowerCase().includes(searchLower) ||
          q.category.toLowerCase().includes(searchLower) ||
          q.answers.some(answer => answer.toLowerCase().includes(searchLower))) {
        results.push({ question: q, type: 'built-in' });
      }
    });
    
    // Search custom questions
    customQuestions.forEach(q => {
      if (fuzzySearch(searchTerm, q.text) ||
          fuzzySearch(searchTerm, q.category) ||
          q.answers.some(answer => fuzzySearch(searchTerm, answer)) ||
          q.text.toLowerCase().includes(searchLower) ||
          q.category.toLowerCase().includes(searchLower) ||
          q.answers.some(answer => answer.toLowerCase().includes(searchLower))) {
        results.push({ 
          question: {
            id: parseInt(q.id),
            text: q.text,
            category: q.category,
            answers: q.answers,
            visualType: q.visualType,
            difficulty: q.difficulty,
            lastUsed: q.lastUsed?.toISOString() || null
          }, 
          type: 'custom',
          listName: q.listName
        });
      }
    });
    
    return results;
  };

  // Filter questions based on search and filters (enhanced to include custom questions)
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
  }, [allQuestions, searchTerm, selectedCategory, selectedDifficulty, selectedVisualType, showFavorites, favoritesUpdateTrigger]);

  // Filter custom questions based on search and selected list
  const filteredCustomQuestions = useMemo(() => {
    return customQuestions.filter(question => {
      const matchesSearch = !searchTerm || 
        fuzzySearch(searchTerm, question.text) ||
        question.answers.some(answer => fuzzySearch(searchTerm, answer));
      const matchesList = selectedList === "all" || question.listName === selectedList;
      return matchesSearch && matchesList;
    });
  }, [customQuestions, searchTerm, selectedList, favoritesUpdateTrigger]);

  // Get unused questions for random selection (enhanced to include custom questions)
  const unusedQuestions = useMemo(() => {
    const builtInUnused = getUnusedQuestions(recentlyUsedQuestions);
    
    // Get unused custom questions from the selected private list or all custom questions
    const customUnused = customQuestions.filter(q => {
      const matchesList = privateListForRandom === "all" || q.listName === privateListForRandom;
      const isUsed = recentlyUsedQuestions.includes(q.id);
      return matchesList && !isUsed;
    });
    
    return [...builtInUnused, ...customUnused];
  }, [recentlyUsedQuestions, customQuestions, privateListForRandom]);

  // Form validation function
  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};
    
    if (!formData.text.trim()) {
      errors.text = "Question text is required";
    }
    
    const validAnswers = formData.answers.filter(a => a.trim());
    if (validAnswers.length < 2) {
      errors.answers = "At least 2 answers are required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Reset form to default state
  const resetForm = () => {
    setFormData({
      text: "",
      answers: ["", ""],
      emojis: ["", ""],
      visualType: "yesNo",
      category: "general",
      difficulty: "easy",
      listName: selectedList
    });
    setFormErrors({});
    setEditingQuestion(null);
    setShowEmojiPicker(null);
  };

  // Emoji picker functions
  const openEmojiPicker = (index: number) => {
    setShowEmojiPicker(index);
    setEmojiSearchTerm("");
    setSelectedEmojiCategory("all");
  };

  const closeEmojiPicker = () => {
    setShowEmojiPicker(null);
    setEmojiSearchTerm("");
    setSelectedEmojiCategory("all");
  };

  const selectEmoji = (emoji: string, index: number) => {
    handleUpdateEmoji(index, emoji);
    closeEmojiPicker();
  };

  const removeEmoji = (index: number) => {
    handleUpdateEmoji(index, "");
  };

  const handleRandomQuestion = () => {
    // Get available questions based on private list selection
    let availableQuestions: (QuestionOfDay | CustomQuestion)[] = [];
    
    if (privateListForRandom !== "all") {
      // Only use custom questions from the selected list
      availableQuestions = customQuestions.filter(q => q.listName === privateListForRandom);
    } else {
      // Use both built-in and custom questions
      const builtInQuestions = questionLibrary.filter(q => !recentlyUsedQuestions.includes(q.id.toString()));
      const customUnused = customQuestions.filter(q => !recentlyUsedQuestions.includes(q.id));
      availableQuestions = [...builtInQuestions, ...customUnused];
    }
    
    // If no unused questions, use all available questions
    if (availableQuestions.length === 0) {
      if (privateListForRandom !== "all") {
        availableQuestions = customQuestions.filter(q => q.listName === privateListForRandom);
      } else {
        availableQuestions = [...questionLibrary, ...customQuestions];
      }
    }
    
    if (availableQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableQuestions.length);
      const randomQuestion = availableQuestions[randomIndex];
      
      // Convert custom question to QuestionOfDay format if needed
      if ('listName' in randomQuestion) {
        // It's a custom question
        const questionOfDay: QuestionOfDay = {
          id: parseInt(randomQuestion.id),
          text: randomQuestion.text,
          category: randomQuestion.category,
          answers: randomQuestion.answers,
          visualType: randomQuestion.visualType,
          difficulty: randomQuestion.difficulty,
          lastUsed: randomQuestion.lastUsed?.toISOString() || null
        };
        onSelectQuestion(questionOfDay);
      } else {
        // It's a built-in question
      onSelectQuestion(randomQuestion);
      }
      
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
      // Force re-render by updating the trigger
      setFavoritesUpdateTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error toggling favorite:', error);
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

  // Completely overhauled custom question functions
  const handleCreateQuestion = () => {
    if (!validateForm()) {
      return;
    }

    const newQuestion: CustomQuestion = {
      id: Date.now().toString(),
      text: formData.text.trim(),
      answers: formData.answers.filter(a => a.trim()),
      emojis: formData.emojis.filter(e => e.trim()),
      visualType: formData.visualType,
      category: formData.category,
      difficulty: formData.difficulty,
      listName: formData.listName,
      createdAt: new Date()
    };

    setCustomQuestions(prev => [...prev, newQuestion]);
    
    // Add new list if it doesn't exist
    if (!questionLists.includes(formData.listName)) {
      setQuestionLists(prev => [...prev, formData.listName]);
    }
    
    // Update last edited list
    setLastEditedList(formData.listName);
    
    // Reset form and close
    resetForm();
    setShowCreateForm(false);
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
    setFormErrors({});
    setShowCreateForm(true);
  };

  const handleUpdateQuestion = () => {
    if (!editingQuestion || !validateForm()) {
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

    // Update last edited list
    setLastEditedList(formData.listName);
    
    // Reset form and close
    resetForm();
    setShowCreateForm(false);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
    setCustomQuestions(prev => prev.filter(q => q.id !== questionId));
    }
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
    const category = EMOJI_DATABASE[visualType as keyof typeof EMOJI_DATABASE];
    return category ? category.emojis.map(e => e.emoji) : EMOJI_DATABASE.animals.emojis.map(e => e.emoji);
  };

  // Improved list management functions
  const handleCreateList = () => {
    if (!newListName.trim() || questionLists.includes(newListName.trim())) {
      return;
    }
    const newList = newListName.trim();
    setQuestionLists(prev => [...prev, newList]);
    setSelectedList(newList);
    setLastEditedList(newList);
    setNewListName("");
    setShowListManager(false);
  };

  const handleEditList = (oldName: string, newName: string) => {
    if (!newName.trim() || (newName.trim() !== oldName && questionLists.includes(newName.trim()))) {
      return;
    }
    
    const updatedName = newName.trim();
    
    // Update list names
    setQuestionLists(prev => prev.map(list => list === oldName ? updatedName : list));
    
    // Update questions in that list
    setCustomQuestions(prev => 
      prev.map(q => q.listName === oldName ? { ...q, listName: updatedName } : q)
    );
    
    // Update selected list if it was the edited one
    if (selectedList === oldName) {
      setSelectedList(updatedName);
    }
    
    // Update last edited list
    if (lastEditedList === oldName) {
      setLastEditedList(updatedName);
    }
    
    setEditingList(null);
    setNewListName("");
  };

  const handleDeleteList = (listName: string) => {
    if (listName === "My Questions") {
      alert("Cannot delete the default 'My Questions' list");
      return;
    }
    
    if (confirm(`Are you sure you want to delete the list "${listName}"? All questions in this list will be moved to "My Questions".`)) {
      // Move questions to "My Questions"
    setCustomQuestions(prev => 
      prev.map(q => q.listName === listName ? { ...q, listName: "My Questions" } : q)
    );
    
    // Remove the list
    setQuestionLists(prev => prev.filter(list => list !== listName));
    
    // Update selected list if it was the deleted one
    if (selectedList === listName) {
      setSelectedList("My Questions");
        setLastEditedList("My Questions");
      }
    }
  };

  const handleSelectCustomQuestion = (question: CustomQuestion) => {
    // Convert custom question to QuestionOfDay format
    const questionOfDay: QuestionOfDay = {
      id: parseInt(question.id),
      text: question.text,
      category: question.category,
      answers: question.answers,
      visualType: question.visualType,
      difficulty: question.difficulty,
      lastUsed: question.lastUsed?.toISOString() || null
    };
    
    // Add to recently used
    setRecentlyUsedQuestions(prev => {
      const newList = [question.id, ...prev.slice(0, 9)];
      return newList;
    });
    
    // Update last used date
    setCustomQuestions(prev => 
      prev.map(q => q.id === question.id ? { ...q, lastUsed: new Date() } : q)
    );
    
    onSelectQuestion(questionOfDay);
    onClose();
  };

  // Search emojis with fuzzy matching
  const searchEmojis = (searchTerm: string) => {
    if (!searchTerm.trim()) return [];
    
    const searchLower = searchTerm.toLowerCase();
    const results: Array<{ emoji: string; name: string; category: string; keywords: string[] }> = [];
    
    Object.entries(EMOJI_DATABASE).forEach(([categoryKey, category]) => {
      category.emojis.forEach(emojiData => {
        const matchesName = emojiData.name.toLowerCase().includes(searchLower);
        const matchesKeywords = emojiData.keywords.some(keyword => 
          keyword.toLowerCase().includes(searchLower)
        );
        const matchesEmoji = emojiData.emoji.includes(searchTerm);
        
        if (matchesName || matchesKeywords || matchesEmoji) {
          results.push({
            emoji: emojiData.emoji,
            name: emojiData.name,
            category: category.name,
            keywords: emojiData.keywords
          });
        }
      });
    });
    
    return results;
  };

  // Get filtered emojis based on search and category
  const getFilteredEmojis = () => {
    if (emojiSearchTerm.trim()) {
      return searchEmojis(emojiSearchTerm);
    }
    
    if (selectedEmojiCategory === "all") {
      const allEmojis: Array<{ emoji: string; name: string; category: string; keywords: string[] }> = [];
      Object.entries(EMOJI_DATABASE).forEach(([categoryKey, category]) => {
        category.emojis.forEach(emojiData => {
          allEmojis.push({
            emoji: emojiData.emoji,
            name: emojiData.name,
            category: category.name,
            keywords: emojiData.keywords
          });
        });
      });
      return allEmojis;
    }
    
    const category = EMOJI_DATABASE[selectedEmojiCategory as keyof typeof EMOJI_DATABASE];
    if (!category) return [];
    
    return category.emojis.map(emojiData => ({
      emoji: emojiData.emoji,
      name: emojiData.name,
      category: category.name,
      keywords: emojiData.keywords
    }));
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
                    placeholder="Search all questions (built-in + custom) with fuzzy matching..."
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

              {/* Enhanced Search Results */}
              {searchTerm && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-3">Search Results</h4>
                  <div className="space-y-3">
                    {searchAllQuestions(searchTerm).slice(0, 5).map((result, index) => (
                      <div
                        key={`${result.type}-${result.question.id}`}
                        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 cursor-pointer transition-colors"
                        onClick={() => handleSelectQuestion(result.question)}
                      >
                        <div className="flex-shrink-0">
                          {result.type === 'custom' ? (
                            <List className="w-4 h-4 text-blue-600" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{result.question.text}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {result.question.category}
                            </Badge>
                            {result.type === 'custom' && result.listName && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                {result.listName}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {result.type === 'custom' ? 'Custom' : 'Built-in'}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(result.question.id, e);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Star className={`w-3 h-3 ${isFavorite(result.question.id) ? "fill-yellow-400 text-yellow-600" : "text-gray-400"}`} />
                        </Button>
                      </div>
                    ))}
                    {searchAllQuestions(searchTerm).length > 5 && (
                      <p className="text-sm text-gray-600 text-center">
                        Showing 5 of {searchAllQuestions(searchTerm).length} results. 
                        Use filters below to narrow down results.
                      </p>
                    )}
                  </div>
                </div>
              )}

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
                          // Get questions from the selected category
                          let availableQuestions: (QuestionOfDay | CustomQuestion)[] = [];
                          
                          // Get built-in questions from the category
                          const builtInQuestions = questionLibrary.filter(q => 
                            q.category === category && !recentlyUsedQuestions.includes(q.id.toString())
                          );
                          
                          // Get custom questions from the category
                          const customQuestionsInCategory = customQuestions.filter(q => 
                            q.category === category && !recentlyUsedQuestions.includes(q.id)
                          );
                          
                          availableQuestions = [...builtInQuestions, ...customQuestionsInCategory];
                          
                          // If no unused questions, use all questions from the category
                          if (availableQuestions.length === 0) {
                            const allBuiltIn = questionLibrary.filter(q => q.category === category);
                            const allCustom = customQuestions.filter(q => q.category === category);
                            availableQuestions = [...allBuiltIn, ...allCustom];
                          }
                          
                          if (availableQuestions.length > 0) {
                            const randomIndex = Math.floor(Math.random() * availableQuestions.length);
                            const randomQuestion = availableQuestions[randomIndex];
                            
                            // Convert custom question to QuestionOfDay format if needed
                            if ('listName' in randomQuestion) {
                              // It's a custom question
                              const questionOfDay: QuestionOfDay = {
                                id: parseInt(randomQuestion.id),
                                text: randomQuestion.text,
                                category: randomQuestion.category,
                                answers: randomQuestion.answers,
                                visualType: randomQuestion.visualType,
                                difficulty: randomQuestion.difficulty,
                                lastUsed: randomQuestion.lastUsed?.toISOString() || null
                              };
                              handleSelectQuestion(questionOfDay);
                            } else {
                              // It's a built-in question
                            handleSelectQuestion(randomQuestion);
                            }
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

                {/* Private List Selection */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Custom List Selection</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    Optionally limit random selection to questions from a specific custom list:
                  </p>
                  <div className="flex gap-2">
                    <Select 
                      value={privateListForRandom} 
                      onValueChange={setPrivateListForRandom}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="All questions (built-in + custom)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All questions (built-in + custom)</SelectItem>
                        {questionLists.map((list) => (
                          <SelectItem key={list} value={list}>
                            {list} ({customQuestions.filter(q => q.listName === list).length})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {privateListForRandom !== "all" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrivateListForRandom("all")}
                        title="Clear list selection"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {privateListForRandom !== "all" && (
                    <p className="text-sm text-blue-600 mt-2">
                      ✓ Random selection will only use questions from "{privateListForRandom}"
                    </p>
                  )}
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

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Available Questions</h4>
                  <p className="text-blue-700 text-sm">
                    {unusedQuestions.length} questions available for random selection
                    {privateListForRandom !== "all" && (
                      <span className="block mt-1">
                        ({customQuestions.filter(q => q.listName === privateListForRandom && !recentlyUsedQuestions.includes(q.id)).length} from "{privateListForRandom}")
                      </span>
                    )}
                  </p>
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
            {/* Header with stats and actions */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <List className="w-5 h-5 text-blue-600" />
                  Custom Questions
                </h3>
                <p className="text-sm text-gray-600">
                  {filteredCustomQuestions.length} questions in {selectedList}
                </p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowListDropdown(!showListDropdown)}
                    className="flex items-center gap-1"
                  >
                    <List className="w-4 h-4" />
                    Manage Lists
                    <ChevronDown className={`w-3 h-3 transition-transform ${showListDropdown ? 'rotate-180' : ''}`} />
                  </Button>
                  
                  {/* Quick List Dropdown */}
                  {showListDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 list-dropdown-container">
                      <div className="p-3 border-b border-gray-100">
                        <h4 className="font-medium text-sm text-gray-900 mb-2">Quick List Actions</h4>
                        <div className="space-y-1">
                          {questionLists.map((list) => (
                            <button
                              key={list}
                              onClick={() => {
                                setSelectedList(list);
                                setShowListDropdown(false);
                              }}
                              className={`w-full text-left px-2 py-1 rounded text-sm hover:bg-gray-100 ${
                                selectedList === list ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                              }`}
                            >
                              {list} ({customQuestions.filter(q => q.listName === list).length})
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="p-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowListManager(true);
                            setShowListDropdown(false);
                          }}
                          className="w-full"
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Advanced List Management
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => {
                    resetForm();
                    setShowCreateForm(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Question
                </Button>
              </div>
            </div>

            {/* Search and List Selection */}
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
                  <SelectItem value="all">All Lists</SelectItem>
                   {questionLists.map((list) => (
                     <SelectItem key={list} value={list}>
                      {list} ({customQuestions.filter(q => q.listName === list).length})
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>

             {/* Questions List */}
             <Card>
              <CardContent className="p-6">
                {filteredCustomQuestions.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                          className={`hover:shadow-md transition-all cursor-pointer ${
                           usageStatus.status === "recent" ? "border-orange-200 bg-orange-50" : ""
                         } ${favorite ? "ring-2 ring-yellow-400" : ""}`}
                       >
                         <CardHeader className="pb-3">
                           <div className="flex items-start justify-between">
                             <CardTitle 
                                className="text-sm font-medium line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                               onClick={() => handleSelectCustomQuestion(question)}
                             >
                               {question.text}
                             </CardTitle>
                             <div className="flex items-center gap-1">
                               <Button
                                 variant="ghost"
                                 size="sm"
                                  className="h-6 w-6 p-0 hover:bg-yellow-100"
                                 onClick={(e) => handleToggleFavorite(parseInt(question.id), e)}
                                  title={favorite ? "Remove from favorites" : "Add to favorites"}
                               >
                                 <Star className={`w-3 h-3 ${favorite ? "fill-yellow-400 text-yellow-600" : "text-gray-400"}`} />
                               </Button>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                  className="h-6 w-6 p-0 hover:bg-blue-100"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleEditQuestion(question);
                                 }}
                                  title="Edit question"
                               >
                                 <Edit className="w-3 h-3 text-blue-500" />
                               </Button>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                  className="h-6 w-6 p-0 hover:bg-red-100"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleDeleteQuestion(question.id);
                                 }}
                                  title="Delete question"
                               >
                                 <Trash2 className="w-3 h-3 text-red-500" />
                               </Button>
                             </div>
                           </div>
                            <div className="flex items-center gap-2 flex-wrap">
                             <Badge variant="outline" className="text-xs">
                               {question.category}
                             </Badge>
                             <Badge variant="outline" className="text-xs">
                               {question.difficulty}
                             </Badge>
                             <Badge variant="outline" className="text-xs">
                               {question.visualType}
                             </Badge>
                              {question.listName !== selectedList && (
                                <Badge variant="outline" className="text-xs bg-blue-50">
                               {question.listName}
                                </Badge>
                              )}
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${usageStatus.color}`}
                              >
                                {usageStatus.icon}
                                {usageStatus.text}
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
                ) : (
                  <div className="text-center py-12">
                    <List className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm ? "No questions found" : "No questions yet"}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm 
                        ? "Try adjusting your search terms" 
                        : `Get started by creating your first question in ${selectedList}`
                      }
                    </p>
                    {!searchTerm && (
                      <Button
                        onClick={() => {
                          resetForm();
                          setShowCreateForm(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Question
                      </Button>
                    )}
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
                  <div className="space-y-6">
                    {/* Inviting Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <List className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            Organize Your Questions with Lists! 📚
                          </h4>
                          <p className="text-sm text-gray-600 mb-3">
                            Create custom lists to organize your questions by topic, class, or any way that works for you. 
                            Lists make it easy to find and manage your questions efficiently.
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                              <span className="bg-white px-2 py-1 rounded-full border">✨ Better organization</span>
                              <span className="bg-white px-2 py-1 rounded-full border">🚀 Quick access</span>
                              <span className="bg-white px-2 py-1 rounded-full border">📊 Easy management</span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                setNewListName("");
                                const input = document.querySelector('input[placeholder="Enter list name..."]') as HTMLInputElement;
                                input?.focus();
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Start Creating
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                     {/* Create New List */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Create New List</h4>
                     <div className="flex gap-2">
                       <Input
                          placeholder="Enter list name..."
                         value={newListName}
                         onChange={(e) => setNewListName(e.target.value)}
                         className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && newListName.trim()) {
                              handleCreateList();
                            }
                          }}
                        />
                        <Button 
                          onClick={handleCreateList} 
                          disabled={!newListName.trim() || questionLists.includes(newListName.trim())}
                          className="bg-green-600 hover:bg-green-700"
                        >
                         <Plus className="w-4 h-4 mr-2" />
                          Create
                       </Button>
                      </div>
                      {questionLists.includes(newListName.trim()) && newListName.trim() && (
                        <p className="text-red-500 text-sm">A list with this name already exists</p>
                      )}
                     </div>

                     {/* List Management */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Your Lists</h4>
                     <div className="space-y-2">
                        {questionLists.map((list) => {
                          const questionCount = customQuestions.filter(q => q.listName === list).length;
                          const isDefault = list === "My Questions";
                          const isSelected = selectedList === list;
                          const isLastEdited = lastEditedList === list;
                          
                          return (
                            <div 
                              key={list} 
                              className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                                isSelected ? 'border-blue-200 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                           <div className="flex items-center gap-3">
                                <List className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                                <div>
                                  <div className="flex items-center gap-2">
                             <span className="font-medium">{list}</span>
                                    {isDefault && (
                                      <Badge variant="outline" className="text-xs">Default</Badge>
                                    )}
                                    {isLastEdited && !isDefault && (
                                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                        Recently Edited
                             </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {questionCount} question{questionCount !== 1 ? 's' : ''}
                                  </p>
                                </div>
                           </div>
                           <div className="flex items-center gap-1">
                             {editingList === list ? (
                               <div className="flex gap-1">
                                 <Input
                                   value={newListName}
                                   onChange={(e) => setNewListName(e.target.value)}
                                   className="w-32"
                                   autoFocus
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter' && newListName.trim()) {
                                          handleEditList(list, newListName);
                                        }
                                      }}
                                 />
                                 <Button
                                   size="sm"
                                   onClick={() => handleEditList(list, newListName)}
                                      disabled={!newListName.trim() || (newListName.trim() !== list && questionLists.includes(newListName.trim()))}
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
                                      onClick={() => setSelectedList(list)}
                                      disabled={isSelected}
                                      className={isSelected ? 'bg-blue-100 text-blue-700' : ''}
                                    >
                                      Select
                                    </Button>
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => {
                                     setEditingList(list);
                                     setNewListName(list);
                                   }}
                                      disabled={isDefault}
                                      title={isDefault ? "Cannot edit default list" : "Edit list name"}
                                 >
                                   <Edit className="w-3 h-3" />
                                 </Button>
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => handleDeleteList(list)}
                                      disabled={isDefault}
                                      title={isDefault ? "Cannot delete default list" : "Delete list"}
                                      className="hover:bg-red-100"
                                 >
                                   <Trash2 className="w-3 h-3 text-red-500" />
                                 </Button>
                               </>
                             )}
                           </div>
                         </div>
                          );
                        })}
                      </div>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             )}

            {/* Create/Edit Question Form */}
            {showCreateForm && (
              <Card className="mt-4">
                <CardHeader className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {editingQuestion ? <Edit className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
                    {editingQuestion ? "Edit Question" : "Create New Question"}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                    <div>
                        <Label htmlFor="questionText" className="text-sm font-medium">
                          Question Text *
                        </Label>
                      <Textarea
                        id="questionText"
                        value={formData.text}
                        onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                          placeholder="Enter your question here..."
                          className="min-h-[120px] resize-none"
                      />
                        {formErrors.text && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <span>⚠️</span> {formErrors.text}
                          </p>
                        )}
                    </div>

                    <div>
                        <Label className="text-sm font-medium">
                          Answers *
                        </Label>
                        <div className="space-y-2">
                      {formData.answers.map((answer, index) => (
                                                          <div key={index} className="flex gap-2">
                                <div className="flex-1">
                          <Input
                            placeholder={`Answer ${index + 1}`}
                            value={answer}
                            onChange={(e) => handleUpdateAnswer(index, e.target.value)}
                                    className="w-full"
                                  />
                                </div>
                                <div className="relative">
                                  <div className="flex items-center gap-1">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openEmojiPicker(index)}
                                      className="h-9 w-12 flex items-center justify-center border-2 hover:border-blue-300 transition-colors"
                                      data-emoji-button
                                      title="Add emoji to answer"
                                    >
                                      {formData.emojis[index] ? (
                                        <span className="text-xl">{formData.emojis[index]}</span>
                                      ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                                          <span className="text-gray-300 text-xs">+</span>
                                        </div>
                                      )}
                                    </Button>
                                    {formData.emojis[index] && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeEmoji(index)}
                                        className="h-9 w-8 p-0 hover:bg-red-100 transition-colors"
                                        title="Remove emoji"
                                      >
                                        <X className="w-4 h-4 text-red-500" />
                                      </Button>
                                    )}
                                  </div>
                                  
                                  {/* Simple Inline Emoji Picker */}
                                  {showEmojiPicker === index && (
                                    <div className="absolute top-full left-0 mt-2 w-80 bg-white border-2 border-blue-300 rounded-xl shadow-xl z-50 emoji-picker-container">
                                      {/* Header */}
                                      <div className="p-3 border-b border-gray-100 bg-blue-50 rounded-t-xl">
                                        <div className="flex justify-between items-center mb-2">
                                          <h4 className="font-semibold text-gray-900 text-sm">Choose Emoji</h4>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={closeEmojiPicker}
                                            className="h-6 w-6 p-0 hover:bg-gray-200"
                                          >
                                            <X className="w-3 h-3" />
                                          </Button>
                                        </div>
                                        
                                        {/* Search Bar */}
                                        <div className="relative">
                                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                          <Input
                                            placeholder="Search emojis..."
                                            value={emojiSearchTerm}
                                            onChange={(e) => setEmojiSearchTerm(e.target.value)}
                                            className="pl-7 pr-3 h-8 text-sm border focus:border-blue-400"
                                            autoFocus
                                          />
                                        </div>
                                        
                                        {/* Category Tabs */}
                                        {!emojiSearchTerm && (
                                          <div className="flex gap-1 mt-2 overflow-x-auto">
                                            <button
                                              onClick={() => setSelectedEmojiCategory("all")}
                                              className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                                                selectedEmojiCategory === "all"
                                                  ? "bg-blue-500 text-white"
                                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                              }`}
                                            >
                                              All
                                            </button>
                                            {Object.entries(EMOJI_DATABASE).map(([key, category]) => (
                                              <button
                                                key={key}
                                                onClick={() => setSelectedEmojiCategory(key)}
                                                className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                                                  selectedEmojiCategory === key
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                }`}
                                              >
                                                {category.name}
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Emoji Grid */}
                                      <div className="p-3 max-h-64 overflow-y-auto">
                                        {emojiSearchTerm && getFilteredEmojis().length === 0 ? (
                                          <div className="text-center py-6">
                                            <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                            <p className="text-gray-600 text-sm">No emojis found</p>
                                          </div>
                                        ) : (
                                          <div className="grid grid-cols-6 gap-1">
                                            {getFilteredEmojis().map((emojiData, emojiIndex) => (
                                              <button
                                                key={emojiIndex}
                                                type="button"
                                                onClick={() => selectEmoji(emojiData.emoji, index)}
                                                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
                                                title={emojiData.name}
                                              >
                                                {emojiData.emoji}
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Footer */}
                                      <div className="p-2 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                                        <p className="text-xs text-gray-500 text-center">
                                          {getFilteredEmojis().length} emoji{getFilteredEmojis().length !== 1 ? 's' : ''} available
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAnswer(index)}
                                  className="h-9 w-9 p-0 hover:bg-red-100"
                                  disabled={formData.answers.length <= 2}
                                  title={formData.answers.length <= 2 ? "Minimum 2 answers required" : "Remove answer"}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                          {formErrors.answers && (
                            <p className="text-red-500 text-xs flex items-center gap-1">
                              <span>⚠️</span> {formErrors.answers}
                            </p>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleAddAnswer} 
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                        Add Answer
                      </Button>
                    </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                                         <div>
                        <Label htmlFor="visualType" className="text-sm font-medium">
                          Visual Type
                        </Label>
                        <Select 
                          value={formData.visualType} 
                          onValueChange={(type) => setFormData(prev => ({ ...prev, visualType: type as any }))}
                        >
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
                          <div className="mt-3">
                            <Label className="text-xs text-gray-600">Quick Emoji Suggestions</Label>
                           <div className="flex flex-wrap gap-1 mt-1">
                             {getEmojiSuggestions(formData.visualType).map((emoji, index) => (
                               <button
                                 key={index}
                                 type="button"
                                  className="text-lg hover:scale-110 transition-transform cursor-pointer p-1 rounded hover:bg-gray-100"
                                 onClick={() => {
                                   const emptyEmojiIndex = formData.emojis.findIndex(e => !e);
                                   if (emptyEmojiIndex !== -1) {
                                     handleUpdateEmoji(emptyEmojiIndex, emoji);
                                   }
                                 }}
                                  title="Click to add to empty emoji slot"
                               >
                                 {emoji}
                               </button>
                             ))}
                           </div>
                         </div>
                       )}
                     </div>

                    <div>
                        <Label htmlFor="category" className="text-sm font-medium">
                          Category
                        </Label>
                        <Select 
                          value={formData.category} 
                          onValueChange={(category) => setFormData(prev => ({ ...prev, category }))}
                        >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.filter(cat => cat !== "all").map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                        <Label htmlFor="difficulty" className="text-sm font-medium">
                          Difficulty
                        </Label>
                        <Select 
                          value={formData.difficulty} 
                          onValueChange={(difficulty) => setFormData(prev => ({ ...prev, difficulty: difficulty as 'easy' | 'medium' | 'hard' }))}
                        >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                            {difficulties.filter(diff => diff !== "all").map((difficulty) => (
                            <SelectItem key={difficulty} value={difficulty}>
                              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                        <Label htmlFor="listName" className="text-sm font-medium">
                          List
                        </Label>
                        <Select 
                          value={formData.listName} 
                          onValueChange={(listName) => setFormData(prev => ({ ...prev, listName }))}
                        >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select list" />
                        </SelectTrigger>
                        <SelectContent>
                          {questionLists.map((list) => (
                            <SelectItem key={list} value={list}>
                                {list} ({customQuestions.filter(q => q.listName === list).length})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6 pt-4 border-t">
                    <Button 
                      onClick={editingQuestion ? handleUpdateQuestion : handleCreateQuestion} 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={!formData.text.trim() || formData.answers.filter(a => a.trim()).length < 2}
                    >
                      {editingQuestion ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                      {editingQuestion ? "Save Changes" : "Create Question"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowCreateForm(false);
                        resetForm();
                      }}
                    >
                      Cancel
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