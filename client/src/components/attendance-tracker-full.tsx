import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AttendanceTheme, getThemeById, answerColors, answerEmojis } from "@/lib/attendanceThemes";
import { 
  soundManager, 
  ConfettiAnimation, 
  ParticleSystem, 
  animateElement, 
  createRippleEffect,
  playCuteSound,
  type SoundEffect
} from "@/lib/attendanceEffects";
import { ArrowLeft, Settings, Download, RotateCcw, Volume2, VolumeX, PieChart, BookOpen, Shuffle } from "lucide-react";
import { getVisualElements, type QuestionOfDay, getRandomQuestion } from "@/lib/questionLibrary";
import SettingsModal, { AttendanceSettings } from './settings-modal';
import ResultsModal, { AttendanceResults } from './results-modal';
import QuestionLibraryModal from './question-library-modal';

interface Student {
  id: number;
  name: string;
  classId: number;
  createdAt: Date;
  avatarUrl?: string | null;
}

interface AttendanceTrackerFullProps {
  classId: number;
  themeId: string;
  date?: Date;
  question?: QuestionOfDay | null;
}

export default function AttendanceTrackerFull({ 
  classId, 
  themeId, 
  date = new Date(),
  question = null
}: AttendanceTrackerFullProps) {
  const [selectedDate, setSelectedDate] = useState(date.toISOString().split('T')[0]);
  const [questionOfDay, setQuestionOfDay] = useState(question?.text || "What's your favorite color?");
  const [answerOptions, setAnswerOptions] = useState(question?.answers.join('\n') || "Red\nBlue\nGreen\nYellow");
  const [currentQuestionType, setCurrentQuestionType] = useState<string>(question?.visualType || "colors");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [draggedStudent, setDraggedStudent] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showQuestionLibraryModal, setShowQuestionLibraryModal] = useState(false);
  const [attendanceSettings, setAttendanceSettings] = useState<AttendanceSettings>({
    soundEnabled: true,
    confettiEnabled: true,
    animationsEnabled: true,
    visualEffectsEnabled: true,
    autoSaveEnabled: true,
    showProgressBar: true,
    starfieldEnabled: true,
    nebulaEffectsEnabled: true,
    cosmicParticlesEnabled: true,
  });
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [checkInTimes, setCheckInTimes] = useState<Record<string, string>>({});
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(question?.id || null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update question state when prop changes
  useEffect(() => {
    if (question) {
      setQuestionOfDay(question.text);
      setAnswerOptions(question.answers.join('\n'));
      setCurrentQuestionType(question.visualType);
      setCurrentQuestionId(question.id);
    }
  }, [question]);

  const theme = getThemeById(themeId);
  const confettiRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<HTMLCanvasElement>(null);
  const confettiAnimationRef = useRef<ConfettiAnimation | null>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);

  // Fetch students for the class
  const { data: students = [] as Student[], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/classes', classId, 'students'],
    enabled: !!classId,
    retry: 3,
    staleTime: 30000,
  });

  // Fetch recently used questions for this class
  const { data: recentQuestionIds = [] } = useQuery<number[]>({
    queryKey: ['/api/classes', classId, 'recent-questions'],
    enabled: !!classId,
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/classes/${classId}/recent-questions?days=7`);
      return response as unknown as number[];
    },
  });

  // Record question usage mutation
  const recordQuestionUsageMutation = useMutation({
    mutationFn: async (questionId: number) => {
      return await apiRequest('POST', '/api/question-usage', {
        questionId,
        classId,
      });
    },
    onError: (error) => {
      console.error('Failed to record question usage:', error);
    },
  });

  // Create or update attendance record
  const attendanceMutation = useMutation({
    mutationFn: async ({ studentId, status, notes }: { studentId: number; status: string; notes?: string }) => {
      return apiRequest('POST', `/api/attendance`, {
        studentId,
        classId,
        date: selectedDate,
        status,
        notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/classes', classId, 'attendance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/classes', classId, 'attendance', 'stats'] });
      toast({
        title: "🎉 Attendance Updated!",
        description: "Student attendance has been recorded with sparkles! ✨",
      });
    },
    onError: (error) => {
      toast({
        title: "Oops! 😅",
        description: "Failed to update attendance. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize animations and sounds
  useEffect(() => {
    if (confettiRef.current && attendanceSettings.confettiEnabled) {
      confettiAnimationRef.current = new ConfettiAnimation(confettiRef.current);
    }
    
    if (particlesRef.current && attendanceSettings.visualEffectsEnabled) {
      particleSystemRef.current = new ParticleSystem(particlesRef.current);
      particleSystemRef.current.createParticles(theme.particleCount, themeId);
    }

    // Load sounds
    Object.entries(soundManager).forEach(([name, sound]) => {
      if ((sound as SoundEffect).url) {
        soundManager.loadSound(name, (sound as SoundEffect).url);
      }
    });

    return () => {
      confettiAnimationRef.current?.stop();
      particleSystemRef.current?.stop();
    };
  }, [themeId, attendanceSettings.confettiEnabled, attendanceSettings.visualEffectsEnabled]);

  const answers = answerOptions.split('\n').filter(a => a.trim());
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  // Helper function to format student name for display (First Name + Last Initial)
  const formatStudentName = (fullName: string) => {
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
      const firstName = parts[0];
      const lastName = parts[parts.length - 1];
      return `${firstName} ${lastName.charAt(0)}.`;
    }
    return fullName; // Fallback for single names
  };

  const getStudentEmoji = (studentName: string) => {
    const studentIndex = students.findIndex((s: Student) => s.name === studentName);
    return theme.emojis[studentIndex % theme.emojis.length];
  };

  const playSound = (soundName: string) => {
    if (attendanceSettings.soundEnabled) {
      playCuteSound(soundName as any);
    }
  };

  const triggerConfetti = (x: number, y: number) => {
    if (attendanceSettings.confettiEnabled && confettiAnimationRef.current) {
      confettiAnimationRef.current.createConfetti(x, y, 30);
    }
  };

  const handleDragStart = (e: React.DragEvent, studentName: string) => {
    e.dataTransfer.setData("text/plain", studentName);
    setDraggedStudent(studentName);
    setSelectedStudent(null);
    (e.currentTarget as HTMLElement).style.opacity = '0.5';
    playSound('dragStart');
    createRippleEffect(e.nativeEvent, e.currentTarget as HTMLElement);
    
    // Add cute floating effect
    animateElement(e.currentTarget as HTMLElement, 'animate-float', 1000);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
    setDraggedStudent(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('scale-105');
    (e.currentTarget as HTMLElement).style.transform = 'scale(1.05) rotate(2deg)';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('scale-105');
    (e.currentTarget as HTMLElement).style.transform = 'scale(1) rotate(0deg)';
  };

  const handleDrop = (e: React.DragEvent, answer: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('scale-105');
    (e.currentTarget as HTMLElement).style.transform = 'scale(1) rotate(0deg)';
    const studentName = e.dataTransfer.getData("text/plain");
    moveStudentToAnswer(studentName, answer, e.clientX, e.clientY);
    setDraggedStudent(null);
  };

  const handleDropToOriginal = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('scale-105');
    (e.currentTarget as HTMLElement).style.transform = 'scale(1) rotate(0deg)';
    const studentName = e.dataTransfer.getData("text/plain");
    moveStudentToOriginal(studentName);
    setDraggedStudent(null);
  };

  const selectStudent = (studentName: string) => {
    setSelectedStudent(selectedStudent === studentName ? null : studentName);
    playSound('select');
    createRippleEffect(event as MouseEvent, event?.target as HTMLElement);
    
    // Add cute wiggle animation
    const element = event?.target as HTMLElement;
    if (element) {
      animateElement(element, 'animate-wiggle', 800);
    }
  };

  const moveStudentToAnswer = (studentName: string, answer: string, x?: number, y?: number) => {
    setAttendanceData(prev => ({ ...prev, [studentName]: answer }));
    
    // Record check-in time when student moves to answer
    const checkInTime = new Date().toLocaleTimeString();
    setCheckInTimes(prev => ({ ...prev, [studentName]: checkInTime }));
    
    // Play success sound and trigger confetti
    playSound('success');
    if (x && y) {
      triggerConfetti(x, y);
    }
    
    // Add cute bounce animation to the answer zone
    const answerZone = document.querySelector(`[data-answer="${answer}"]`) as HTMLElement;
    if (answerZone) {
      animateElement(answerZone, 'animate-bounce', 1000);
    }
    
    // Record question usage if we have a question ID
    if (currentQuestionId) {
      recordQuestionUsageMutation.mutate(currentQuestionId);
    }
    
    // Save attendance to database
    const student = students.find((s: Student) => s.name === studentName);
    if (student) {
      attendanceMutation.mutate({
        studentId: student.id,
        status: 'present',
        notes: answer
      });
    }
  };

  const moveStudentToOriginal = (studentName: string) => {
    setAttendanceData(prev => {
      const newData = { ...prev };
      delete newData[studentName];
      return newData;
    });
    
    // Remove check-in time when student is moved back
    setCheckInTimes(prev => {
      const newTimes = { ...prev };
      delete newTimes[studentName];
      return newTimes;
    });
    
    playSound('drop');
    
    // Add cute pop animation
    const studentElement = document.querySelector(`[data-student="${studentName}"]`) as HTMLElement;
    if (studentElement) {
      animateElement(studentElement, 'animate-pulse', 500);
    }
    
    // Save attendance to database
    const student = students.find((s: Student) => s.name === studentName);
    if (student) {
      attendanceMutation.mutate({
        studentId: student.id,
        status: 'absent',
        notes: ''
      });
    }
  };

  const answerZoneClick = (answer: string, event: React.MouseEvent) => {
    if (selectedStudent) {
      moveStudentToAnswer(selectedStudent, answer, event.clientX, event.clientY);
      setSelectedStudent(null);
    }
  };

  const originalSectionClick = (e: React.MouseEvent) => {
    if (selectedStudent) {
      moveStudentToOriginal(selectedStudent);
      setSelectedStudent(null);
    }
  };

  const resetAll = () => {
    setAttendanceData({});
    setSelectedStudent(null);
    setDraggedStudent(null);
    playSound('pop');
    
    // Add cute reset animation
    const container = document.querySelector('.attendance-container') as HTMLElement;
    if (container) {
      animateElement(container, 'animate-pulse', 1000);
    }
    
    toast({
      title: "✨ Fresh Start!",
      description: "All students are back to the beginning! 🎉",
    });
  };

  const downloadReport = () => {
    const report = {
      date: selectedDate,
      question: questionOfDay,
      answers: answerOptions,
      attendance: attendanceData,
      totalStudents: students.length,
      presentStudents: Object.keys(attendanceData).length,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${selectedDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    playSound('success');
    toast({
      title: "📊 Report Downloaded!",
      description: "Your attendance report is ready! 🎉",
    });
  };

  const goBack = () => {
    window.history.back();
  };

  const handleShuffleQuestion = () => {
    const newQuestion = getRandomQuestion();
    setQuestionOfDay(newQuestion.text);
    setAnswerOptions(newQuestion.answers.join('\n'));
    setCurrentQuestionType(newQuestion.visualType);
    setCurrentQuestionId(newQuestion.id);
    toast({
      title: "Question Shuffled! 🎲",
      description: `"${newQuestion.text}" is now the active question.`,
    });
  };

  // Question selection now handled by parent component

  // Random question functionality removed - now managed by parent component

  // Generate results data from current attendance state
  const generateResultsData = (): AttendanceResults => {
    const answers = answerOptions.split('\n').filter(a => a.trim());
    const answerResults = answers.map((answer, index) => {
      const studentsForAnswer = Object.entries(attendanceData)
        .filter(([_, ans]) => ans === answer.trim())
        .map(([name, _]) => name);
      
      const count = studentsForAnswer.length;
      const percentage = students.length > 0 ? (count / students.length) * 100 : 0;
      
      return {
        answer: answer.trim(),
        count,
        percentage,
        students: studentsForAnswer,
        color: colors[index % colors.length]
      };
    });

    const sessionDuration = Math.floor((Date.now() - sessionStartTime.getTime()) / 60000); // minutes

    return {
      classId,
      className: `Class ${classId}`, // This would come from API in real app
      date: selectedDate,
      question: questionOfDay,
      answers: answerResults,
      totalStudents: students.length,
      respondedStudents: Object.keys(attendanceData).length,
      attendanceRate: students.length > 0 ? (Object.keys(attendanceData).length / students.length) * 100 : 0,
      sessionDuration,
      teacherName: "Teacher", // This would come from auth in real app
      checkInTimes,
      allStudents: students.map(s => s.name), // Add complete student list
      metadata: {
        themeUsed: theme.name,
        settingsUsed: attendanceSettings,
        startTime: sessionStartTime.toLocaleTimeString(),
        endTime: new Date().toLocaleTimeString()
      }
    };
  };

  if (studentsLoading) {
    return (
      <div className={`min-h-screen ${theme.background} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.background} relative overflow-hidden`} style={{ fontFamily: 'Fredoka, sans-serif' }}>
      {/* Background Canvas for Particles */}
      <canvas
        ref={particlesRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ zIndex: 0 }}
      />
      
      {/* Confetti Canvas */}
      <canvas
        ref={confettiRef}
        className="fixed inset-0 pointer-events-none z-50"
        style={{ zIndex: 50 }}
      />

      {/* Header */}
      <div className={`relative z-10 ${theme.glassmorphism.background} ${theme.glassmorphism.border} ${theme.glassmorphism.shadow} p-4 mb-6`}>
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button onClick={goBack} variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{theme.icon}</span>
              <h1 className="text-3xl font-bold text-white">{theme.name} Attendance Tracker</h1>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {Object.keys(attendanceData).length} / {students.length}
              </div>
              <div className="text-sm text-white/80">Students Responded</div>
              {attendanceSettings.showProgressBar && (
                <div className="w-24 h-2 bg-white/20 rounded-full mt-1">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${(Object.keys(attendanceData).length / students.length) * 100}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setAttendanceSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))} 
              variant="outline" 
              size="sm"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              {attendanceSettings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button onClick={() => setShowSettingsModal(true)} variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button onClick={() => setShowQuestionLibraryModal(true)} variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <BookOpen className="w-4 h-4 mr-2" />
              Change Question
            </Button>
            <Button onClick={handleShuffleQuestion} variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30" title="Shuffle Question">
              <Shuffle className="w-4 h-4" />
            </Button>
            <Button onClick={() => setShowResultsModal(true)} className="bg-green-600 hover:bg-green-700 text-white">
              <PieChart className="w-4 h-4 mr-2" />
              View Results
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Question Section */}
        <Card className={`mb-8 rounded-3xl ${theme.questionBox.background} ${theme.questionBox.border} ${theme.questionBox.shadow} border-0`}>
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">✨ Today's Question ✨</h2>
            </div>
            <div className="text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="text-4xl animate-bounce">🌟</span>
              </div>
              <p className="text-2xl font-bold text-white bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
                {questionOfDay}
              </p>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                <span className="text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>💫</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answer Zones */}
        <div className={`grid gap-6 mb-6 ${
          answers.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : 
          answers.length <= 3 ? 'grid-cols-1 md:grid-cols-3' : 
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        }`}>
          {answers.map((answer, index) => {
            const visualElements = getVisualElements(currentQuestionType);
            const color = visualElements.colors[index] || theme.answerZone.background;
            const emoji = visualElements.emojis[index] || answerEmojis[index % answerEmojis.length];
            const studentsInZone = Object.entries(attendanceData)
              .filter(([_, ans]) => ans === answer.trim())
              .map(([name, _]) => name);

            return (
              <div
                key={answer}
                data-answer={answer.trim()}
                className={`${color} ${theme.answerZone.border} ${theme.answerZone.shadow} ${theme.answerZone.hover} rounded-2xl p-6 min-h-[120px] transition-all duration-300 relative overflow-hidden ${
                  selectedStudent ? 'cursor-pointer' : ''
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, answer.trim())}
                onClick={(e) => selectedStudent && answerZoneClick(answer.trim(), e)}
              >
                {/* Floating sparkles background */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-2 left-2 text-lg animate-pulse">✨</div>
                  <div className="absolute top-4 right-4 text-sm animate-pulse" style={{ animationDelay: '1s' }}>💫</div>
                  <div className="absolute bottom-2 left-4 text-base animate-pulse" style={{ animationDelay: '2s' }}>⭐</div>
                </div>
                
                <h4 className={`text-2xl font-bold text-white mb-4 text-center relative z-10`}>
                  {emoji} {answer.trim()}
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {studentsInZone.map(studentName => (
                    <div
                      key={studentName}
                      data-student={studentName}
                      className={`student-icon text-center cursor-pointer transition-transform ${
                        selectedStudent === studentName ? 'scale-110 filter drop-shadow-lg' : ''
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, studentName)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectStudent(studentName);
                      }}
                    >
                      <div className="text-4xl mb-1">{getStudentEmoji(studentName)}</div>
                      <div className={`text-sm font-medium text-gray-800 bg-white rounded-full px-2 py-1 shadow-sm ${
                        selectedStudent === studentName ? 'bg-yellow-100 border-2 border-yellow-500' : ''
                      }`}>
                        {formatStudentName(studentName)}
                      </div>
                      {checkInTimes[studentName] && (
                        <div className="text-xs text-white/80 mt-1">
                          {checkInTimes[studentName]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Students Section */}
        <Card className={`mb-8 rounded-3xl ${theme.studentCard.background} ${theme.studentCard.border} ${theme.studentCard.shadow} border-0`}>
          <CardContent 
            className="p-8"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDropToOriginal}
            onClick={originalSectionClick}
          >
            <h3 className="text-2xl font-bold text-white mb-6 text-center">👥 Students - Drag Your {theme.name} to Answer!</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {students
                .filter((student: Student) => !attendanceData[student.name])
                .map((student: Student) => {
                  const studentName = student.name;
                  const isSelected = selectedStudent === studentName;
                  
                  return (
                    <div
                      key={student.id}
                      data-student={studentName}
                      className={`student-icon text-center cursor-pointer transition-all duration-300 select-none ${theme.studentCard.hover} ${
                        isSelected ? 'scale-110 filter drop-shadow-lg' : 'hover:scale-105'
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, studentName)}
                      onDragEnd={handleDragEnd}
                      onClick={() => selectStudent(studentName)}
                    >
                      <div className="relative">
                        <div className="text-6xl mb-2 animate-float">{getStudentEmoji(studentName)}</div>
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 text-2xl animate-bounce">
                            <span className="text-yellow-400">⭐</span>
                          </div>
                        )}
                      </div>
                      <div className={`text-lg font-medium text-gray-800 bg-white rounded-full px-3 py-1 shadow-sm ${
                        isSelected ? 'bg-yellow-100 border-2 border-yellow-500' : ''
                      }`}>
                        {formatStudentName(studentName)}
                      </div>
                      {isSelected && (
                        <div className="mt-2 text-xs text-white/80 bg-white/10 rounded-full px-2 py-1">
                          Click to deselect
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question selection now handled by parent component */}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={attendanceSettings}
        onSettingsChange={setAttendanceSettings}
        currentTheme={theme}
        currentQuestion={{ text: questionOfDay, answers: answers }}
      />

      {/* Results Modal */}
      {showResultsModal && students.length > 0 && (
        <ResultsModal
          isOpen={showResultsModal}
          onClose={() => setShowResultsModal(false)}
          attendanceData={generateResultsData()}
        />
      )}

      {/* Question Library Modal */}
      <QuestionLibraryModal
        isOpen={showQuestionLibraryModal}
        onClose={() => setShowQuestionLibraryModal(false)}
        onSelectQuestion={(question: QuestionOfDay) => {
          setQuestionOfDay(question.text);
          setAnswerOptions(question.answers.join('\n'));
          setCurrentQuestionType(question.visualType);
          setCurrentQuestionId(question.id);
          setShowQuestionLibraryModal(false);
          toast({
            title: "Question Changed! ✨",
            description: `"${question.text}" is now the active question.`,
          });
        }}
      />
    </div>
  );
}