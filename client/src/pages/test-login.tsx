import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { GraduationCap } from "lucide-react";
import { signInWithEmail, signUpWithEmail } from "@/lib/supabase";
import { debugAuth } from "@/lib/debug";

export default function TestLogin() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Run debug checks on component mount
  useEffect(() => {
    const runDebugChecks = async () => {
      const info: string[] = [];
      
      // Check environment variables
      const envOk = debugAuth.checkEnvironment();
      info.push(`Environment: ${envOk ? '✅ OK' : '❌ FAILED'}`);
      
      // Check Supabase connection
      const connectionOk = await debugAuth.checkSupabaseConnection();
      info.push(`Supabase Connection: ${connectionOk ? '✅ OK' : '❌ FAILED'}`);
      
      setDebugInfo(info);
    };
    
    runDebugChecks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      debugAuth.log("Attempting authentication...", { email, isSignUp });
      const { data, error } = isSignUp 
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password);

      if (error) {
        debugAuth.error("Auth error", error);
        setError(error.message || "Authentication failed");
      } else {
        debugAuth.log("Auth success", data);
        setSuccess(isSignUp ? "Account created successfully! You can now sign in." : "Signed in successfully!");
        if (!isSignUp) {
          setTimeout(() => {
            window.location.href = "/";
          }, 1000);
        }
      }
    } catch (err) {
      debugAuth.error("Network error", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Test Login</CardTitle>
          <CardDescription>
            Debug authentication issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Debug Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <h4 className="font-semibold text-sm mb-2">Debug Status:</h4>
            {debugInfo.map((info, index) => (
              <div key={index} className="text-xs text-gray-600">{info}</div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                <strong>Error:</strong> {error}
              </div>
            )}

            {success && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                <strong>Success:</strong> {success}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (isSignUp ? "Creating account..." : "Signing in...") : (isSignUp ? "Create Account" : "Sign In")}
            </Button>
          </form>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={toggleSignUp}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Test Credentials:</strong><br />
              Email: test@example.com<br />
              Password: password123<br />
              <br />
              <strong>Instructions:</strong><br />
              1. Click "Don't have an account? Sign up" to create a test account<br />
              2. Then sign in with the same credentials<br />
              3. Check browser console for detailed logs
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 