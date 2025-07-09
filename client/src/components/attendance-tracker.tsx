import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Settings, RefreshCw } from "lucide-react";

interface AttendanceTrackerProps {
  classId: number;
  date?: Date;
}

export default function AttendanceTracker({ classId, date = new Date() }: AttendanceTrackerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [draggedStudent, setDraggedStudent] = useState<any>(null);

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/classes", classId, "students"],
    enabled: !!classId,
  });

  const { data: attendance, isLoading: attendanceLoading } = useQuery({
    queryKey: ["/api/classes", classId, "attendance"],
    enabled: !!classId,
  });

  const { data: questions } = useQuery({
    queryKey: ["/api/questions", { type: "qotd" }],
  });

  const attendanceMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/attendance", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes", classId, "attendance"] });
      toast({
        title: "Success",
        description: "Attendance updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update attendance",
        variant: "destructive",
      });
    },
  });

  const handleDragStart = (e: React.DragEvent, student: any) => {
    setDraggedStudent(student);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, answer: string) => {
    e.preventDefault();
    if (draggedStudent) {
      handleAttendanceUpdate(draggedStudent.id, answer);
      setDraggedStudent(null);
    }
  };

  const handleAttendanceUpdate = (studentId: number, answer: string) => {
    attendanceMutation.mutate({
      studentId,
      classId,
      date: date.toISOString(),
      isPresent: true,
      questionId: currentQuestion?.id,
      answer,
    });
  };

  const todaysQuestion = currentQuestion || {
    text: "What's your favorite subject?",
    options: ["Math", "Science", "Reading", "Art"],
  };

  const answerEmojis = {
    Math: "🔢",
    Science: "🔬",
    Reading: "📚",
    Art: "🎨",
  };

  if (studentsLoading || attendanceLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <RefreshCw className="w-5 h-5 mr-2" />
              Attendance Tracker
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Question of the Day */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Question of the Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg mb-4">
            <p className="text-lg font-medium mb-2">"{todaysQuestion.text}"</p>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-white/20 text-white">
                {students?.length || 0} students
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                Change Question
              </Button>
            </div>
          </div>

          {/* Answer Statistics */}
          <div className="space-y-2">
            {todaysQuestion.options?.map((option: string, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm flex items-center">
                  <span className="text-lg mr-2">{answerEmojis[option as keyof typeof answerEmojis] || "📝"}</span>
                  {option}
                </span>
                <Badge variant="outline">
                  {Math.floor(Math.random() * 10)} {/* This would be actual count */}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Drag and Drop Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {students?.map((student: any) => (
                <div
                  key={student.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, student)}
                  className="flex items-center p-3 bg-white border rounded-lg cursor-move hover:shadow-md transition-shadow"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-blue-600">
                      {student.name.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{student.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Answer Drop Zones */}
        <Card>
          <CardHeader>
            <CardTitle>Drag Students to Their Answers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {todaysQuestion.options?.map((option: string, index: number) => (
                <div
                  key={index}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, option)}
                  className="drag-zone p-4 min-h-[120px] text-center transition-all"
                >
                  <div className="text-3xl mb-2">
                    {answerEmojis[option as keyof typeof answerEmojis] || "📝"}
                  </div>
                  <h5 className="font-medium text-gray-800 mb-2">{option}</h5>
                  <div className="space-y-1">
                    {/* Here would be the students who selected this answer */}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
