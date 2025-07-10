export interface AttendanceTheme {
  id: string;
  name: string;
  emojis: string[];
  colors: string[];
  background: string;
  icon: string;
  description: string;
  // New modern styling properties
  glassmorphism: {
    background: string;
    border: string;
    shadow: string;
  };
  questionBox: {
    background: string;
    border: string;
    shadow: string;
  };
  answerZone: {
    background: string;
    border: string;
    shadow: string;
    hover: string;
  };
  studentCard: {
    background: string;
    border: string;
    shadow: string;
    hover: string;
  };
  particleCount: number;
  confettiColors: string[];
}

export const attendanceThemes: Record<string, AttendanceTheme> = {
  puppy: {
    id: "puppy",
    name: "Puppy",
    emojis: ["🐶", "🐕", "🦮", "🐕‍🦺", "🐩", "🐕‍🦺", "🦮", "🐕"],
    colors: ["purple", "pink", "blue", "green", "yellow", "orange", "red", "indigo"],
    background: "bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100",
    icon: "🐶",
    description: "Adorable puppies for a fun classroom experience",
    glassmorphism: {
      background: "bg-white/20 backdrop-blur-md",
      border: "border-white/30",
      shadow: "shadow-2xl shadow-purple-200/50"
    },
    questionBox: {
      background: "bg-gradient-to-r from-purple-200/80 to-pink-200/80 backdrop-blur-sm",
      border: "border-2 border-purple-300/50",
      shadow: "shadow-xl shadow-purple-300/30"
    },
    answerZone: {
      background: "bg-white/30 backdrop-blur-sm",
      border: "border-2 border-white/40",
      shadow: "shadow-lg shadow-purple-200/40",
      hover: "hover:bg-white/50 hover:scale-105 hover:shadow-xl"
    },
    studentCard: {
      background: "bg-white/40 backdrop-blur-sm",
      border: "border-2 border-white/50",
      shadow: "shadow-md shadow-purple-200/30",
      hover: "hover:scale-110 hover:shadow-lg"
    },
    particleCount: 30,
    confettiColors: ['#e91e63', '#9c27b0', '#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50', '#8bc34a']
  },
  space: {
    id: "space",
    name: "Space",
    emojis: ["🚀", "⭐", "🌙", "🪐", "🌍", "🛸", "👾", "🌌"],
    colors: ["indigo", "purple", "blue", "cyan", "teal", "slate", "violet", "fuchsia"],
    background: "bg-gradient-to-br from-slate-900 via-purple-900 via-indigo-900 to-blue-900",
    icon: "🚀",
    description: "Explore the cosmos with space-themed attendance",
    glassmorphism: {
      background: "bg-black/30 backdrop-blur-lg",
      border: "border-white/30",
      shadow: "shadow-2xl shadow-indigo-500/50"
    },
    questionBox: {
      background: "bg-gradient-to-r from-indigo-600/90 to-purple-600/90 backdrop-blur-lg",
      border: "border-2 border-indigo-400/60",
      shadow: "shadow-2xl shadow-indigo-500/60"
    },
    answerZone: {
      background: "bg-white/15 backdrop-blur-lg",
      border: "border-2 border-white/30",
      shadow: "shadow-xl shadow-indigo-500/40",
      hover: "hover:bg-white/25 hover:scale-105 hover:shadow-2xl hover:border-indigo-400/50"
    },
    studentCard: {
      background: "bg-white/20 backdrop-blur-lg",
      border: "border-2 border-white/35",
      shadow: "shadow-lg shadow-indigo-500/35",
      hover: "hover:scale-110 hover:shadow-xl hover:border-indigo-400/40"
    },
    particleCount: 80,
    confettiColors: ['#3f51b5', '#9c27b0', '#e91e63', '#00bcd4', '#009688', '#4caf50', '#ff9800', '#ff5722', '#8bc34a', '#cddc39']
  },
  jungle: {
    id: "jungle",
    name: "Jungle",
    emojis: ["🦁", "🐯", "🐨", "🐼", "🦊", "🐸", "🦒", "🐘"],
    colors: ["green", "emerald", "lime", "teal", "amber", "orange", "brown", "yellow"],
    background: "bg-gradient-to-br from-green-100 via-emerald-50 to-lime-100",
    icon: "🦁",
    description: "Wild jungle animals for adventurous learning",
    glassmorphism: {
      background: "bg-white/25 backdrop-blur-md",
      border: "border-white/35",
      shadow: "shadow-2xl shadow-green-200/50"
    },
    questionBox: {
      background: "bg-gradient-to-r from-green-300/80 to-emerald-300/80 backdrop-blur-sm",
      border: "border-2 border-green-400/50",
      shadow: "shadow-xl shadow-green-400/30"
    },
    answerZone: {
      background: "bg-white/35 backdrop-blur-sm",
      border: "border-2 border-white/45",
      shadow: "shadow-lg shadow-green-300/40",
      hover: "hover:bg-white/50 hover:scale-105 hover:shadow-xl"
    },
    studentCard: {
      background: "bg-white/45 backdrop-blur-sm",
      border: "border-2 border-white/55",
      shadow: "shadow-md shadow-green-300/30",
      hover: "hover:scale-110 hover:shadow-lg"
    },
    particleCount: 25,
    confettiColors: ['#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ff9800', '#ff5722', '#e91e63', '#9c27b0']
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    emojis: ["🐬", "🐙", "🦈", "🐠", "🐡", "🦀", "🦑", "🐋"],
    colors: ["blue", "cyan", "teal", "sky", "indigo", "slate", "violet", "purple"],
    background: "bg-gradient-to-br from-blue-100 via-cyan-50 to-teal-100",
    icon: "🐬",
    description: "Dive deep with ocean creatures",
    glassmorphism: {
      background: "bg-white/20 backdrop-blur-md",
      border: "border-white/30",
      shadow: "shadow-2xl shadow-blue-200/50"
    },
    questionBox: {
      background: "bg-gradient-to-r from-blue-300/80 to-cyan-300/80 backdrop-blur-sm",
      border: "border-2 border-blue-400/50",
      shadow: "shadow-xl shadow-blue-400/30"
    },
    answerZone: {
      background: "bg-white/30 backdrop-blur-sm",
      border: "border-2 border-white/40",
      shadow: "shadow-lg shadow-blue-300/40",
      hover: "hover:bg-white/45 hover:scale-105 hover:shadow-xl"
    },
    studentCard: {
      background: "bg-white/40 backdrop-blur-sm",
      border: "border-2 border-white/50",
      shadow: "shadow-md shadow-blue-300/30",
      hover: "hover:scale-110 hover:shadow-lg"
    },
    particleCount: 35,
    confettiColors: ['#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ff9800', '#ff5722']
  },
  superhero: {
    id: "superhero",
    name: "Superhero",
    emojis: ["🦸", "🦹", "🦸‍♂️", "🦸‍♀️", "🦹‍♂️", "🦹‍♀️", "⚡", "🛡️"],
    colors: ["red", "blue", "yellow", "green", "purple", "orange", "pink", "indigo"],
    background: "bg-gradient-to-br from-red-100 via-yellow-50 to-blue-100",
    icon: "🦸",
    description: "Unleash your inner superhero powers",
    glassmorphism: {
      background: "bg-white/25 backdrop-blur-md",
      border: "border-white/35",
      shadow: "shadow-2xl shadow-red-200/50"
    },
    questionBox: {
      background: "bg-gradient-to-r from-red-300/80 to-yellow-300/80 backdrop-blur-sm",
      border: "border-2 border-red-400/50",
      shadow: "shadow-xl shadow-red-400/30"
    },
    answerZone: {
      background: "bg-white/35 backdrop-blur-sm",
      border: "border-2 border-white/45",
      shadow: "shadow-lg shadow-red-300/40",
      hover: "hover:bg-white/50 hover:scale-105 hover:shadow-xl"
    },
    studentCard: {
      background: "bg-white/45 backdrop-blur-sm",
      border: "border-2 border-white/55",
      shadow: "shadow-md shadow-red-300/30",
      hover: "hover:scale-110 hover:shadow-lg"
    },
    particleCount: 40,
    confettiColors: ['#f44336', '#e91e63', '#9c27b0', '#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50']
  },
  farm: {
    id: "farm",
    name: "Farm",
    emojis: ["🐮", "🐷", "🐔", "🐑", "🐐", "🦆", "🐰", "🐴"],
    colors: ["brown", "orange", "yellow", "green", "red", "pink", "gray", "amber"],
    background: "bg-gradient-to-br from-orange-100 via-yellow-50 to-amber-100",
    icon: "🐮",
    description: "Visit the friendly farm animals",
    glassmorphism: {
      background: "bg-white/30 backdrop-blur-md",
      border: "border-white/40",
      shadow: "shadow-2xl shadow-orange-200/50"
    },
    questionBox: {
      background: "bg-gradient-to-r from-orange-300/80 to-yellow-300/80 backdrop-blur-sm",
      border: "border-2 border-orange-400/50",
      shadow: "shadow-xl shadow-orange-400/30"
    },
    answerZone: {
      background: "bg-white/40 backdrop-blur-sm",
      border: "border-2 border-white/50",
      shadow: "shadow-lg shadow-orange-300/40",
      hover: "hover:bg-white/55 hover:scale-105 hover:shadow-xl"
    },
    studentCard: {
      background: "bg-white/50 backdrop-blur-sm",
      border: "border-2 border-white/60",
      shadow: "shadow-md shadow-orange-300/30",
      hover: "hover:scale-110 hover:shadow-lg"
    },
    particleCount: 20,
    confettiColors: ['#ff9800', '#ff5722', '#795548', '#9e9e9e', '#607d8b', '#4caf50', '#8bc34a', '#cddc39']
  }
};

export const answerColors = ['green', 'red', 'blue', 'yellow', 'purple', 'pink', 'indigo', 'orange'];
export const answerEmojis = ['✅', '❌', '🔵', '🟡', '🟣', '🩷', '🟦', '🟠'];

export function getThemeById(themeId: string): AttendanceTheme {
  return attendanceThemes[themeId] || attendanceThemes.puppy;
}

// Enhanced theme utilities
export function getThemeGlassmorphism(theme: AttendanceTheme) {
  return theme.glassmorphism;
}

export function getThemeQuestionBox(theme: AttendanceTheme) {
  return theme.questionBox;
}

export function getThemeAnswerZone(theme: AttendanceTheme) {
  return theme.answerZone;
}

export function getThemeStudentCard(theme: AttendanceTheme) {
  return theme.studentCard;
}

export function getAllThemes(): AttendanceTheme[] {
  return Object.values(attendanceThemes);
} 