import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AttendanceTrackerProps {
  classId: number;
  date?: Date;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  classId: number;
}

const puppyStyles = {
  classic: ['🐶', '🐕', '🦮', '🐕‍🦺'],
  colorful: ['🐶', '🟤', '⚫', '🤍', '🟡', '🔴', '🔵', '🟢'],
  cute: ['🐶', '😊', '🥰', '😍', '🤗', '😘', '🥳', '😎']
};

const answerColors = ['green', 'red', 'blue', 'yellow', 'purple', 'pink', 'indigo', 'orange'];
const answerEmojis = ['✅', '❌', '🔵', '🟡', '🟣', '🩷', '🟦', '🟠'];

export default function AttendanceTracker({ classId, date = new Date() }: AttendanceTrackerProps) {
  const [selectedDate, setSelectedDate] = useState(date.toISOString().split('T')[0]);
  const [questionOfDay, setQuestionOfDay] = useState("Do you like pizza?");
  const [answerOptions, setAnswerOptions] = useState("Yes\nNo");
  const [puppyStyle, setPuppyStyle] = useState<keyof typeof puppyStyles>('classic');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [draggedStudent, setDraggedStudent] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch students for the class
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['/api/students', classId],
    enabled: !!classId,
  });

  // Create or update attendance record
  const attendanceMutation = useMutation({
    mutationFn: async ({ studentId, status, notes }: { studentId: number; status: string; notes?: string }) => {
      return apiRequest(`/api/attendance`, {
        method: 'POST',
        body: JSON.stringify({
          studentId,
          classId,
          date: selectedDate,
          status,
          notes,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
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

  const answers = answerOptions.split('\n').filter(a => a.trim());

  const getPuppyEmoji = (studentName: string) => {
    const studentIndex = students.findIndex((s: Student) => `${s.firstName} ${s.lastName}` === studentName);
    return puppyStyles[puppyStyle][studentIndex % puppyStyles[puppyStyle].length];
  };

  const handleDragStart = (e: React.DragEvent, studentName: string) => {
    e.dataTransfer.setData("text/plain", studentName);
    setDraggedStudent(studentName);
    setSelectedStudent(null);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.style.opacity = '1';
    setDraggedStudent(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-opacity-80', 'scale-105');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-opacity-80', 'scale-105');
  };

  const handleDrop = (e: React.DragEvent, answer: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-opacity-80', 'scale-105');
    const studentName = e.dataTransfer.getData("text/plain");
    moveStudentToAnswer(studentName, answer);
    setDraggedStudent(null);
  };

  const handleDropToOriginal = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-opacity-80', 'scale-105');
    const studentName = e.dataTransfer.getData("text/plain");
    moveStudentToOriginal(studentName);
    setDraggedStudent(null);
  };

  const selectStudent = (studentName: string) => {
    setSelectedStudent(selectedStudent === studentName ? null : studentName);
  };

  const moveStudentToAnswer = (studentName: string, answer: string) => {
    setAttendanceData(prev => ({ ...prev, [studentName]: answer }));
    
    // Update in database
    const student = students.find((s: Student) => `${s.firstName} ${s.lastName}` === studentName);
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
    
    // Update in database
    const student = students.find((s: Student) => `${s.firstName} ${s.lastName}` === studentName);
    if (student) {
      attendanceMutation.mutate({ 
        studentId: student.id, 
        status: 'not-marked', 
        notes: '' 
      });
    }
  };

  const answerZoneClick = (answer: string) => {
    if (!selectedStudent) return;
    moveStudentToAnswer(selectedStudent, answer);
    setSelectedStudent(null);
  };

  const originalSectionClick = (e: React.MouseEvent) => {
    if (!selectedStudent) return;
    
    // Only process if clicking on the container, not a student
    if ((e.target as HTMLElement).closest('.puppy-icon')) return;
    
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
    const allStudentNames = students.map((s: Student) => `${s.firstName} ${s.lastName}`);
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

  if (studentsLoading) {
    return <div className="p-6">Loading students...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100" style={{ fontFamily: 'Fredoka, sans-serif' }}>
      {/* Header */}
      <div className="bg-white shadow-lg p-4 mb-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-purple-700">🐶 Puppy Attendance Tracker</h1>
          <div className="flex gap-3">
            <Button onClick={() => setShowSettings(!showSettings)} className="bg-purple-600 hover:bg-purple-700">
              ⚙️ Settings
            </Button>
            <Button onClick={downloadReport} className="bg-green-600 hover:bg-green-700">
              📊 Download Report
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Question Section */}
        <Card className="mb-8 rounded-2xl shadow-xl">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-purple-800 mb-6">📝 Today's Question</h2>
            <div className="bg-gradient-to-r from-yellow-200 to-orange-200 rounded-2xl p-6 border-4 border-yellow-300">
              <p className="text-2xl font-bold text-gray-800">{questionOfDay}</p>
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
                className={`bg-${color}-100 border-2 border-${color}-300 rounded-xl p-6 border-dashed min-h-[120px] transition-all duration-300 ${
                  selectedStudent ? 'cursor-pointer hover:opacity-80' : ''
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, answer.trim())}
                onClick={() => selectedStudent && answerZoneClick(answer.trim())}
              >
                <h4 className={`text-2xl font-bold text-${color}-700 mb-4 text-center`}>
                  {emoji} {answer.trim()}
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {studentsInZone.map(studentName => (
                    <div
                      key={studentName}
                      className={`puppy-icon text-center cursor-pointer hover:scale-105 transition-transform ${
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
                      <div className="text-4xl mb-1">{getPuppyEmoji(studentName)}</div>
                      <div className={`text-sm font-medium text-gray-800 bg-white rounded-full px-2 py-1 shadow-sm ${
                        selectedStudent === studentName ? 'bg-yellow-100 border-2 border-yellow-500' : ''
                      }`}>
                        {studentName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Students Section */}
        <Card className="mb-8 rounded-2xl shadow-xl border-4 border-blue-200 border-dashed">
          <CardContent 
            className="p-8"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDropToOriginal}
            onClick={originalSectionClick}
          >
            <h3 className="text-2xl font-bold text-blue-800 mb-6">👥 Students - Drag Your Puppy to Answer!</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {students
                .filter((student: Student) => !attendanceData[`${student.firstName} ${student.lastName}`])
                .map((student: Student) => {
                  const studentName = `${student.firstName} ${student.lastName}`;
                  const isSelected = selectedStudent === studentName;
                  
                  return (
                    <div
                      key={student.id}
                      className={`puppy-icon text-center cursor-pointer hover:scale-105 transition-transform select-none ${
                        isSelected ? 'scale-110 filter drop-shadow-lg' : ''
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, studentName)}
                      onDragEnd={handleDragEnd}
                      onClick={() => selectStudent(studentName)}
                    >
                      <div className="text-6xl mb-2">{getPuppyEmoji(studentName)}</div>
                      <div className={`text-lg font-medium text-gray-800 bg-white rounded-full px-3 py-1 shadow-sm ${
                        isSelected ? 'bg-yellow-100 border-2 border-yellow-500' : ''
                      }`}>
                        {studentName}
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Settings Panel */}
        {showSettings && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="question">Daily Question</Label>
                  <Textarea
                    id="question"
                    value={questionOfDay}
                    onChange={(e) => setQuestionOfDay(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="answers">Answer Options (one per line)</Label>
                  <Textarea
                    id="answers"
                    value={answerOptions}
                    onChange={(e) => setAnswerOptions(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date">Select Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="puppyStyle">Puppy Style</Label>
                  <Select value={puppyStyle} onValueChange={(value: keyof typeof puppyStyles) => setPuppyStyle(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classic">🐶 Classic Puppies</SelectItem>
                      <SelectItem value="colorful">🌈 Colorful Puppies</SelectItem>
                      <SelectItem value="cute">😊 Cute Puppies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button onClick={resetAll} variant="destructive" className="w-full">
                    Reset All Positions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}