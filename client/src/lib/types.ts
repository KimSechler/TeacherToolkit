// API Response Types
export interface QuestionGenerationResponse {
  questions: Array<{
    text: string;
    options: string[];
    correctAnswer?: string;
    topic?: string;
  }>;
}

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  email?: string;
}

export interface Class {
  id: number;
  name: string;
  grade?: string;
  teacherId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: number;
  name: string;
  classId: number;
  avatarUrl?: string | null;
  createdAt: Date;
}

export interface Question {
  id: number;
  text: string;
  type: string;
  options: string[];
  correctAnswer?: string;
  teacherId: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Game {
  id: number;
  title: string;
  description?: string;
  template: string;
  theme: string;
  content: any;
  teacherId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceSettings {
  soundEnabled: boolean;
  confettiEnabled: boolean;
  animationsEnabled: boolean;
  visualEffectsEnabled: boolean;
  autoSaveEnabled: boolean;
  showProgressBar: boolean;
  starfieldEnabled: boolean;
  nebulaEffectsEnabled: boolean;
  cosmicParticlesEnabled: boolean;
} 