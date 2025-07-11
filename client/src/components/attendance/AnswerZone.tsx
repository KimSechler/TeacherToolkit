import { ReactNode } from "react";
import { getVisualElements } from "@/lib/questionLibrary";

interface AnswerZoneProps {
  answer: string;
  index: number;
  questionType: string;
  theme: any;
  studentsInZone: string[];
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (answer: string) => void;
  children?: ReactNode;
  className?: string;
}

export function AnswerZone({
  answer,
  index,
  questionType,
  theme,
  studentsInZone,
  onDragOver,
  onDragLeave,
  onDrop,
  children,
  className = ""
}: AnswerZoneProps) {
  const visualElements = getVisualElements(questionType);
  const color = visualElements.colors[index] || theme.colors[index % theme.colors.length];
  const emoji = visualElements.emojis[index] || '📝';

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(answer.trim());
  };

  return (
    <div
      className={`relative p-6 rounded-2xl shadow-lg border-4 border-dashed transition-all duration-300 hover:scale-105 ${className}`}
      style={{
        backgroundColor: `${color}20`,
        borderColor: color,
        minHeight: '200px'
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={handleDrop}
    >
      <div className="text-center">
        <div className="text-6xl mb-4">{emoji}</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {answer.trim()}
        </h3>
        <div className="text-lg text-gray-600">
          {studentsInZone.length} student{studentsInZone.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      {children}
      
      {/* Student avatars in zone */}
      {studentsInZone.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex flex-wrap gap-1 justify-center">
            {studentsInZone.slice(0, 8).map((studentName, idx) => (
              <div
                key={idx}
                className="w-8 h-8 bg-white rounded-full border-2 border-white shadow-sm flex items-center justify-center text-sm font-medium"
                title={studentName}
              >
                {studentName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
            ))}
            {studentsInZone.length > 8 && (
              <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-xs font-medium">
                +{studentsInZone.length - 8}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 