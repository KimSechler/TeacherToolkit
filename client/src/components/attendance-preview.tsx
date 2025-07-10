import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { AttendanceTheme, getThemeById } from "@/lib/attendanceThemes";
import { QuestionOfDay } from "@/lib/questionLibrary";
import { Users, Calendar, Play } from "lucide-react";

interface AttendancePreviewProps {
  classId: number;
  className: string;
  theme: AttendanceTheme;
  studentCount: number;
  date: Date;
  currentQuestion?: QuestionOfDay | null;
  onThemeChange?: (themeId: string) => void;
}

export default function AttendancePreview({
  classId,
  className,
  theme,
  studentCount,
  date,
  currentQuestion,
  onThemeChange
}: AttendancePreviewProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleOpenTracker = () => {
    const questionId = currentQuestion?.id || 'random';
    window.location.href = `/attendance-tracker/${classId}/${theme.id}?questionId=${questionId}`;
  };

  // Get the question text and answers
  const questionText = currentQuestion?.text || "No question selected";
  const answers = currentQuestion?.answers || ["Yes", "No"];

  return (
    <Card 
      className={`transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-105 ${
        theme.background
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleOpenTracker}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{theme.icon}</span>
            <CardTitle className="text-lg">{theme.name} Tracker</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {studentCount} students
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Preview of the tracker */}
        <div className="bg-white/80 rounded-lg p-4 border-2 border-dashed border-gray-300">
          <div className="text-center mb-3">
            <h4 className="font-semibold text-sm text-gray-700">Today's Question</h4>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{questionText}</p>
          </div>
          
          {/* Mini answer zones */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {answers.slice(0, 2).map((answer, index) => (
              <div
                key={answer}
                className={`bg-${theme.colors[index % theme.colors.length]}-100 border border-${theme.colors[index % theme.colors.length]}-300 rounded p-2 text-center`}
              >
                <div className="text-xs font-medium text-gray-700 truncate">{answer}</div>
                <div className="text-xs text-gray-500 mt-1">0 students</div>
              </div>
            ))}
          </div>
          
          {/* Mini students */}
          <div className="flex justify-center gap-1">
            {Array.from({ length: Math.min(studentCount, 6) }).map((_, index) => (
              <div
                key={index}
                className="text-lg opacity-60 hover:opacity-100 transition-opacity"
                title={`Student ${index + 1}`}
              >
                {theme.emojis[index % theme.emojis.length]}
              </div>
            ))}
            {studentCount > 6 && (
              <div className="text-xs text-gray-500 flex items-center">
                +{studentCount - 6} more
              </div>
            )}
          </div>
        </div>

        {/* Class info */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{className}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{date.toLocaleDateString()}</span>
          </div>
        </div>

        {/* Action button */}
        <Button 
          className="w-full bg-white/90 hover:bg-white text-gray-800 border border-gray-300"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenTracker();
          }}
        >
          <Play className="w-4 h-4 mr-2" />
          Open Tracker
        </Button>
      </CardContent>
    </Card>
  );
} 