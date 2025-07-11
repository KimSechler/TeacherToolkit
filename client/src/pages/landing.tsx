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
  CheckCircle,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Clock,
  Award
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: <ClipboardCheck className="w-8 h-8 text-blue-600" />,
      title: "Interactive Attendance",
      description: "Engage students with Question of the Day and visual drag-and-drop attendance tracking",
      color: "bg-blue-50"
    },
    {
      icon: <Gamepad2 className="w-8 h-8 text-purple-600" />,
      title: "Game Creator",
      description: "Build educational games with AI-powered themes and multiple templates",
      color: "bg-purple-50"
    },
    {
      icon: <Bot className="w-8 h-8 text-pink-600" />,
      title: "AI Assistant",
      description: "Generate questions, create content, and get intelligent classroom management help",
      color: "bg-pink-50"
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Class Management",
      description: "Organize students, track progress, and manage multiple classes effortlessly",
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
      description: "Generate detailed reports and track student performance over time",
      color: "bg-red-50"
    }
  ];

  const benefits = [
    "Save 2-3 hours per week with AI-powered content generation",
    "Increase student engagement by 40% with interactive games",
    "Streamline attendance tracking with visual interfaces",
    "Access everything from tablets, desktops, and smartboards",
    "Export data in multiple formats for easy reporting"
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "5th Grade Teacher",
      content: "TeacherTools has transformed how I manage my classroom. The attendance tracker is a game-changer!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "High School Science",
      content: "The AI assistant helps me create engaging content in minutes, not hours.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Middle School Math",
      content: "My students love the interactive games. It's made learning fun again!",
      rating: 5
    }
  ];

  const stats = [
    { number: "10,000+", label: "Teachers" },
    { number: "500,000+", label: "Students" },
    { number: "2M+", label: "Questions Created" },
    { number: "98%", label: "Satisfaction Rate" }
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
                variant="outline"
                onClick={() => window.location.href = '/login'}
                className="hidden sm:inline-flex"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => window.location.href = '/login'}
                className="bg-primary hover:bg-primary/90"
              >
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Join 10,000+ teachers already using TeacherTools
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Modern Classroom Management
            <span className="block gradient-text">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your teaching experience with AI-powered tools for attendance tracking, 
            game creation, and student engagement. Everything you need in one beautiful platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/login'}
              className="bg-primary hover:bg-primary/90 text-lg px-8 py-3"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Teaching Better
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-3"
            >
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Comprehensive tools designed specifically for modern educators
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover border-0 shadow-md group">
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 rounded-lg ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Teachers Love TeacherTools
            </h2>
            <p className="text-gray-600 text-lg">
              Join thousands of educators who have transformed their classrooms
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Shield className="w-4 h-4" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>30-day free trial</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Zap className="w-4 h-4" />
                  <span>Setup in under 2 minutes</span>
                </div>
              </div>
              <Button 
                size="lg" 
                onClick={() => window.location.href = '/login'}
                className="bg-white text-purple-600 hover:bg-gray-100 w-full mt-6"
              >
                Sign Up Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Teachers Are Saying
            </h2>
            <p className="text-gray-600 text-lg">
              Real feedback from educators using TeacherTools
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl p-12 text-white">
            <Award className="w-16 h-16 mx-auto mb-6 text-yellow-300" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Start Your Free Trial Today
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of teachers who are already saving time and engaging their students with TeacherTools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => window.location.href = '/login'}
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-white border-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3"
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">TeacherTools</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Empowering educators with modern tools for effective teaching. Transform your classroom with AI-powered solutions.
              </p>
              <Button 
                onClick={() => window.location.href = '/login'}
                className="bg-primary hover:bg-primary/90"
              >
                Get Started Free
              </Button>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Demo</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 mt-8 text-center">
            <p className="text-sm text-gray-500">
              © 2024 TeacherTools. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
