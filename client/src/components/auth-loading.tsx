import { GraduationCap, Loader2 } from "lucide-react";

interface AuthLoadingProps {
  message?: string;
}

export default function AuthLoading({ message = "Signing you in..." }: AuthLoadingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        {/* Logo with animation */}
        <div className="relative">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div className="absolute inset-0 w-16 h-16 bg-primary/20 rounded-2xl mx-auto animate-ping"></div>
        </div>
        
        {/* Loading spinner */}
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        
        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Welcome to TeacherTools</h2>
          <p className="text-gray-600">{message}</p>
        </div>
        
        {/* Progress dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
} 