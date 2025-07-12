import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  GraduationCap, 
  Users, 
  ClipboardCheck, 
  Gamepad2, 
  Bot, 
  BookOpen,
  Play,
  Star,
  CheckCircle
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: <ClipboardCheck className="w-8 h-8 text-blue-600" />,
      title: "Attendance Tracker",
      description: "Interactive attendance with Question of the Day and drag-and-drop functionality",
      color: "bg-blue-50"
    },
    {
      icon: <Gamepad2 className="w-8 h-8 text-purple-600" />,
      title: "Game Creator",
      description: "Create engaging educational games with multiple templates and themes",
      color: "bg-purple-50"
    },
    {
      icon: <Bot className="w-8 h-8 text-pink-600" />,
      title: "AI Assistant",
      description: "Get intelligent help with content creation and classroom management",
      color: "bg-pink-50"
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Class Management",
      description: "Organize students, track progress, and manage multiple classes",
      color: "bg-green-50"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-amber-600" />,
      title: "Question Bank",
      description: "Build and organize your collection of questions and assessments",
      color: "bg-amber-50"
    },
    {
      icon: <Star className="w-8 h-8 text-red-600" />,
      title: "Reports & Analytics",
      description: "Generate detailed reports and track student performance",
      color: "bg-red-50"
    }
  ];

  const benefits = [
    "Save hours of prep time with AI-powered content generation",
    "Increase student engagement with interactive games",
    "Streamline attendance tracking with visual interfaces",
    "Access everything from tablets, desktops, and smartboards",
    "Export data in multiple formats for easy reporting"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-800">TeacherTools</span>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => window.location.href = '/login'}
                className="bg-primary hover:bg-primary/90"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Modern Classroom Management
            <span className="block gradient-text">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your teaching experience with AI-powered tools for attendance tracking, 
            game creation, and student engagement. Everything you need in one beautiful platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/login'}
              className="bg-primary hover:bg-primary/90 text-lg px-8 py-3"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Teaching Better
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-3"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Comprehensive tools designed specifically for modern educators
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover border-0 shadow-md">
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Teachers Love TeacherTools
            </h2>
            <p className="text-gray-600 text-lg">
              Join thousands of educators who have transformed their classrooms
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-purple-100 mb-6">
                Join the revolution in classroom management. Sign up now and start creating 
                engaging learning experiences for your students.
              </p>
              <Button 
                size="lg" 
                onClick={() => window.location.href = '/login'}
                className="bg-white text-purple-600 hover:bg-gray-100 w-full"
              >
                Sign Up Free
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">TeacherTools</span>
          </div>
          <p className="text-gray-400 mb-8">
            Empowering educators with modern tools for effective teaching
          </p>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-sm text-gray-500">
              © 2024 TeacherTools. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
