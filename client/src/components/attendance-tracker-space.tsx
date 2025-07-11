import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getVisualElements, type QuestionOfDay, getRandomQuestion, getQuestionById } from "@/lib/questionLibrary";
import { ArrowLeft } from "lucide-react";
import { useRoute } from "wouter";

// Placeholder SVG components for rockets/astronauts
const RocketSVG = () => (
  <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="48" rx="10" ry="16" fill="#FF7043"/>
    <rect x="28" y="8" width="8" height="32" rx="4" fill="#90CAF9"/>
    <ellipse cx="32" cy="8" rx="8" ry="8" fill="#FFF176"/>
    <polygon points="32,56 28,64 36,64" fill="#FFA726"/>
    <rect x="30" y="20" width="4" height="12" rx="2" fill="#FFF"/>
    <ellipse cx="32" cy="36" rx="3" ry="2" fill="#FFF"/>
  </svg>
);

// Animated starfield background (CSS-based for now)
const Starfield = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    <div className="w-full h-full animate-starfield bg-black bg-[url('/starfield.png')] opacity-90" />
  </div>
);

interface Student {
  id: number;
  name: string;
  classId: number;
  createdAt: Date;
  avatarUrl?: string | null;
}

interface AttendanceTrackerSpaceProps {
  classId: number;
  date?: Date;
  question?: QuestionOfDay | null;
}

