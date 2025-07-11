import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Clock, Star } from "lucide-react";
import { QuestionOfDay } from "@/lib/questionLibrary";

interface QuestionCardProps {
  question: QuestionOfDay;
  recentlyUsedQuestions: string[];
  favoritesUpdateTrigger: number;
  onSelect: () => void;
}

export function QuestionCard({
  question,
  recentlyUsedQuestions,
  favoritesUpdateTrigger,
  onSelect
}: QuestionCardProps) {
  const isRecentlyUsed = recentlyUsedQuestions.includes(question.text);
  const isFavorite = false; // Placeholder - would need to implement favorites system

  const getUsageStatus = (question: QuestionOfDay) => {
    if (isRecentlyUsed) {
      return { status: "recent", icon: Clock, text: "Recently used", color: "text-blue-600" };
    }
    if (question.lastUsed) {
      return { status: "used", icon: Eye, text: "Used before", color: "text-gray-600" };
    }
    return { status: "new", icon: Eye, text: "Never used", color: "text-green-600" };
  };

  const usageStatus = getUsageStatus(question);

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium line-clamp-2 leading-tight">
            {question.text}
          </CardTitle>
          <div className="flex items-center gap-1">
            {isFavorite && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            )}
            <usageStatus.icon className={`h-4 w-4 ${usageStatus.color}`} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Answer Options */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-600">Answers:</div>
            <div className="flex flex-wrap gap-1">
              {question.answers.map((answer, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {answer}
                </Badge>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {question.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {question.difficulty}
              </Badge>
            </div>
            <span className={usageStatus.color}>
              {usageStatus.text}
            </span>
          </div>

          {/* Action Button */}
          <Button
            onClick={onSelect}
            size="sm"
            className="w-full text-xs"
            variant="outline"
          >
            Use This Question
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 