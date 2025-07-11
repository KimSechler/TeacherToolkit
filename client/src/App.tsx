import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { loadCustomQuestions } from "@/lib/questionLibrary";
import { ErrorBoundary } from "@/components/error-boundary";
import { lazy, Suspense } from "react";
import { DebugBanner } from "@/components/debug-banner";
import AttendanceTrackerSpace from "@/components/attendance-tracker-space";

// Lazy load pages for code splitting
const Landing = lazy(() => import("@/pages/landing"));
const Login = lazy(() => import("@/pages/login"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Attendance = lazy(() => import("@/pages/attendance"));
const TestAttendance = lazy(() => import("@/pages/test-attendance"));
const AttendanceTrackerRoute = lazy(() => import("@/components/attendance-tracker-route"));
const GameCreator = lazy(() => import("@/pages/game-creator"));
const Classes = lazy(() => import("@/pages/classes"));
const QuestionBank = lazy(() => import("@/pages/question-bank"));
const Reports = lazy(() => import("@/pages/reports"));
const TestPage = lazy(() => import("@/pages/test"));
const JoinPage = lazy(() => import("@/pages/join"));
const TestLogin = lazy(() => import("@/pages/test-login"));
const AuthCallback = lazy(() => import("@/pages/auth-callback"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Load custom questions when the app starts
loadCustomQuestions();

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <Switch>
        {isLoading || !isAuthenticated ? (
          <>
            <Route path="/" component={Landing} />
            <Route path="/login" component={Login} />
            <Route path="/test-login" component={TestLogin} />
            <Route path="/join/:sessionCode?" component={JoinPage} />
            <Route path="/auth/callback" component={AuthCallback} />
          </>
        ) : (
          <>
            <Route path="/" component={Dashboard} />
            <Route path="/attendance" component={Attendance} />
            <Route path="/test-attendance" component={TestAttendance} />
            <Route path="/attendance-tracker/:classId/:themeId" component={AttendanceTrackerRoute} />
            <Route path="/attendance-tracker-space/:classId" component={AttendanceTrackerSpace} />
            <Route path="/game-creator" component={GameCreator} />
            <Route path="/classes" component={Classes} />
            <Route path="/question-bank" component={QuestionBank} />
            <Route path="/reports" component={Reports} />
            <Route path="/test" component={TestPage} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <DebugBanner />
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
