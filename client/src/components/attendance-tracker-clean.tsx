import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AttendanceTheme, getThemeById } from "@/lib/attendanceThemes";
import { ArrowLeft, Settings, PieChart, BookOpen, Shuffle, Volume2, VolumeX } from "lucide-react";
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

interface AttendanceTrackerCleanProps {
  classId: number;
  themeId: string;
  date?: Date;
  question?: QuestionOfDay | null;
}

export default function AttendanceTrackerClean({ 
  classId, 
  themeId, 
  date = new Date(),
  question = null
}: AttendanceTrackerCleanProps) {
  const [selectedDate, setSelectedDate] = useState(date.toISOString().split('T')[0]);
  const [questionOfDay, setQuestionOfDay] = useState(question?.text || "What's your favorite color?");
  const [answerOptions, setAnswerOptions] = useState(question?.answers.join('\n') || "Red\nBlue\nGreen\nYellow");
  const [currentQuestionType, setCurrentQuestionType] = useState<string>(question?.visualType || "colors");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [draggedStudent, setDraggedStudent] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showQuestionLibraryModal, setShowQuestionLibraryModal] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [attendanceSettings, setAttendanceSettings] = useState<AttendanceSettings>({
    soundEnabled: true,
    confettiEnabled: true,
    animationsEnabled: true,
    visualEffectsEnabled: true,
    autoSaveEnabled: true,
    showProgressBar: true,
    starfieldEnabled: false,
    nebulaEffectsEnabled: false,
    cosmicParticlesEnabled: false,
  });
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [checkInTimes, setCheckInTimes] = useState<Record<string, string>>({});
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(question?.id || null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const headerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Fetch students for the class
  const { data: students = [] as Student[], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/classes', classId, 'students'],
    enabled: !!classId,
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
        description: "Student attendance has been recorded!",
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

  const answers = answerOptions.split('\n').filter(a => a.trim());

  // Helper function to format student name for display (First Last.)
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

  // Auto-hiding header logic
  const handleMouseMove = (e: React.MouseEvent) => {
    const y = e.clientY;
    const threshold = 50; // Show header when mouse is within 50px of top

    if (y <= threshold) {
      setHeaderVisible(true);
      // Clear existing timeout
      if (headerTimeoutRef.current) {
        clearTimeout(headerTimeoutRef.current);
      }
    } else {
      // Hide header after 2 seconds of mouse being away from top
      if (headerTimeoutRef.current) {
        clearTimeout(headerTimeoutRef.current);
      }
      headerTimeoutRef.current = setTimeout(() => {
        setHeaderVisible(false);
      }, 2000);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (headerTimeoutRef.current) {
        clearTimeout(headerTimeoutRef.current);
      }
    };
  }, []);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, studentName: string) => {
    setDraggedStudent(studentName);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', studentName);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedStudent(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, answer: string) => {
    e.preventDefault();
    const studentName = e.dataTransfer.getData('text/plain');
    if (studentName) {
      moveStudentToAnswer(studentName, answer);
    }
  };

  const selectStudent = (studentName: string) => {
    if (selectedStudent === studentName) {
      setSelectedStudent(null);
    } else {
      setSelectedStudent(studentName);
    }
  };

  const moveStudentToAnswer = (studentName: string, answer: string) => {
    const student = students.find(s => s.name === studentName);
    if (!student) return;

    const newAttendanceData = { ...attendanceData };
    newAttendanceData[studentName] = answer;
    setAttendanceData(newAttendanceData);

    // Record attendance
    attendanceMutation.mutate({
      studentId: student.id,
      status: 'present',
      notes: `Answered: ${answer}`
    });

    // Record check-in time
    const now = new Date().toLocaleTimeString();
    setCheckInTimes(prev => ({ ...prev, [studentName]: now }));

    // Record question usage if we have a question ID
    if (currentQuestionId) {
      recordQuestionUsageMutation.mutate(currentQuestionId);
    }
  };

  const moveStudentToOriginal = (studentName: string) => {
    const newAttendanceData = { ...attendanceData };
    delete newAttendanceData[studentName];
    setAttendanceData(newAttendanceData);
    setSelectedStudent(null);
  };

  const answerZoneClick = (answer: string) => {
    if (selectedStudent) {
      moveStudentToAnswer(selectedStudent, answer);
      setSelectedStudent(null);
    }
  };

  const originalSectionClick = (e: React.MouseEvent) => {
    if (selectedStudent) {
      moveStudentToOriginal(selectedStudent);
    }
  };

  const resetAll = () => {
    setAttendanceData({});
    setSelectedStudent(null);
    setCheckInTimes({});
    toast({
      title: "🔄 Reset Complete!",
      description: "All student positions have been reset.",
    });
  };

  const downloadReport = () => {
    const reportDate = new Date().toLocaleDateString();
    const reportTime = new Date().toLocaleTimeString();
    
    let reportContent = `Attendance Report - ${reportDate} ${reportTime}\n`;
    reportContent += `Class ID: ${classId}\n`;
    reportContent += `Question: ${questionOfDay}\n`;
    reportContent += `Session Duration: ${Math.round((new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60)} minutes\n\n`;
    
    reportContent += `Student Responses:\n`;
    reportContent += `================\n`;
    
    students.forEach(student => {
      const response = attendanceData[student.name] || 'No response';
      const checkInTime = checkInTimes[student.name] || 'N/A';
      reportContent += `${student.name}: ${response} (${checkInTime})\n`;
    });
    
    reportContent += `\nSummary:\n`;
    reportContent += `========\n`;
    reportContent += `Total Students: ${students.length}\n`;
    reportContent += `Responded: ${Object.keys(attendanceData).length}\n`;
    reportContent += `Attendance Rate: ${Math.round((Object.keys(attendanceData).length / students.length) * 100)}%\n`;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
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
    setCurrentQuestionType(newQuestion.visualType);
    setCurrentQuestionId(newQuestion.id);
    toast({
      title: "Question Shuffled! 🎲",
      description: `"${newQuestion.text}" is now the active question.`,
    });
  };

  const generateResultsData = (): AttendanceResults => {
    const endTime = new Date();
    const sessionDuration = Math.round((endTime.getTime() - sessionStartTime.getTime()) / 1000 / 60);
    
    const totalResponses = Object.keys(attendanceData).length;
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
    
    const answerResults = answers.map((answer, index) => {
      const count = Object.values(attendanceData).filter(a => a === answer.trim()).length;
      const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
      
      return {
        answer: answer.trim(),
        count,
        percentage,
        students: Object.entries(attendanceData)
          .filter(([_, ans]) => ans === answer.trim())
          .map(([name, _]) => name),
        color: colors[index % colors.length]
      };
    });

    return {
      classId,
      className: `Class ${classId}`,
      date: selectedDate,
      question: questionOfDay,
      answers: answerResults,
      totalStudents: students.length,
      respondedStudents: Object.keys(attendanceData).length,
      attendanceRate: Math.round((Object.keys(attendanceData).length / students.length) * 100),
      sessionDuration,
      teacherName: "Teacher",
      checkInTimes,
      allStudents: students.map(s => s.name),
      metadata: {
        themeUsed: themeId,
        settingsUsed: attendanceSettings,
        startTime: sessionStartTime.toISOString(),
        endTime: endTime.toISOString(),
      }
    };
  };

  if (studentsLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-screen bg-gradient-to-br from-slate-50 to-gray-100 relative overflow-hidden"
      style={{ fontFamily: 'Fredoka, sans-serif' }}
      onMouseMove={handleMouseMove}
    >
      {/* Auto-hiding Header */}
      <div 
        className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          headerVisible 
            ? 'translate-y-0 opacity-100' 
            : '-translate-y-full opacity-0'
        }`}
      >
        <div className={`${theme.glassmorphism.background} ${theme.glassmorphism.border} ${theme.glassmorphism.shadow} p-4`}>
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Button onClick={goBack} variant="outline" size="sm" className="bg-white/80 border-gray-300 text-gray-700 hover:bg-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{theme.icon}</span>
                <h1 className="text-2xl font-bold text-gray-800">Clean Attendance Tracker</h1>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-700">
                  {Object.keys(attendanceData).length} / {students.length}
                </div>
                <div className="text-sm text-gray-600">Students Responded</div>
                {attendanceSettings.showProgressBar && (
                  <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${(Object.keys(attendanceData).length / students.length) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setAttendanceSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))} 
                variant="outline" 
                size="sm"
                className="bg-white/80 border-gray-300 text-gray-700 hover:bg-white"
              >
                {attendanceSettings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button onClick={() => setShowSettingsModal(true)} variant="outline" size="sm" className="bg-white/80 border-gray-300 text-gray-700 hover:bg-white">
                <Settings className="w-4 h-4" />
              </Button>
              <Button onClick={() => setShowQuestionLibraryModal(true)} variant="outline" size="sm" className="bg-white/80 border-gray-300 text-gray-700 hover:bg-white">
                <BookOpen className="w-4 h-4" />
              </Button>
              <Button onClick={handleShuffleQuestion} variant="outline" size="sm" className="bg-white/80 border-gray-300 text-gray-700 hover:bg-white" title="Shuffle Question">
                <Shuffle className="w-4 h-4" />
              </Button>
              <Button onClick={() => setShowResultsModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <PieChart className="w-4 h-4 mr-2" />
                Results
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Viewport Contained */}
      <div className="h-full flex flex-col pt-0">
        {/* Question Section - Large and Prominent */}
        <div className="flex-shrink-0 px-8 py-6">
          <div className="text-center">
            <h2 className="text-5xl font-bold text-gray-800 leading-tight">
              {questionOfDay}
            </h2>
          </div>
        </div>

        {/* Answer Zones - Proportional to screen */}
        <div className="flex-shrink-0 px-8 pb-6">
          <div className={`grid gap-6 ${
            answers.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : 
            answers.length <= 3 ? 'grid-cols-1 md:grid-cols-3' : 
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          }`}>
            {answers.map((answer, index) => {
              const visualElements = getVisualElements(currentQuestionType);
              const color = visualElements.colors[index] || theme.colors[index % theme.colors.length];
              const emoji = visualElements.emojis[index] || '📝';
              const studentsInZone = Object.entries(attendanceData)
                .filter(([_, ans]) => ans === answer.trim())
                .map(([name, _]) => name);

              return (
                <div
                  key={answer}
                  data-answer={answer.trim()}
                  className={`${theme.answerZone.background} ${theme.answerZone.border} ${theme.answerZone.shadow} ${theme.answerZone.hover} rounded-xl p-6 min-h-[120px] transition-all duration-300 relative ${
                    selectedStudent ? 'cursor-pointer' : ''
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, answer.trim())}
                  onClick={() => answerZoneClick(answer.trim())}
                >
                  <h4 className="text-2xl font-bold text-gray-700 mb-4 text-center">
                    {emoji} {answer.trim()}
                  </h4>
                  
                  {/* Students in this zone */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {studentsInZone.map((studentName) => (
                      <div
                        key={studentName}
                        className="flex items-center gap-1 bg-white/60 rounded-full px-3 py-1 text-sm font-medium text-gray-700"
                      >
                        <span className="text-lg">{getStudentEmoji(studentName)}</span>
                        <span>{formatStudentName(studentName)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Students Section - Fills remaining space */}
        <div className="flex-1 px-8 pb-8 overflow-hidden">
          <div className="h-full">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Students</h3>
            <div 
              className="h-full overflow-y-auto bg-white/50 rounded-xl p-6 border border-gray-200"
              onClick={originalSectionClick}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {students.map((student) => {
                  const isSelected = selectedStudent === student.name;
                  const hasResponded = attendanceData[student.name];
                  
                  return (
                    <div
                      key={student.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, student.name)}
                      onDragEnd={handleDragEnd}
                      onClick={() => selectStudent(student.name)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-100 border-2 border-blue-400 scale-105' 
                          : hasResponded 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-white/70 border border-gray-200 hover:bg-white hover:scale-105'
                      }`}
                    >
                      <div className={`text-3xl ${hasResponded ? 'opacity-60' : ''}`}>
                        {getStudentEmoji(student.name)}
                      </div>
                      <div className={`text-sm font-medium text-center leading-tight ${
                        hasResponded ? 'text-green-700' : 'text-gray-700'
                      }`}>
                        {formatStudentName(student.name)}
                      </div>
                      {hasResponded && (
                        <div className="text-xs text-green-600 font-medium">
                          ✓ {attendanceData[student.name]}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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