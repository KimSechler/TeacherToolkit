import { ReactNode } from "react";

interface StudentCardProps {
  student: {
    id: number;
    name: string;
    classId: number;
    createdAt: Date;
    avatarUrl?: string | null;
  };
  isSelected: boolean;
  hasResponded: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  emojiSize?: "sm" | "md" | "lg";
  showName?: boolean;
  formatName?: (name: string) => string;
}

export function StudentCard({
  student,
  isSelected,
  hasResponded,
  onDragStart,
  onDragEnd,
  onClick,
  children,
  className = "",
  emojiSize = "md",
  showName = true,
  formatName
}: StudentCardProps) {
  const sizeClasses = {
    sm: "text-2xl",
    md: "text-3xl", 
    lg: "text-6xl"
  };

  const baseClasses = `
    flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 cursor-pointer
    ${isSelected 
      ? 'bg-blue-100 border-2 border-blue-400 scale-105' 
      : hasResponded 
        ? 'bg-green-50 border border-green-200' 
        : 'bg-white/70 border border-gray-200 hover:bg-white hover:scale-105'
    }
  `;

  const displayName = formatName ? formatName(student.name) : student.name;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`${baseClasses} ${className}`}
    >
      <div className={`${sizeClasses[emojiSize]} ${hasResponded ? 'opacity-60' : ''}`}>
        {children}
      </div>
      {showName && (
        <div className={`text-sm font-medium text-center leading-tight ${
          hasResponded ? 'text-green-700' : 'text-gray-700'
        }`}>
          {displayName}
        </div>
      )}
    </div>
  );
} 