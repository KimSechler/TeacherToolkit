import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  GraduationCap, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  School, 
  BookOpen,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Shield,
  Zap,
  Users,
  Gamepad2,
  Bot
} from "lucide-react";
import { signInWithEmail, signUpWithEmail, getCurrentUser, signInWithGoogle } from "@/lib/supabase";
import AuthLoading from "@/components/auth-loading";
import LegalModal from "@/components/legal-modal";

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  school: string;
  gradeLevel: string;
  acceptTerms: boolean;
  acceptMarketing: boolean;
}

export default function Login() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [legalModal, setLegalModal] = useState<{ type: "terms" | "privacy"; isOpen: boolean }>({
    type: "terms",
    isOpen: false
  });
  
  const [signupData, setSignupData] = useState<SignupData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    school: "",
    gradeLevel: "",
    acceptTerms: false,
    acceptMarketing: false,
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { user } = await getCurrentUser();
        if (user) {
          window.location.href = "/";
        }
      } catch (error) {
        console.log("Error checking user:", error);
      }
    };
    checkUser();
  }, []);

  // Password strength calculator
  useEffect(() => {
    if (!signupData.password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    if (signupData.password.length >= 8) strength += 1;
    if (/[a-z]/.test(signupData.password)) strength += 1;
    if (/[A-Z]/.test(signupData.password)) strength += 1;
    if (/[0-9]/.test(signupData.password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(signupData.password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [signupData.password]);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await signUpWithEmail(signupData.email, signupData.password);
      
      if (error) {
        setError(error.message || "Failed to create account");
      } else {
        // If Supabase returns a session, log the user in immediately
        if (data.session) {
          setIsAuthenticating(true);
          // Use a shorter delay for better UX
          setTimeout(() => {
            window.location.href = "/";
          }, 500);
        } else {
          // If no session, prompt user to log in manually
          setIsSignUp(false);
          setCurrentStep(1);
          setError("Account created! Please log in.");
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { error } = await signInWithEmail(loginData.email, loginData.password);
      
      if (error) {
        setError(error.message || "Authentication failed");
      } else {
        setIsAuthenticating(true);
        // Use a shorter delay for better UX
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message || "Google sign-in failed");
      } else {
        setIsAuthenticating(true);
      }
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };



  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setCurrentStep(1);
    setError("");
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setError("");
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError("");
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return signupData.email && signupData.password && passwordStrength >= 3 && signupData.acceptTerms;
      case 2:
        return signupData.firstName && signupData.lastName && signupData.school;
      case 3:
        return true; // Verification step
      default:
        return true;
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Fair";
    if (passwordStrength <= 4) return "Good";
    return "Strong";
  };

  const features = [
    { icon: <Users className="w-5 h-5" />, text: "Manage multiple classes" },
    { icon: <Gamepad2 className="w-5 h-5" />, text: "Create interactive games" },
    { icon: <Bot className="w-5 h-5" />, text: "AI-powered assistance" },
  ];

  // Show loading screen during authentication
  if (isAuthenticating) {
    return <AuthLoading message="Signing you in..." />;
  }

  if (isSignUp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Form */}
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl">Join TeacherTools</CardTitle>
              <CardDescription>
                Create your account in just a few steps
              </CardDescription>
              
              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between mb-2">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step <= currentStep
                          ? "bg-primary text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
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
              <form onSubmit={handleSignupSubmit} className="space-y-6">
                {/* Step 1: Email & Password */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={signupData.email}
                          onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                          placeholder="Enter your email"
                          className="pl-10"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={signupData.password}
                          onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                          placeholder="Create a strong password"
                          className="pl-10 pr-10"
                          required
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      {signupData.password && (
                        <div className="space-y-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                  level <= passwordStrength ? getPasswordStrengthColor() : "bg-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          <p className={`text-xs ${
                            passwordStrength <= 2 ? "text-red-600" :
                            passwordStrength <= 3 ? "text-yellow-600" : "text-green-600"
                          }`}>
                            Password strength: {getPasswordStrengthText()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="terms"
                          checked={signupData.acceptTerms}
                          onCheckedChange={(checked) => 
                            setSignupData({...signupData, acceptTerms: checked as boolean})
                          }
                        />
                        <Label htmlFor="terms" className="text-sm">
                          I agree to the{" "}
                          <button
                            type="button"
                            onClick={() => setLegalModal({ type: "terms", isOpen: true })}
                            className="text-primary hover:underline"
                          >
                            Terms of Service
                          </button>
                          {" "}and{" "}
                          <button
                            type="button"
                            onClick={() => setLegalModal({ type: "privacy", isOpen: true })}
                            className="text-primary hover:underline"
                          >
                            Privacy Policy
                          </button>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="marketing"
                          checked={signupData.acceptMarketing}
                          onCheckedChange={(checked) => 
                            setSignupData({...signupData, acceptMarketing: checked as boolean})
                          }
                        />
                        <Label htmlFor="marketing" className="text-sm text-gray-600">
                          Send me updates about new features and educational resources
                        </Label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Personal Information */}
                {currentStep === 2 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="firstName"
                            value={signupData.firstName}
                            onChange={(e) => setSignupData({...signupData, firstName: e.target.value})}
                            placeholder="First name"
                            className="pl-10"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="lastName"
                            value={signupData.lastName}
                            onChange={(e) => setSignupData({...signupData, lastName: e.target.value})}
                            placeholder="Last name"
                            className="pl-10"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="school">School/Institution</Label>
                      <div className="relative">
                        <School className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="school"
                          value={signupData.school}
                          onChange={(e) => setSignupData({...signupData, school: e.target.value})}
                          placeholder="Your school or institution"
                          className="pl-10"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gradeLevel">Grade Level (Optional)</Label>
                      <div className="relative">
                        <BookOpen className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <select
                          id="gradeLevel"
                          value={signupData.gradeLevel}
                          onChange={(e) => setSignupData({...signupData, gradeLevel: e.target.value})}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          disabled={isLoading}
                        >
                          <option value="">Select grade level</option>
                          <option value="K-5">K-5 Elementary</option>
                          <option value="6-8">6-8 Middle School</option>
                          <option value="9-12">9-12 High School</option>
                          <option value="Higher Ed">Higher Education</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Welcome */}
                {currentStep === 3 && (
                  <div className="space-y-4 animate-fade-in text-center">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">Welcome to TeacherTools!</h3>
                    <p className="text-gray-600">
                      Your account has been created successfully. Let's get you started!
                    </p>
                    
                    <div className="space-y-3">
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                          {feature.icon}
                          <span>{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                  {currentStep > 1 && currentStep < 3 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={isLoading}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  )}
                  
                  <div className="flex-1" />
                  
                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!canProceedToNextStep() || isLoading}
                      className="ml-auto"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="ml-auto"
                    >
                      {isLoading ? "Setting up..." : "Get Started"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Right Side - Benefits */}
          <div className="hidden lg:flex flex-col justify-center space-y-8">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Transform Your Teaching Experience
              </h2>
              <p className="text-lg text-gray-600">
                Join thousands of educators who are already using TeacherTools to create engaging, interactive learning experiences.
              </p>
              
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <span className="text-gray-700">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Start Free Today</h3>
              <p className="text-purple-100 mb-4">
                No credit card required. Get started with all features free for 30 days.
              </p>
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="w-4 h-4" />
                <span>Secure & Privacy-First</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Legal Modal */}
        <LegalModal
          type={legalModal.type}
          isOpen={legalModal.isOpen}
          onClose={() => setLegalModal({ ...legalModal, isOpen: false })}
        />
      </div>
    );
  }

  // Login Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Login Form */}
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access your TeacherTools dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                      placeholder="Enter your email"
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            </form>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={toggleSignUp}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                Don't have an account? Sign up
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Right Side - Benefits */}
        <div className="hidden lg:flex flex-col justify-center space-y-8">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome Back to TeacherTools
            </h2>
            <p className="text-lg text-gray-600">
              Continue creating amazing learning experiences for your students.
            </p>
            
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <span className="text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Your Classes Are Waiting</h3>
            <p className="text-green-100 mb-4">
              Jump back into your dashboard and continue where you left off.
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <Zap className="w-4 h-4" />
              <span>Quick & Easy Access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 