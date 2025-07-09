import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import GamePreview from "@/components/game-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  Gamepad2, 
  Play, 
  Settings, 
  Wand2, 
  Upload,
  Trash2,
  Edit,
  Copy,
  Sparkles
} from "lucide-react";

const gameSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  template: z.enum(["multiple_choice", "drag_drop", "matching"]),
  theme: z.string().min(1, "Theme is required"),
  content: z.any(),
});

type GameFormData = z.infer<typeof gameSchema>;

export default function GameCreator() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<GameFormData>({
    resolver: zodResolver(gameSchema),
    defaultValues: {
      title: "",
      description: "",
      template: "multiple_choice",
      theme: "halloween",
      content: { questions: [] },
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

  const { data: games, isLoading: gamesLoading } = useQuery({
    queryKey: ["/api/games"],
    retry: false,
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  const { data: questions } = useQuery({
    queryKey: ["/api/questions"],
    retry: false,
  });

  const createGameMutation = useMutation({
    mutationFn: async (data: GameFormData) => {
      return await apiRequest("POST", "/api/games", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      toast({
        title: "Success",
        description: "Game created successfully",
      });
      setIsCreating(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create game",
        variant: "destructive",
      });
    },
  });

  const updateGameMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<GameFormData> }) => {
      return await apiRequest("PUT", `/api/games/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      toast({
        title: "Success",
        description: "Game updated successfully",
      });
    },
  });

  const deleteGameMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/games/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      toast({
        title: "Success",
        description: "Game deleted successfully",
      });
    },
  });

  const deployGameMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("PUT", `/api/games/${id}`, { isActive: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      toast({
        title: "Success",
        description: "Game deployed successfully",
      });
    },
  });

  const generateQuestionsWithAI = useMutation({
    mutationFn: async (data: { topic: string; grade: string; count: number }) => {
      return await apiRequest("POST", "/api/ai/generate-questions", data);
    },
    onSuccess: (response) => {
      const currentContent = form.getValues("content");
      form.setValue("content", {
        ...currentContent,
        questions: [...(currentContent.questions || []), ...response.questions],
      });
      toast({
        title: "Success",
        description: `Generated ${response.questions.length} questions`,
      });
    },
  });

  const themes = [
    { name: "halloween", label: "Halloween", emoji: "🎃", colors: "from-orange-400 to-red-500" },
    { name: "space", label: "Space Adventure", emoji: "🚀", colors: "from-purple-400 to-indigo-600" },
    { name: "jungle", label: "Jungle Safari", emoji: "🌴", colors: "from-green-400 to-emerald-600" },
    { name: "ocean", label: "Ocean World", emoji: "🌊", colors: "from-blue-400 to-cyan-600" },
    { name: "winter", label: "Winter Wonderland", emoji: "❄️", colors: "from-blue-300 to-purple-400" },
    { name: "farm", label: "Farm Animals", emoji: "🐮", colors: "from-yellow-400 to-orange-500" },
  ];

  const templates = [
    {
      id: "multiple_choice",
      name: "Multiple Choice",
      description: "Quiz with 4 answer options",
      icon: "❓",
    },
    {
      id: "drag_drop",
      name: "Drag & Drop",
      description: "Match items by dragging",
      icon: "🎯",
    },
    {
      id: "matching",
      name: "Matching",
      description: "Connect related items",
      icon: "🔗",
    },
  ];

  const onSubmit = (data: GameFormData) => {
    if (selectedGame) {
      updateGameMutation.mutate({ id: selectedGame.id, data });
    } else {
      createGameMutation.mutate(data);
    }
  };

  const handleEdit = (game: any) => {
    setSelectedGame(game);
    form.reset(game);
    setIsCreating(true);
  };

  const handleDelete = (gameId: number) => {
    if (confirm("Are you sure you want to delete this game?")) {
      deleteGameMutation.mutate(gameId);
    }
  };

  const handleDeploy = (gameId: number) => {
    deployGameMutation.mutate(gameId);
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
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Game Creator</h1>
                <p className="text-gray-600">Create engaging educational games for your students</p>
              </div>
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Game
              </Button>
            </div>
          </div>

          {/* Game Creation Dialog */}
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedGame ? "Edit Game" : "Create New Game"}
                </DialogTitle>
              </DialogHeader>

              <Tabs value={currentStep.toString()} onValueChange={(value) => setCurrentStep(parseInt(value))}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="1">Template & Theme</TabsTrigger>
                  <TabsTrigger value="2">Content</TabsTrigger>
                  <TabsTrigger value="3">Preview</TabsTrigger>
                </TabsList>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <TabsContent value="1" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Game Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter game title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description (Optional)</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Describe your game" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="template"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Game Template</FormLabel>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {templates.map((template) => (
                                <Card
                                  key={template.id}
                                  className={`cursor-pointer transition-all ${
                                    field.value === template.id
                                      ? "ring-2 ring-purple-500 bg-purple-50"
                                      : "hover:shadow-md"
                                  }`}
                                  onClick={() => field.onChange(template.id)}
                                >
                                  <CardContent className="p-4 text-center">
                                    <div className="text-2xl mb-2">{template.icon}</div>
                                    <h3 className="font-medium">{template.name}</h3>
                                    <p className="text-sm text-gray-600">{template.description}</p>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="theme"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Theme</FormLabel>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {themes.map((theme) => (
                                <Card
                                  key={theme.name}
                                  className={`cursor-pointer transition-all ${
                                    field.value === theme.name
                                      ? "ring-2 ring-purple-500"
                                      : "hover:shadow-md"
                                  }`}
                                  onClick={() => field.onChange(theme.name)}
                                >
                                  <CardContent className="p-4">
                                    <div className={`bg-gradient-to-r ${theme.colors} rounded-lg p-3 text-white text-center mb-2`}>
                                      <div className="text-2xl mb-1">{theme.emoji}</div>
                                      <div className="text-sm font-medium">{theme.label}</div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="2" className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Game Content</h3>
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => generateQuestionsWithAI.mutate({
                              topic: "math",
                              grade: "2nd grade",
                              count: 5
                            })}
                            disabled={generateQuestionsWithAI.isPending}
                          >
                            <Wand2 className="w-4 h-4 mr-2" />
                            Generate with AI
                          </Button>
                          <Button type="button" variant="outline">
                            <Upload className="w-4 h-4 mr-2" />
                            Import Questions
                          </Button>
                        </div>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle>Questions & Answers</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {form.watch("content.questions")?.map((question: any, index: number) => (
                              <div key={index} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">Question {index + 1}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const questions = form.getValues("content.questions");
                                      questions.splice(index, 1);
                                      form.setValue("content.questions", questions);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{question.text}</p>
                                <div className="grid grid-cols-2 gap-2">
                                  {question.options?.map((option: string, optIndex: number) => (
                                    <Badge
                                      key={optIndex}
                                      variant={option === question.correctAnswer ? "default" : "outline"}
                                      className="text-xs"
                                    >
                                      {option}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )) || (
                              <div className="text-center py-8 text-gray-500">
                                <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p>No questions added yet</p>
                                <p className="text-sm">Use AI generation or import questions to get started</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="3" className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-lg font-medium mb-4">Game Preview</h3>
                        <div className="max-w-md mx-auto">
                          <GamePreview
                            game={{
                              id: 0,
                              title: form.watch("title") || "Preview Game",
                              description: form.watch("description"),
                              template: form.watch("template"),
                              theme: form.watch("theme"),
                              content: form.watch("content"),
                              isActive: false,
                            }}
                            onEdit={() => {}}
                            onDelete={() => {}}
                            onDeploy={() => {}}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                        disabled={currentStep === 1}
                      >
                        Previous
                      </Button>
                      <div className="flex space-x-2">
                        {currentStep < 3 ? (
                          <Button
                            type="button"
                            onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                          >
                            Next
                          </Button>
                        ) : (
                          <Button
                            type="submit"
                            disabled={createGameMutation.isPending || updateGameMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {createGameMutation.isPending || updateGameMutation.isPending ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                              <Play className="w-4 h-4 mr-2" />
                            )}
                            {selectedGame ? "Update Game" : "Create Game"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </form>
                </Form>
              </Tabs>
            </DialogContent>
          </Dialog>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gamesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))
            ) : games && games.length > 0 ? (
              games.map((game: any) => (
                <GamePreview
                  key={game.id}
                  game={game}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDeploy={handleDeploy}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Gamepad2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No games created yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first educational game to engage your students
                </p>
                <Button
                  onClick={() => setIsCreating(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Game
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
