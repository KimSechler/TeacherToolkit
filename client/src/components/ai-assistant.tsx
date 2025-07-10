import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  Send, 
  Paperclip, 
  Plus, 
  History,
  Sparkles,
  Image,
  FileText,
  HelpCircle
} from "lucide-react";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: string;
    data?: any;
  }>;
}

export default function AIAssistant() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: "Hello! I'm your AI teaching assistant. I can help you create question lists, generate game content, analyze uploaded images, or suggest classroom activities. What would you like to work on today?",
      timestamp: new Date(),
      actions: [
        { label: "Generate Quiz", action: "generate_quiz" },
        { label: "Create Theme", action: "create_theme" },
        { label: "Upload PDF", action: "upload_pdf" },
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations } = useQuery({
    queryKey: ["/api/ai/conversations"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      // This would typically send to a chat API
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            content: generateAIResponse(message),
            actions: generateResponseActions(message),
          });
        }, 1000);
      });
    },
    onSuccess: (response: any) => {
      setIsTyping(false);
      const aiMessage: Message = {
        id: Date.now().toString(),
        type: "ai",
        content: response.content,
        timestamp: new Date(),
        actions: response.actions,
      };
      setMessages(prev => [...prev, aiMessage]);
    },
    onError: () => {
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const generateQuestionsMutation = useMutation({
    mutationFn: async (data: { topic: string; grade: string; count: number }) => {
      return await apiRequest("POST", "/api/ai/generate-questions", data);
    },
    onSuccess: (response) => {
      const aiMessage: Message = {
        id: Date.now().toString(),
        type: "ai",
        content: `I've generated ${(response as any).questions?.length || 0} questions about ${(response as any).questions?.[0]?.topic || "the topic"}. Here they are:`,
        timestamp: new Date(),
        actions: [
                      { label: "Add to Question Bank", action: "add_to_bank", data: (response as any).questions },
            { label: "Create Game", action: "create_game", data: (response as any).questions },
        ],
      };
      setMessages(prev => [...prev, aiMessage]);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    sendMessageMutation.mutate(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleActionClick = (action: string, data?: any) => {
    switch (action) {
      case "generate_quiz":
        generateQuestionsMutation.mutate({
          topic: "ocean animals",
          grade: "2nd grade",
          count: 5,
        });
        break;
      case "create_theme":
        // Open theme creator
        break;
      case "upload_pdf":
        // Open file upload
        break;
      default:
        break;
    }
  };

  const generateAIResponse = (message: string): string => {
    const responses = [
      "That's a great question! Let me help you with that.",
      "I can definitely assist you with creating engaging content for your students.",
      "Here are some suggestions based on your request.",
      "Let me generate some educational content for you.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateResponseActions = (message: string) => {
    if (message.toLowerCase().includes("quiz") || message.toLowerCase().includes("question")) {
      return [
        { label: "Generate Questions", action: "generate_quiz" },
        { label: "Add to Bank", action: "add_to_bank" },
      ];
    }
    if (message.toLowerCase().includes("game")) {
      return [
        { label: "Create Game", action: "create_game" },
        { label: "Choose Template", action: "choose_template" },
      ];
    }
    return [];
  };

  return (
    <div className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Bot className="w-5 h-5 mr-2 text-purple-600" />
            AI Assistant
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto max-h-96">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "items-start"}`}
              >
                {message.type === "ai" && (
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === "user"
                      ? "bg-primary text-white"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.actions && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.actions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleActionClick(action.action, action.data)}
                          className="text-xs h-6"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-purple-50"
              onClick={() => handleActionClick("generate_quiz")}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Generate Quiz
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-purple-50"
              onClick={() => handleActionClick("create_theme")}
            >
              <Image className="w-3 h-3 mr-1" />
              Create Theme
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-purple-50"
              onClick={() => handleActionClick("upload_pdf")}
            >
              <FileText className="w-3 h-3 mr-1" />
              Upload PDF
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-purple-50"
            >
              <HelpCircle className="w-3 h-3 mr-1" />
              Get Help
            </Badge>
          </div>
        </div>

        {/* Input */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about creating educational content..."
              className="pr-12"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </div>
  );
}
