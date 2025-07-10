import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  HelpCircle, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Wand2,
  Copy,
  Upload,
  Download,
  CheckCircle,
  XCircle
} from "lucide-react";

const questionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  type: z.enum(["qotd", "quiz", "game"]),
  options: z.array(z.string()).min(2, "At least 2 options required"),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  tags: z.array(z.string()).optional(),
});

type QuestionFormData = z.infer<typeof questionSchema>;

export default function QuestionBank() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: "",
      type: "quiz",
      options: ["", "", "", ""],
      correctAnswer: "",
      tags: [],
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  type Question = { id: number; text: string; options: string[]; correctAnswer: string; type: string; tags?: string[] };

  const { data: questions = [], isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions", selectedType !== "all" ? { type: selectedType } : {}],
    retry: false,
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (data: QuestionFormData) => {
      return await apiRequest("POST", "/api/questions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      toast({
        title: "Success",
        description: "Question created successfully",
      });
      setIsCreating(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create question",
        variant: "destructive",
      });
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<QuestionFormData> }) => {
      return await apiRequest("PUT", `/api/questions/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      toast({
        title: "Success",
        description: "Question updated successfully",
      });
      setEditingQuestion(null);
      setIsCreating(false);
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
    },
  });

  const generateQuestionsMutation = useMutation({
    mutationFn: async (data: { topic: string; grade: string; count: number }) => {
      return await apiRequest("POST", "/api/ai/generate-questions", data);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      toast({
        title: "Success",
        description: `Generated ${(response as any).questions?.length || 0} questions`,
      });
    },
  });

  const onSubmit = (data: QuestionFormData) => {
    if (editingQuestion) {
      updateQuestionMutation.mutate({ id: editingQuestion.id, data });
    } else {
      createQuestionMutation.mutate(data);
    }
  };

  const handleEdit = (question: any) => {
    setEditingQuestion(question);
    form.reset(question);
    setIsCreating(true);
  };

  const handleDelete = (questionId: number) => {
    if (confirm("Are you sure you want to delete this question?")) {
      deleteQuestionMutation.mutate(questionId);
    }
  };

  const handleCopy = (question: any) => {
    form.reset({
      ...question,
      text: `Copy of ${question.text}`,
    });
    setEditingQuestion(null);
    setIsCreating(true);
  };

  const addOption = () => {
    const currentOptions = form.getValues("options");
    form.setValue("options", [...currentOptions, ""]);
  };

  const removeOption = (index: number) => {
    const currentOptions = form.getValues("options");
    if (currentOptions.length > 2) {
      const newOptions = currentOptions.filter((_, i) => i !== index);
      form.setValue("options", newOptions);
    }
  };

  const filteredQuestions = questions?.filter((question: any) => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || question.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "qotd":
        return "bg-blue-100 text-blue-800";
      case "quiz":
        return "bg-purple-100 text-purple-800";
      case "game":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "qotd":
        return "Question of the Day";
      case "quiz":
        return "Quiz";
      case "game":
        return "Game";
      default:
        return type;
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Question Bank</h1>
                <p className="text-gray-600">Create and manage your collection of questions</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => generateQuestionsMutation.mutate({
                    topic: "general knowledge",
                    grade: "elementary",
                    count: 5
                  })}
                  disabled={generateQuestionsMutation.isPending}
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate with AI
                </Button>
                <Button
                  onClick={() => {
                    setEditingQuestion(null);
                    form.reset();
                    setIsCreating(true);
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="qotd">Question of the Day</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="game">Game</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Questions List */}
          <div className="space-y-4">
            {questionsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))
            ) : filteredQuestions && filteredQuestions.length > 0 ? (
              filteredQuestions.map((question: any) => (
                <Card key={question.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getTypeColor(question.type)}>
                            {getTypeLabel(question.type)}
                          </Badge>
                          {question.tags?.map((tag: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <h3 className="font-medium text-gray-800 mb-2">{question.text}</h3>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {question.options?.map((option: string, index: number) => (
                            <div
                              key={index}
                              className={`text-sm p-2 rounded border ${
                                option === question.correctAnswer
                                  ? "bg-green-50 border-green-200 text-green-800"
                                  : "bg-gray-50 border-gray-200 text-gray-600"
                              }`}
                            >
                              <div className="flex items-center">
                                {option === question.correctAnswer && (
                                  <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                                )}
                                {option}
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">
                          Created {new Date(question.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(question)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(question)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(question.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    {searchTerm || selectedType !== "all" ? "No questions match your search" : "No questions created yet"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || selectedType !== "all" 
                      ? "Try adjusting your search or filter criteria"
                      : "Create your first question to get started"
                    }
                  </p>
                  <Button
                    onClick={() => setIsCreating(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Create/Edit Question Dialog */}
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingQuestion ? "Edit Question" : "Create New Question"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question Text</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter your question..."
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select question type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="qotd">Question of the Day</SelectItem>
                            <SelectItem value="quiz">Quiz</SelectItem>
                            <SelectItem value="game">Game</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Answer Options
                    </label>
                    <div className="space-y-2">
                      {form.watch("options").map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) => {
                              const options = form.getValues("options");
                              options[index] = e.target.value;
                              form.setValue("options", options);
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => form.setValue("correctAnswer", option)}
                            className={
                              form.watch("correctAnswer") === option
                                ? "text-green-600"
                                : "text-gray-400"
                            }
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          {form.watch("options").length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(index)}
                            >
                              <XCircle className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                      className="mt-2"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Option
                    </Button>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Correct Answer
                    </label>
                    <p className="text-sm text-gray-600">
                      Click the checkmark next to the correct option above
                    </p>
                    {form.watch("correctAnswer") && (
                      <p className="text-sm text-green-600 mt-1">
                        Selected: {form.watch("correctAnswer")}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreating(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending}
                    >
                      {createQuestionMutation.isPending || updateQuestionMutation.isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : null}
                      {editingQuestion ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
