import { useRoute } from "wouter";
import { useEffect, useState } from "react";
import AttendanceTrackerFull from "./attendance-tracker-full";
import AttendanceTrackerClean from "./attendance-tracker-clean";
import { getRandomQuestion, getQuestionById, QuestionOfDay } from "@/lib/questionLibrary";

export default function AttendanceTrackerRoute() {
  const [, params] = useRoute<{ classId: string; themeId: string }>("/attendance-tracker/:classId/:themeId");
  const [question, setQuestion] = useState<QuestionOfDay | null>(null);
  
  if (!params) {
    return <div>Invalid route</div>;
  }

  const classId = parseInt(params.classId);
  const themeId = params.themeId;

  if (isNaN(classId)) {
    return <div>Invalid class ID</div>;
  }

  // Get question ID from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const questionId = urlParams.get('questionId');
    
    if (questionId && questionId !== 'random') {
      // Try to get the specific question by ID
      const specificQuestion = getQuestionById(parseInt(questionId));
      if (specificQuestion) {
        setQuestion(specificQuestion);
        return;
      }
    }
    
    // Fallback to random question if no valid question ID or question not found
    setQuestion(getRandomQuestion());
  }, []);

  // Show loading while question is being determined
  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  // Use clean template for "clean" theme, otherwise use full template
  if (themeId === "clean") {
    return <AttendanceTrackerClean classId={classId} themeId={themeId} question={question} />;
  }

  return <AttendanceTrackerFull classId={classId} themeId={themeId} question={question} />;
} 