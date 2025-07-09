import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Users, 
  ClipboardCheck, 
  Gamepad2, 
  HelpCircle, 
  BarChart3,
  Bot
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "My Classes", href: "/classes", icon: Users },
    { name: "Attendance", href: "/attendance", icon: ClipboardCheck },
    { name: "Game Creator", href: "/game-creator", icon: Gamepad2 },
    { name: "Question Bank", href: "/question-bank", icon: HelpCircle },
    { name: "Reports", href: "/reports", icon: BarChart3 },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-16">
      <div className="p-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start transition-colors",
                    isActive 
                      ? "bg-primary text-white hover:bg-primary/90" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  <span>{item.name}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* AI Assistant Panel */}
        <div className="mt-8 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
          <div className="flex items-center mb-2">
            <Bot className="w-5 h-5 mr-2" />
            <span className="font-medium">AI Assistant</span>
          </div>
          <p className="text-sm opacity-90 mb-3">
            Get help with content creation and classroom ideas
          </p>
          <Button 
            size="sm" 
            className="bg-white text-purple-600 hover:bg-gray-100 w-full"
          >
            Chat Now
          </Button>
        </div>
      </div>
    </div>
  );
}
