import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { QuestionOfDay } from "@/lib/questionLibrary";

interface Student {
  id: number;
  name: string;
  classId: number;
  createdAt: Date;
  avatarUrl?: string | null;
}

interface AttendanceTrackerProps {
  classId: number;
  date?: Date;
  question?: QuestionOfDay | null;
}

interface AttendanceData {
  [studentName: string]: string;
}

interface CheckInTimes {
  [studentName: string]: string;
}

export function useAttendanceTracker({ classId, date = new Date(), question }: AttendanceTrackerProps) {
  const [selectedDate, setSelectedDate] = useState(date.toISOString().split('T')[0]);
  const [questionOfDay, setQuestionOfDay] = useState(question?.text || "What's your favorite color?");
  const [answerOptions, setAnswerOptions] = useState(question?.answers.join('\n') || "Red\nBlue\nGreen\nYellow");
  const [currentQuestionType, setCurrentQuestionType] = useState<string>(question?.visualType || "colors");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});
  const [draggedStudent, setDraggedStudent] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [checkInTimes, setCheckInTimes] = useState<CheckInTimes>({});
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

  // Fetch students for the class
  const { data: students = [] as Student[], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/classes', classId, 'students'],
    enabled: !!classId,
    retry: 3,
    staleTime: 30000,
  });

  // Fetch existing attendance data
  const { data: existingAttendance = {} as AttendanceData } = useQuery<AttendanceData>({
    queryKey: ['/api/attendance', classId, selectedDate],
    enabled: !!classId && !!selectedDate,
    retry: 3,
    staleTime: 30000,
  });

  // Save attendance mutation
  const saveAttendanceMutation = useMutation({
    mutationFn: async (data: { classId: number; date: string; attendance: AttendanceData }) => {
      return apiRequest("/api/attendance", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance', classId, selectedDate] });
      toast({
        title: "Attendance Saved",
        description: "Attendance data has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save attendance. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update attendance data when existing data is loaded
  useEffect(() => {
    if (Object.keys(existingAttendance).length > 0) {
      setAttendanceData(existingAttendance);
    }
  }, [existingAttendance]);

  // Student selection
  const selectStudent = (studentName: string) => {
    setSelectedStudent(studentName);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, studentName: string) => {
    setDraggedStudent(studentName);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedStudent(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (answer: string) => {
    if (draggedStudent) {
      const now = new Date();
      setAttendanceData(prev => ({
        ...prev,
        [draggedStudent]: answer
      }));
      setCheckInTimes(prev => ({
        ...prev,
        [draggedStudent]: now.toISOString()
      }));
      setSelectedStudent(null);
      setDraggedStudent(null);
    }
  };

  // Save attendance
  const saveAttendance = () => {
    if (Object.keys(attendanceData).length === 0) {
      toast({
        title: "No Data",
        description: "No attendance data to save.",
        variant: "destructive",
      });
      return;
    }

    saveAttendanceMutation.mutate({
      classId,
      date: selectedDate,
      attendance: attendanceData
    });
  };

  // Reset attendance
  const resetAttendance = () => {
    setAttendanceData({});
    setCheckInTimes({});
    setSelectedStudent(null);
    setDraggedStudent(null);
  };

  // Get attendance statistics
  const getAttendanceStats = () => {
    const totalStudents = students.length;
    const respondedStudents = Object.keys(attendanceData).length;
    const responseRate = totalStudents > 0 ? (respondedStudents / totalStudents) * 100 : 0;
    
    const answerCounts: { [answer: string]: number } = {};
    Object.values(attendanceData).forEach(answer => {
      answerCounts[answer] = (answerCounts[answer] || 0) + 1;
    });

    return {
      totalStudents,
      respondedStudents,
      responseRate,
      answerCounts
    };
  };

  // Format student name for display
  const formatStudentName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[1][0]}.`;
    }
    return name;
  };

  return {
    // State
    selectedDate,
    setSelectedDate,
    questionOfDay,
    setQuestionOfDay,
    answerOptions,
    setAnswerOptions,
    currentQuestionType,
    setCurrentQuestionType,
    selectedStudent,
    setSelectedStudent,
    attendanceData,
    setAttendanceData,
    draggedStudent,
    setDraggedStudent,
    sessionStartTime,
    checkInTimes,
    currentQuestionId,
    
    // Data
    students,
    studentsLoading,
    
    // Actions
    selectStudent,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    saveAttendance,
    resetAttendance,
    
    // Utilities
    getAttendanceStats,
    formatStudentName,
    
    // Mutations
    saveAttendanceMutation
  };
} 