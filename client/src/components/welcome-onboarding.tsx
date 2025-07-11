import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  GraduationCap, 
  Users, 
  ClipboardCheck, 
  Gamepad2, 
  Bot, 
  BookOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Zap,
  Star,
  Plus,
  Play
} from "lucide-react";

interface WelcomeOnboardingProps {
  onComplete: () => void;
  userData: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function WelcomeOnboarding({ onComplete, userData }: WelcomeOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [demoClass, setDemoClass] = useState({
    name: "My First Class",
    subject: "General",
    gradeLevel: "6-8"
  });

  const steps = [
    {
      id: 1,
      title: "Welcome to TeacherTools!",
      description: "Let's get you set up in just a few minutes",
      icon: <Sparkles className="w-8 h-8" />
    },
    {
      id: 2,
      title: "Create Your First Class",
      description: "Set up a class to start tracking attendance",
      icon: <Users className="w-8 h-8" />
    },
    {
      id: 3,
      title: "Explore Features",
      description: "Discover what TeacherTools can do for you",
      icon: <Star className="w-8 h-8" />
    },
    {
      id: 4,
      title: "You're All Set!",
      description: "Ready to transform your classroom",
      icon: <CheckCircle className="w-8 h-8" />
    }
  ];

  const features = [
    {
      icon: <ClipboardCheck className="w-6 h-6 text-blue-600" />,
      title: "Interactive Attendance",
      description: "Engage students with Question of the Day and visual tracking",
      color: "bg-blue-50"
    },
    {
      icon: <Gamepad2 className="w-6 h-6 text-purple-600" />,
      title: "Game Creator",
      description: "Build educational games with AI-powered themes",
      color: "bg-purple-50"
    },
    {
      icon: <Bot className="w-6 h-6 text-pink-600" />,
      title: "AI Assistant",
      description: "Generate questions and content in seconds",
      color: "bg-pink-50"
    },
    {
      icon: <BookOpen className="w-6 h-6 text-green-600" />,
      title: "Question Bank",
      description: "Organize and manage your teaching resources",
      color: "bg-green-50"
    }
  ];

  const quickActions = [
    {
      title: "Take Attendance",
      description: "Start tracking attendance for your class",
      icon: <ClipboardCheck className="w-5 h-5" />,
      action: () => window.location.href = "/attendance"
    },
    {
      title: "Create a Game",
      description: "Build an interactive learning game",
      icon: <Gamepad2 className="w-5 h-5" />,
      action: () => window.location.href = "/game-creator"
    },
    {
      title: "Add Students",
      description: "Manage your class roster",
      icon: <Users className="w-5 h-5" />,
      action: () => window.location.href = "/classes"
    },
    {
      title: "Generate Questions",
      description: "Use AI to create engaging content",
      icon: <Bot className="w-5 h-5" />,
      action: () => window.location.href = "/question-bank"
    }
  ];

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              {steps[currentStep - 1].icon}
            </div>
            <CardTitle className="text-2xl">{steps[currentStep - 1].title}</CardTitle>
            <CardDescription className="text-lg">
              {steps[currentStep - 1].description}
            </CardDescription>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between mb-2">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.id <= currentStep
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step.id < currentStep ? <CheckCircle className="w-4 h-4" /> : step.id}
                  </div>
                ))}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">
                    Welcome, {userData.firstName}! 👋
                  </h3>
                  <p className="text-gray-600 mb-6">
                    You're about to discover how TeacherTools can transform your teaching experience.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div key={index} className={`p-4 rounded-lg ${feature.color} border`}>
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                          {feature.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">Pro Tip</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Most teachers see results within their first week. Start with attendance tracking to get familiar with the platform!
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Create First Class */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <p className="text-gray-600">
                    Let's create your first class to get started with attendance tracking.
                  </p>
                </div>
                
                <div className="max-w-md mx-auto space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="className">Class Name</Label>
                    <Input
                      id="className"
                      value={demoClass.name}
                      onChange={(e) => setDemoClass({...demoClass, name: e.target.value})}
                      placeholder="e.g., Math 101, Science Lab"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <select
                      id="subject"
                      value={demoClass.subject}
                      onChange={(e) => setDemoClass({...demoClass, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="General">General</option>
                      <option value="Math">Math</option>
                      <option value="Science">Science</option>
                      <option value="English">English</option>
                      <option value="History">History</option>
                      <option value="Art">Art</option>
                      <option value="Music">Music</option>
                      <option value="Physical Education">Physical Education</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gradeLevel">Grade Level</Label>
                    <select
                      id="gradeLevel"
                      value={demoClass.gradeLevel}
                      onChange={(e) => setDemoClass({...demoClass, gradeLevel: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="K-5">K-5 Elementary</option>
                      <option value="6-8">6-8 Middle School</option>
                      <option value="9-12">9-12 High School</option>
                      <option value="Higher Ed">Higher Education</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> You can always edit this class later or create additional classes from your dashboard.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Explore Features */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <p className="text-gray-600">
                    Here are some quick actions to help you get started with TeacherTools.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          {action.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{action.title}</h4>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Play className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-purple-800">Ready to Explore?</span>
                  </div>
                  <p className="text-sm text-purple-700">
                    Click on any of the actions above to jump right in, or continue to complete your setup.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Completion */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">You're All Set!</h3>
                  <p className="text-gray-600 mb-6">
                    Your TeacherTools account is ready. Start exploring and transform your classroom today!
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <ClipboardCheck className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium">Track Attendance</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Gamepad2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium">Create Games</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Bot className="w-6 h-6 text-pink-600" />
                    </div>
                    <p className="text-sm font-medium">Use AI Assistant</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Need help?</strong> Check out our{" "}
                    <a href="#" className="text-primary hover:underline">getting started guide</a>{" "}
                    or contact our support team.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              
              <div className="flex-1" />
              
              <Button
                onClick={nextStep}
                className="ml-auto"
              >
                {currentStep === 4 ? "Get Started" : "Continue"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 