import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { loadCustomQuestions } from "@/lib/questionLibrary";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Attendance from "@/pages/attendance";
import AttendanceTrackerRoute from "@/components/attendance-tracker-route";
import GameCreator from "@/pages/game-creator";
import Classes from "@/pages/classes";
import QuestionBank from "@/pages/question-bank";
import Reports from "@/pages/reports";
import TestPage from "@/pages/test";
import JoinPage from "@/pages/join";
import NotFound from "@/pages/not-found";

// Load custom questions when the app starts
loadCustomQuestions();

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/join/:sessionCode?" component={JoinPage} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/attendance" component={Attendance} />
          <Route path="/attendance-tracker/:classId/:themeId" component={AttendanceTrackerRoute} />
          <Route path="/game-creator" component={GameCreator} />
          <Route path="/classes" component={Classes} />
          <Route path="/question-bank" component={QuestionBank} />
          <Route path="/reports" component={Reports} />
          <Route path="/test" component={TestPage} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