export default function AttendanceTrackerSpace(props: any) {
  // Support both direct props and wouter route params
  let classId: number;
  let questionId: string | null = null;
  let question: QuestionOfDay | null = null;

  if (props.classId) {
    classId = typeof props.classId === 'string' ? parseInt(props.classId) : props.classId;
  } else if (props.params && props.params.classId) {
    classId = parseInt(props.params.classId);
  } else {
    const [, params] = useRoute<{ classId: string }>("/attendance-tracker-space/:classId");
    classId = params ? parseInt(params.classId) : 0;
  }

  // Get questionId from query string
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    questionId = urlParams.get('questionId');
  }

  // Fetch question by ID if available, fallback to random
  if (questionId && questionId !== 'random') {
    const q = getQuestionById(Number(questionId));
    question = q || null;
  } else if (props.question) {
    question = props.question;
  } else {
    question = getRandomQuestion();
  }

  const [questionOfDay, setQuestionOfDay] = useState(question?.text || "This or That?");
  const [answerOptions, setAnswerOptions] = useState(question?.answers || ["Option 1", "Option 2"]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [headerVisible, setHeaderVisible] = useState(false);
  const headerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create or update attendance record
  const attendanceMutation = useMutation({
    mutationFn: async ({ studentId, status, notes }: { studentId: number; status: string; notes?: string }) => {
      return apiRequest('POST', `/api/attendance`, {
        studentId,
        classId,
        date: new Date().toISOString().split('T')[0],
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

  // Fetch students for the class
  const { data: students = [] as Student[], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/classes', classId, 'students'],
    enabled: !!classId,
    retry: 3,
    staleTime: 30000,
  });

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, studentName: string) => {
    setSelectedStudent(studentName);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', studentName);
  };
  const handleDragEnd = () => setSelectedStudent(null);
  const handleDrop = (e: React.DragEvent, answer: string) => {
    e.preventDefault();
    const studentName = e.dataTransfer.getData('text/plain');
    if (studentName) {
      setAttendanceData(prev => ({ ...prev, [studentName]: answer }));
      
      // Save attendance to database
      const student = students.find((s: Student) => s.name === studentName);
      if (student) {
        attendanceMutation.mutate({
          studentId: student.id,
          status: 'present',
          notes: answer
        });
      }
    }
    setSelectedStudent(null);
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  // Auto-hiding header logic
  const handleMouseMove = (e: React.MouseEvent) => {
    const y = e.clientY;
    const threshold = 50;
    if (y <= threshold) {
      setHeaderVisible(true);
      if (headerTimeoutRef.current) clearTimeout(headerTimeoutRef.current);
    } else {
      if (headerTimeoutRef.current) clearTimeout(headerTimeoutRef.current);
      headerTimeoutRef.current = setTimeout(() => setHeaderVisible(false), 2000);
    }
  };
  useEffect(() => () => { if (headerTimeoutRef.current) clearTimeout(headerTimeoutRef.current); }, []);

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

  // Layout
  return (
    <div
      className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-between font-sans"
      style={{ background: '#000' }}
      onMouseMove={handleMouseMove}
    >
      {/* Auto-hiding Header */}
      <div
        className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          headerVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="bg-black/80 border-b border-cyan-400 shadow-lg p-4">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <button onClick={() => window.history.back()} className="bg-cyan-900/80 text-cyan-100 px-4 py-2 rounded-lg shadow hover:bg-cyan-800 flex items-center">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back
              </button>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                <h1 className="text-2xl font-bold text-cyan-100">Space Visual Template</h1>
              </div>
            </div>
            {/* Progress Indicator */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-cyan-100">
                  {Object.keys(attendanceData).length} / {students.length}
                </div>
                <div className="text-sm text-cyan-200">Students Responded</div>
                <div className="w-20 h-2 bg-cyan-900 rounded-full mt-1">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${(Object.keys(attendanceData).length / students.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {/* Add settings, results, etc. buttons as needed */}
            </div>
          </div>
        </div>
      </div>
      {/* Animated Starfield */}
      <Starfield />

      {/* Header/Question */}
      <div className="relative z-10 w-full text-center pt-8 pb-4">
        <h1 className="text-5xl font-bold text-cyan-200 drop-shadow-[0_0_12px_cyan] animate-pulse" style={{ textShadow: '0 0 16px #00fff7, 0 0 32px #00fff7' }}>
          {questionOfDay}
        </h1>
      </div>

      {/* Answer Zones with Dotted Lines */}
      <div className="relative z-10 flex-1 w-full flex items-start justify-center px-8">
        <div className="absolute left-0 right-0 top-1/2 border-t border-dotted border-cyan-200 opacity-70" style={{ zIndex: 1 }} />
        <div className="absolute top-0 bottom-0 left-1/2 border-l border-dotted border-cyan-200 opacity-70" style={{ zIndex: 1 }} />
        <div className="flex w-full max-w-5xl justify-between items-start relative z-10">
          {answerOptions.slice(0, 2).map((answer: string, idx: number) => (
            <div key={answer} className="flex flex-col items-center w-1/2 px-8">
              <div className="flex flex-col items-center mt-8">
                {/* Dynamic icon from question system, fallback to emoji */}
                <span className="text-6xl mb-2">
                  {getVisualElements(question?.visualType || 'custom').emojis[idx] || '❓'}
                </span>
                <span className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_8px_cyan]" style={{ textShadow: '0 0 8px #00fff7' }}>{answer}</span>
              </div>
              {/* Drop zone for students */}
              <div
                className="min-h-[120px] flex flex-wrap justify-center items-end mt-8"
                onDrop={e => handleDrop(e, answer)}
                onDragOver={handleDragOver}
                style={{ minHeight: 120 }}
              >
                {Object.entries(attendanceData)
                  .filter(([_, a]) => a === answer)
                  .map(([studentName]) => (
                    <div key={studentName} className="flex flex-col items-center mx-2">
                      <RocketSVG />
                      <span className="text-cyan-100 text-lg font-medium mt-1" style={{ textShadow: '0 0 6px #00fff7' }}>{formatStudentName(studentName)}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Avatars at Bottom */}
      <div className="relative z-10 w-full flex justify-center items-end pb-8">
        <div className="flex gap-6 flex-wrap justify-center">
          {students.filter(s => !attendanceData[s.name]).map(student => (
            <div
              key={student.id}
              className="flex flex-col items-center cursor-grab"
              draggable
              onDragStart={e => handleDragStart(e, student.name)}
              onDragEnd={handleDragEnd}
            >
              <RocketSVG />
              <span className="text-cyan-100 text-lg font-medium mt-1" style={{ textShadow: '0 0 6px #00fff7' }}>{formatStudentName(student.name)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Back button (optional) */}
      <button
        className="absolute top-4 left-4 z-20 bg-cyan-900/80 text-cyan-100 px-4 py-2 rounded-lg shadow-lg hover:bg-cyan-800"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="inline w-5 h-5 mr-2" /> Back
      </button>
    </div>
  );
} 