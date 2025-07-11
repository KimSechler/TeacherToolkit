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
import { AttendanceTheme, getThemeById, answerColors } from "@/lib/attendanceThemes";
import { spaceAvatars, getSpaceAvatarById, getNextSpaceAvatar, SpaceAvatarComponent } from "@/lib/spaceAvatars.tsx";
import { 
  soundManager, 
  ConfettiAnimation, 
  ParticleSystem, 
  animateElement, 
  createRippleEffect 
} from "@/lib/attendanceEffects";
import { ArrowLeft, Settings, Download, RotateCcw, Volume2, VolumeX, BookOpen, Shuffle, PieChart } from "lucide-react";
import { QuestionOfDay, getRandomQuestion } from "@/lib/questionLibrary";
import QuestionLibraryModal from './question-library-modal';
import ResultsModal, { AttendanceResults } from './results-modal';

interface Student {
  id: number;
  name: string;
  classId: number;
  createdAt: Date;
  avatarUrl?: string | null;
}

interface AttendanceTrackerModernProps {
  classId: number;
  themeId: string;
  date?: Date;
  question?: QuestionOfDay | null;
}

const answerEmojis = ['✅', '❌', '🔵', '🟡', '🟣', '🩷', '🟦', '🟠'];

export default function AttendanceTrackerModern({ 
  classId, 
  themeId, 
  date = new Date(),
  question = null
}: AttendanceTrackerModernProps) {
  const [selectedDate, setSelectedDate] = useState(date.toISOString().split('T')[0]);
  const [questionOfDay, setQuestionOfDay] = useState(question?.text || "What's your favorite color?");
  const [answerOptions, setAnswerOptions] = useState(question?.answers.join('\n') || "Red\nBlue\nGreen\nYellow");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [draggedStudent, setDraggedStudent] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [confettiEnabled, setConfettiEnabled] = useState(true);
  const [showQuestionLibraryModal, setShowQuestionLibraryModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update question state when prop changes
  useEffect(() => {
    if (question) {
      setQuestionOfDay(question.text);
      setAnswerOptions(question.answers.join('\n'));
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
        title: "Attendance Updated",
        description: "Student attendance has been recorded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update attendance. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize confetti when canvas is available
  useEffect(() => {
    if (confettiRef.current && confettiEnabled && !confettiAnimationRef.current) {
      confettiAnimationRef.current = new ConfettiAnimation(confettiRef.current);
      console.log('Confetti initialized');
    }
  }, [confettiRef.current, confettiEnabled]);

  // Initialize particles and sounds
  useEffect(() => {
    if (particlesRef.current) {
      particleSystemRef.current = new ParticleSystem(particlesRef.current);
      particleSystemRef.current.createParticles(theme.particleCount, themeId);
    }

    // Load sounds
    Object.entries(soundManager).forEach(([name, sound]) => {
      if ((sound as any).url) {
        soundManager.loadSound(name, (sound as any).url);
      }
    });

    return () => {
      particleSystemRef.current?.stop();
    };
  }, [themeId]);

  // Cleanup confetti on unmount
  useEffect(() => {
    return () => {
      confettiAnimationRef.current?.stop();
    };
  }, []);

  const answers = answerOptions.split('\n').filter(a => a.trim());

  const getStudentEmoji = (studentName: string) => {
    const studentIndex = students.findIndex((s: Student) => s.name === studentName);
    return theme.emojis[studentIndex % theme.emojis.length];
  };

  // Enhanced student representation for space theme
  const getStudentAvatar = (studentName: string) => {
    if (themeId !== 'space') {
      return getStudentEmoji(studentName);
    }

    const studentIndex = students.findIndex((s: Student) => s.name === studentName);
    const avatarType = studentIndex % spaceAvatars.length;
    
    const avatar = spaceAvatars[avatarType];
    
    // Use larger size for students section, smaller for answer zones
    const isInStudentsSection = !attendanceData[studentName];
    return <SpaceAvatarComponent avatar={avatar} size={isInStudentsSection ? "lg" : "md"} />;
  };

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

  const playSound = (soundName: string) => {
    if (soundEnabled) {
      // Use space-themed sounds for space theme
      if (themeId === 'space') {
        const spaceSoundMap: Record<string, string> = {
          success: 'rocket',
          select: 'laser',
          dragStart: 'space',
          drop: 'alien',
          sparkle: 'laser',
          heart: 'space',
          giggle: 'alien',
          pop: 'rocket'
        };
        const spaceSound = spaceSoundMap[soundName] || soundName;
        soundManager.playSound(spaceSound);
      } else {
        soundManager.playSound(soundName);
      }
    }
  };

  const triggerConfetti = (x: number, y: number) => {
    console.log('Triggering confetti:', { confettiEnabled, hasRef: !!confettiAnimationRef.current, x, y });
    
    if (confettiEnabled) {
      // Try to initialize confetti if not already initialized
      if (!confettiAnimationRef.current && confettiRef.current) {
        confettiAnimationRef.current = new ConfettiAnimation(confettiRef.current);
        console.log('Confetti initialized on demand');
      }
      
      if (confettiAnimationRef.current) {
        confettiAnimationRef.current.createConfetti(x, y, 30);
      } else {
        console.log('Confetti not available, retrying in 100ms');
        // Retry after a short delay
        setTimeout(() => {
          if (confettiRef.current && !confettiAnimationRef.current) {
            confettiAnimationRef.current = new ConfettiAnimation(confettiRef.current);
          }
          if (confettiAnimationRef.current) {
            confettiAnimationRef.current.createConfetti(x, y, 30);
          }
        }, 100);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, studentName: string) => {
    e.dataTransfer.setData("text/plain", studentName);
    setDraggedStudent(studentName);
    setSelectedStudent(null);
    (e.currentTarget as HTMLElement).style.opacity = '0.5';
    playSound('dragStart');
    createRippleEffect(e.nativeEvent, e.currentTarget as HTMLElement);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
    setDraggedStudent(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('scale-105');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('scale-105');
  };

  const handleDrop = (e: React.DragEvent, answer: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('scale-105');
    const studentName = e.dataTransfer.getData("text/plain");
    moveStudentToAnswer(studentName, answer, e.clientX, e.clientY);
    setDraggedStudent(null);
  };

  const handleDropToOriginal = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('scale-105');
    const studentName = e.dataTransfer.getData("text/plain");
    moveStudentToOriginal(studentName);
    setDraggedStudent(null);
  };

  const selectStudent = (studentName: string) => {
    setSelectedStudent(selectedStudent === studentName ? null : studentName);
    playSound('select');
    createRippleEffect(event as MouseEvent, event?.target as HTMLElement);
  };

  const moveStudentToAnswer = (studentName: string, answer: string, x?: number, y?: number) => {
    setAttendanceData(prev => ({ ...prev, [studentName]: answer }));
    
    // Play success sound and trigger confetti
    playSound('success');
    if (x && y) {
      triggerConfetti(x, y);
    }
    
    // Animate the student element
    const studentElement = document.querySelector(`[data-student="${studentName}"]`) as HTMLElement;
    if (studentElement) {
      animateElement(studentElement, 'bounce');
    }
    
    // Update in database
    const student = students.find((s: Student) => s.name === studentName);
    if (student) {
      attendanceMutation.mutate({ 
        studentId: student.id, 
        status: 'present', 
        notes: `Question: ${questionOfDay} | Answer: ${answer}` 
      });
    }
  };

  const moveStudentToOriginal = (studentName: string) => {
    setAttendanceData(prev => {
      const newData = { ...prev };
      delete newData[studentName];
      return newData;
    });
    
    playSound('drop');
    
    // Update in database
    const student = students.find((s: Student) => s.name === studentName);
    if (student) {
      attendanceMutation.mutate({ 
        studentId: student.id, 
        status: 'not-marked', 
        notes: '' 
      });
    }
  };

  const answerZoneClick = (answer: string, event: React.MouseEvent) => {
    if (!selectedStudent) return;
    moveStudentToAnswer(selectedStudent, answer, event.clientX, event.clientY);
    setSelectedStudent(null);
  };

  const originalSectionClick = (e: React.MouseEvent) => {
    if (!selectedStudent) return;
    
    // Only process if clicking on the container, not a student
    if ((e.target as HTMLElement).closest('.student-icon')) return;
    
    moveStudentToOriginal(selectedStudent);
    setSelectedStudent(null);
  };

  const resetAll = () => {
    setAttendanceData({});
    setSelectedStudent(null);
    
    // Reset all students in database
    students.forEach((student: Student) => {
      attendanceMutation.mutate({ 
        studentId: student.id, 
        status: 'not-marked', 
        notes: '' 
      });
    });
  };

  const downloadReport = () => {
    const reportDate = new Date(selectedDate).toLocaleDateString();
    
    let report = `Attendance Report - ${reportDate}\n`;
    report += `Question: ${questionOfDay}\n\n`;
    
    // Count responses
    const responseCounts: Record<string, number> = {};
    Object.values(attendanceData).forEach(answer => {
      responseCounts[answer] = (responseCounts[answer] || 0) + 1;
    });
    
    report += 'Response Summary:\n';
    Object.entries(responseCounts).forEach(([answer, count]) => {
      report += `${answer}: ${count} students\n`;
    });
    
    report += '\nDetailed Responses:\n';
    Object.entries(attendanceData).forEach(([student, answer]) => {
      report += `${student}: ${answer}\n`;
    });
    
    // Students who haven't responded
    const allStudentNames = students.map((s: Student) => s.name);
    const respondedStudents = Object.keys(attendanceData);
    const notResponded = allStudentNames.filter(name => !respondedStudents.includes(name));
    if (notResponded.length > 0) {
      report += '\nNot Responded:\n';
      notResponded.forEach(student => {
        report += `${student}: No response\n`;
      });
    }
    
    // Create and download file
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${reportDate.replace(/\//g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const goBack = () => {
    window.history.back();
  };

  const handleShuffleQuestion = () => {
    const newQuestion = getRandomQuestion();
    setQuestionOfDay(newQuestion.text);
    setAnswerOptions(newQuestion.answers.join('\n'));
    toast({
      title: "Question Shuffled! 🎲",
      description: `"${newQuestion.text}" is now the active question.`,
    });
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
          <div className="flex gap-3">
            <Button onClick={() => setShowSettings(!showSettings)} variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
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
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              {themeId === 'space' ? '🚀 Today\'s Mission 🚀' : '📝 Today\'s Question'}
            </h2>
            <div className="text-center">
              {themeId === 'space' ? (
                <p className="text-2xl font-bold text-white bg-gradient-to-r from-indigo-600/90 to-purple-600/90 rounded-2xl p-6 backdrop-blur-lg border-2 border-indigo-400/60 shadow-2xl shadow-indigo-500/60">
                  {questionOfDay}
                </p>
              ) : (
                <p className="text-2xl font-bold text-white">{questionOfDay}</p>
              )}
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
            const color = answerColors[index % answerColors.length];
            const emoji = answerEmojis[index % answerEmojis.length];
            const studentsInZone = Object.entries(attendanceData)
              .filter(([_, ans]) => ans === answer.trim())
              .map(([name, _]) => name);

            return (
              <div
                key={answer}
                className={`${theme.answerZone.background} ${theme.answerZone.border} ${theme.answerZone.shadow} ${theme.answerZone.hover} rounded-2xl p-6 min-h-[120px] transition-all duration-300 ${
                  selectedStudent ? 'cursor-pointer' : ''
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, answer.trim())}
                onClick={(e) => selectedStudent && answerZoneClick(answer.trim(), e)}
              >
                <h4 className={`text-2xl font-bold text-white mb-4 text-center`}>
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
                      <div className="mb-1">{getStudentAvatar(studentName)}</div>
                      <div className={`text-sm font-medium text-white ${
                        themeId === 'space' ? '' : 'bg-black/20 rounded-full px-2 py-1 backdrop-blur-sm'
                      } ${
                        selectedStudent === studentName ? 'bg-white/30 border-2 border-white' : ''
                      }`}>
                        {formatStudentName(studentName)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Students Section */}
        {themeId === 'space' ? (
          <div 
            className="mb-8"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDropToOriginal}
            onClick={originalSectionClick}
          >
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
                      className={`student-icon text-center cursor-pointer transition-transform select-none ${theme.studentCard.hover} ${
                        isSelected ? 'scale-110 filter drop-shadow-lg' : ''
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, studentName)}
                      onDragEnd={handleDragEnd}
                      onClick={() => selectStudent(studentName)}
                    >
                      <div className="mb-2">{getStudentAvatar(studentName)}</div>
                      <div className={`text-lg font-medium text-white ${
                        themeId === 'space' ? '' : 'bg-black/20 rounded-full px-3 py-1 backdrop-blur-sm'
                      } ${
                        isSelected ? 'bg-white/30 border-2 border-white' : ''
                      }`}>
                        {formatStudentName(studentName)}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : (
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
                        className={`student-icon text-center cursor-pointer transition-transform select-none ${theme.studentCard.hover} ${
                          isSelected ? 'scale-110 filter drop-shadow-lg' : ''
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, studentName)}
                        onDragEnd={handleDragEnd}
                        onClick={() => selectStudent(studentName)}
                      >
                        <div className="mb-2">{getStudentAvatar(studentName)}</div>
                        <div className={`text-lg font-medium text-white ${
                          themeId === 'space' ? '' : 'bg-black/20 rounded-full px-3 py-1 backdrop-blur-sm'
                        } ${
                          isSelected ? 'bg-white/30 border-2 border-white' : ''
                        }`}>
                          {formatStudentName(studentName)}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <Card className={`mb-8 rounded-3xl ${theme.glassmorphism.background} ${theme.glassmorphism.border} ${theme.glassmorphism.shadow} border-0`}>
            <CardHeader>
              <CardTitle className="text-white">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="question" className="text-white">Daily Question</Label>
                  <Textarea
                    id="question"
                    value={questionOfDay}
                    onChange={(e) => setQuestionOfDay(e.target.value)}
                    rows={3}
                    className="bg-white/20 border-white/30 text-white placeholder-white/50"
                  />
                </div>
                
                <div>
                  <Label htmlFor="answers" className="text-white">Answer Options (one per line)</Label>
                  <Textarea
                    id="answers"
                    value={answerOptions}
                    onChange={(e) => setAnswerOptions(e.target.value)}
                    rows={3}
                    className="bg-white/20 border-white/30 text-white placeholder-white/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date" className="text-white">Select Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-white/20 border-white/30 text-white"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sound"
                      checked={soundEnabled}
                      onChange={(e) => setSoundEnabled(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="sound" className="text-white">Sound Effects</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="confetti"
                      checked={confettiEnabled}
                      onChange={(e) => setConfettiEnabled(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="confetti" className="text-white">Confetti</Label>
                  </div>
                </div>

                <div className="flex items-end">
                  <Button onClick={resetAll} variant="destructive" className="w-full">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <QuestionLibraryModal
        isOpen={showQuestionLibraryModal}
        onClose={() => setShowQuestionLibraryModal(false)}
        onSelectQuestion={(newQuestion) => {
          setQuestionOfDay(newQuestion.text);
          setAnswerOptions(newQuestion.answers.join('\n'));
          setShowQuestionLibraryModal(false);
          toast({
            title: "Question Changed! 🎲",
            description: `"${newQuestion.text}" is now the active question.`,
          });
        }}
      />

      {/* Results Modal */}
      <ResultsModal
        isOpen={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        attendanceData={{
          classId: classId,
          className: "Modern Class",
          date: selectedDate,
          question: questionOfDay,
          answers: answers.map(answer => ({
            answer: answer.trim(),
            count: Object.values(attendanceData).filter(a => a === answer.trim()).length,
            percentage: 0,
            students: Object.entries(attendanceData)
              .filter(([_, ans]) => ans === answer.trim())
              .map(([name, _]) => name),
            color: "#3B82F6"
          })),
          totalStudents: students.length,
          respondedStudents: Object.keys(attendanceData).length,
          attendanceRate: (Object.keys(attendanceData).length / students.length) * 100,
          sessionDuration: 15,
          teacherName: "Teacher",
          allStudents: students.map((s: any) => s.name),
          checkInTimes: {},
          metadata: {
            themeUsed: "Modern Theme",
            settingsUsed: { soundEnabled, confettiEnabled },
            startTime: "9:00 AM",
            endTime: "9:15 AM"
          }
        }}
      />
    </div>
  );
} 