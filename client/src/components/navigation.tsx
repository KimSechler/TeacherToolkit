import { useAuth } from "@/hooks/useAuth";
import { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Bell, LogOut } from "lucide-react";

export default function Navigation() {
  const { user } = useAuth();
  const typedUser = user as User | undefined;

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-800">TeacherTools</span>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5 text-gray-500" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </Button>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              {typedUser?.profileImageUrl ? (
                <img 
                  src={typedUser.profileImageUrl} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {typedUser?.firstName?.[0] || "U"}
                  </span>
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {typedUser?.firstName ? `${typedUser.firstName} ${typedUser.lastName || ''}`.trim() : 'User'}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
