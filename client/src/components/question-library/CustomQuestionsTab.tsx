import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";
import { QuestionOfDay } from "@/lib/questionLibrary";

interface CustomQuestion {
  id: string;
  text: string;
  answers: string[];
  emojis: string[];
  visualType: 'yesNo' | 'colors' | 'animals' | 'food' | 'activities' | 'emotions' | 'weather' | 'custom';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  listName: string;
  createdAt: Date;
  lastUsed?: Date;
}

interface CustomQuestionsTabProps {
  customQuestions: CustomQuestion[];
  setCustomQuestions: (questions: CustomQuestion[]) => void;
  questionLists: string[];
  setQuestionLists: (lists: string[]) => void;
  selectedList: string;
  setSelectedList: (list: string) => void;
  formData: any;
  setFormData: (data: any) => void;
  formErrors: any;
  setFormErrors: (errors: any) => void;
  showCreateForm: boolean;
  setShowCreateForm: (show: boolean) => void;
  editingQuestion: CustomQuestion | null;
  setEditingQuestion: (question: CustomQuestion | null) => void;
  showListManager: boolean;
  setShowListManager: (show: boolean) => void;
  newListName: string;
  setNewListName: (name: string) => void;
  editingList: string | null;
  setEditingList: (list: string | null) => void;
  showEmojiPicker: number | null;
  setShowEmojiPicker: (index: number | null) => void;
  emojiSearchTerm: string;
  setEmojiSearchTerm: (term: string) => void;
  selectedEmojiCategory: string;
  setSelectedEmojiCategory: (category: string) => void;
  privateListForRandom: string;
  setPrivateListForRandom: (list: string) => void;
  onSelectQuestion: (question: QuestionOfDay) => void;
  onClose: () => void;
}

export function CustomQuestionsTab(props: CustomQuestionsTabProps) {
  const { customQuestions, onSelectQuestion, onClose } = props;

  const handleCreateQuestion = () => {
    // Placeholder - would implement full creation logic
    console.log("Create question functionality would go here");
  };

  const handleSelectCustomQuestion = (question: CustomQuestion) => {
    // Convert custom question to QuestionOfDay format
    const questionOfDay: QuestionOfDay = {
      id: parseInt(question.id),
      text: question.text,
      category: question.category,
      answers: question.answers,
      visualType: question.visualType,
      difficulty: question.difficulty,
      lastUsed: question.lastUsed?.toISOString() || null
    };
    
    onSelectQuestion(questionOfDay);
    onClose();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Custom Questions</h3>
        <Button onClick={handleCreateQuestion} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Question
        </Button>
      </div>

      {/* Content */}
      {customQuestions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No custom questions yet</h3>
            <p className="text-gray-500 text-center mb-4">
              Create your own questions to use in your classroom.
            </p>
            <Button onClick={handleCreateQuestion} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Question
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {customQuestions.map((question) => (
            <Card key={question.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium line-clamp-2 leading-tight">
                  {question.text}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-600">Answers:</div>
                    <div className="flex flex-wrap gap-1">
                      {question.answers.map((answer, index) => (
                        <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {answer}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="bg-blue-100 px-2 py-1 rounded">
                      {question.category}
                    </span>
                    <span className="bg-green-100 px-2 py-1 rounded">
                      {question.difficulty}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleSelectCustomQuestion(question)}
                    size="sm"
                    className="w-full text-xs"
                    variant="outline"
                  >
                    Use This Question
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 