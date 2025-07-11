import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import AttendancePreview from "@/components/attendance-preview";
import QuestionOfDayComponent from "@/components/question-of-day";
import QuestionLibraryModal from "@/components/question-library-modal";
import SettingsModal, { AttendanceSettings } from "@/components/settings-modal";
import ResultsModal, { AttendanceResults } from "@/components/results-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Users, TrendingUp, Download, Plus, BookOpen, Settings, PieChart } from "lucide-react";
import { format } from "date-fns";
import { getAllThemes, AttendanceTheme } from "@/lib/attendanceThemes";
import { QuestionOfDay, getRandomQuestion } from "@/lib/questionLibrary";
import { supabase } from "@/lib/supabase";

export default function Attendance() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionOfDay | null>(null);
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
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

  type Class = { id: number; name: string; grade?: string };
  type AttendanceStats = { totalStudents: number; presentToday: number; attendanceRate: number; responses: number };

  // Save selected class to localStorage whenever it changes
  const handleClassChange = (classId: number) => {
    setSelectedClass(classId);
    localStorage.setItem('lastSelectedClass', classId.toString());
  };

  const { data: classes = [], isLoading: classesLoading } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
    retry: false,
  });

  const { data: attendanceStats = { totalStudents: 0, presentToday: 0, attendanceRate: 0, responses: 0 }, isLoading: statsLoading, error: statsError } = useQuery<AttendanceStats>({
    queryKey: ["/api/classes", selectedClass, "attendance", "stats", selectedDate.toISOString().split('T')[0]],
    enabled: !!selectedClass,
    retry: 3,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Initialize selected class from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastClass = localStorage.getItem('lastSelectedClass');
      if (lastClass) {
        setSelectedClass(parseInt(lastClass));
      }
    }
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Set default class if none selected and classes are available
  useEffect(() => {
    if (classes.length > 0 && selectedClass === null) {
      // Get last class from localStorage
      const lastClass = typeof window !== 'undefined' ? localStorage.getItem('lastSelectedClass') : null;
      const lastClassId = lastClass ? parseInt(lastClass) : null;
      
      console.log('Setting default class:', { lastClassId, availableClasses: classes.map(c => c.id) });
      
      if (lastClassId && classes.some(cls => cls.id === lastClassId)) {
        // Last class still exists, use it
        console.log('Using last selected class:', lastClassId);
        handleClassChange(lastClassId);
      } else {
        // Last class doesn't exist or no last class, use first available
        console.log('Using first available class:', classes[0].id);
        handleClassChange(classes[0].id);
      }
    }
  }, [classes, selectedClass]);

  // Validate selected class still exists
  useEffect(() => {
    if (selectedClass && classes.length > 0 && !classes.some(cls => cls.id === selectedClass)) {
      console.log('Selected class no longer exists, switching to first available');
      handleClassChange(classes[0].id);
    }
  }, [classes, selectedClass]);

  // Initialize with a random question if none selected
  useEffect(() => {
    if (!currentQuestion) {
      setCurrentQuestion(getRandomQuestion());
    }
  }, [currentQuestion]);

  // Update attendance tracker when question changes
  useEffect(() => {
    if (currentQuestion) {
      // Force re-render of attendance tracker components
      // This ensures the new question is displayed
      const event = new CustomEvent('questionUpdated', { 
        detail: { question: currentQuestion } 
      });
      window.dispatchEvent(event);
    }
  }, [currentQuestion]);

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

  const themes = getAllThemes();

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleShuffleQuestion = () => {
    setCurrentQuestion(getRandomQuestion());
  };

  const handlePickFromLibrary = () => {
    setShowQuestionSelector(true);
  };

  const handleSelectQuestionFromLibrary = (question: QuestionOfDay) => {
    setCurrentQuestion(question);
    setShowQuestionSelector(false);
    toast({
      title: "Question Selected!",
      description: `"${question.text}" has been set as today's question.`,
    });
  };

  const handleCreateCustom = () => {
    setShowQuestionSelector(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Attendance Tracker</h1>
            <p className="text-gray-600">Track daily attendance with interactive themed Question of the Day</p>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Select Class</CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedClass?.toString() || ""} 
                  onValueChange={(value) => handleClassChange(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes?.map((cls: any) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name} {cls.grade && `(Grade ${cls.grade})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {format(selectedDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(date);
                          setShowCalendar(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setShowSettingsModal(true)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setShowResultsModal(true)}
                  >
                    <PieChart className="w-4 h-4 mr-2" />
                    View Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Stats */}
          {selectedClass && attendanceStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Total Students</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {statsLoading ? (
                          <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                        ) : (
                          attendanceStats.totalStudents || 0
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Present Today</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {statsLoading ? (
                          <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                        ) : (
                          attendanceStats.presentToday || 0
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {statsLoading ? (
                          <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                        ) : (
                          `${attendanceStats.attendanceRate || 0}%`
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Badge className="w-5 h-5 bg-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Responses</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {statsLoading ? (
                          <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                        ) : (
                          attendanceStats.responses || 0
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Error Display */}
          {statsError && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center text-red-700">
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-red-600 text-sm">!</span>
                  </div>
                  <p className="text-sm">Failed to load attendance statistics. Please try refreshing the page.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Question of the Day Section */}
          {selectedClass && (
            <div className="mb-6">
              <QuestionOfDayComponent
                currentQuestion={currentQuestion}
                onShuffle={handleShuffleQuestion}
                onPickFromLibrary={handlePickFromLibrary}
                onCreateCustom={handleCreateCustom}
                classId={selectedClass}
                onQuickStart={(themeId) => {
                  const questionId = currentQuestion?.id || 'random';
                  window.location.href = `/attendance-tracker/${selectedClass}/${themeId}?questionId=${questionId}`;
                }}
              />
            </div>
          )}

          {/* Theme Previews */}
          {selectedClass ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Available Themes</h2>
                <p className="text-sm text-gray-600">Click any theme to open the full-screen tracker</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Existing theme previews */}
                {themes.map((theme) => {
                  const selectedClassData = classes.find((cls: Class) => cls.id === selectedClass);
                  return (
                    <AttendancePreview
                      key={theme.id}
                      classId={selectedClass}
                      className={selectedClassData?.name || "Unknown Class"}
                      theme={theme}
                      studentCount={attendanceStats.totalStudents || 0}
                      date={selectedDate}
                      currentQuestion={currentQuestion}
                      onThemeChange={() => {}} // Removed onThemeChange prop
                    />
                  );
                })}
                {/* New Space Template Preview Card */}
                <Card
                  className="transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-105 bg-gradient-to-br from-black via-slate-900 to-blue-900 border-2 border-cyan-400"
                  onClick={() => {
                    const questionId = currentQuestion?.id || 'random';
                    window.location.href = `/attendance-tracker-space/${selectedClass}?questionId=${questionId}`;
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🚀</span>
                      <CardTitle className="text-lg text-cyan-200 drop-shadow-[0_0_8px_cyan]">Space Visual Template</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center mb-3">
                      <h4 className="font-semibold text-sm text-cyan-100">Today's Question</h4>
                      <p className="text-xs text-cyan-200 mt-1 line-clamp-2">{currentQuestion?.text || "No question selected"}</p>
                    </div>
                    <div className="flex justify-center gap-2 mb-3">
                      <span className="text-3xl">🟦</span>
                      <span className="text-3xl">🟨</span>
                    </div>
                    <div className="flex justify-center gap-1">
                      <span className="text-2xl">🚀</span>
                      <span className="text-2xl">🚀</span>
                      <span className="text-2xl">🚀</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">Select a Class</h3>
                <p className="text-gray-600 mb-4">
                  Choose a class from the dropdown above to start tracking attendance with themed trackers
                </p>
                {classesLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                ) : classes && classes.length === 0 ? (
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Class
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          )}

          {/* Question Library Modal */}
          <QuestionLibraryModal
            isOpen={showQuestionSelector}
            onClose={() => setShowQuestionSelector(false)}
            onSelectQuestion={handleSelectQuestionFromLibrary}
          />

          {/* Settings Modal */}
          <SettingsModal
            isOpen={showSettingsModal}
            onClose={() => setShowSettingsModal(false)}
            settings={attendanceSettings}
            onSettingsChange={setAttendanceSettings}
            currentTheme={themes[0]}
            currentQuestion={currentQuestion}
          />

          {/* Results Modal */}
          <ResultsModal
            isOpen={showResultsModal}
            onClose={() => setShowResultsModal(false)}
            attendanceData={{
              classId: selectedClass || 0,
              className: classes.find(c => c.id === selectedClass)?.name || "Unknown Class",
              date: selectedDate.toISOString(),
              question: currentQuestion?.text || "No question selected",
              answers: [
                { answer: "Yes", count: 15, percentage: 60, students: ["Emma J.", "Jake S.", "Sarah W."], color: "#3B82F6" },
                { answer: "No", count: 10, percentage: 40, students: ["Michael B.", "Lisa D."], color: "#EF4444" }
              ],
              totalStudents: 25,
              respondedStudents: 25,
              attendanceRate: 100,
              sessionDuration: 15,
              teacherName: "Mrs. Johnson",
              allStudents: [
                "Emma J.",
                "Jake S.", 
                "Sarah W.",
                "Michael B.",
                "Lisa D."
              ],
              checkInTimes: {
                "Emma J.": "9:15 AM",
                "Jake S.": "9:16 AM",
                "Sarah W.": "9:17 AM",
                "Michael B.": "9:18 AM",
                "Lisa D.": "9:19 AM"
              },
              metadata: {
                themeUsed: "Puppy Theme",
                settingsUsed: attendanceSettings,
                startTime: "9:15 AM",
                endTime: "9:30 AM"
              }
            }}
          />
        </main>
      </div>
    </div>
  );
}
