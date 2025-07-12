import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import {
  insertClassSchema,
  insertStudentSchema,
  insertQuestionSchema,
  insertAttendanceRecordSchema,
  insertGameSchema,
  insertGameSessionSchema,
  insertAiConversationSchema,
  insertQuestionUsageSchema,
} from "@shared/schema";
import { generateQuestions, generateGameTheme, analyzeImage } from "./openai";
import { checkPlanLimit, trackUsage, addUsageInfo } from "./middleware/planEnforcement";

export async function registerRoutes(app: Express, isAuthenticated: RequestHandler): Promise<Server> {
  // Auth routes (handled by local auth)

  // Class routes
  app.get('/api/classes', isAuthenticated, async (req: any, res) => {
    try {
      const teacherId = req.supabaseUser.id;
      const classes = await storage.getClassesByTeacher(teacherId);
      res.json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  app.post('/api/classes', 
    isAuthenticated, 
    addUsageInfo,
    checkPlanLimit('create_class'),
    trackUsage,
    async (req: any, res) => {
      try {
        const teacherId = req.supabaseUser.id;
        const classData = insertClassSchema.parse({ ...req.body, teacherId });
        const newClass = await storage.createClass(classData);
        res.json(newClass);
      } catch (error) {
        console.error("Error creating class:", error);
        res.status(500).json({ message: "Failed to create class" });
      }
    }
  );

  app.put('/api/classes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const classData = req.body;
      const updatedClass = await storage.updateClass(id, classData);
      res.json(updatedClass);
    } catch (error) {
      console.error("Error updating class:", error);
      res.status(500).json({ message: "Failed to update class" });
    }
  });

  app.delete('/api/classes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteClass(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting class:", error);
      res.status(500).json({ message: "Failed to delete class" });
    }
  });

  // Student routes
  app.get('/api/classes/:classId/students', isAuthenticated, async (req: any, res) => {
    try {
      const classId = parseInt(req.params.classId);
      const students = await storage.getStudentsByClass(classId);
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.post('/api/classes/:classId/students', 
    isAuthenticated, 
    addUsageInfo,
    checkPlanLimit('add_student'),
    trackUsage,
    async (req: any, res) => {
      try {
        const classId = parseInt(req.params.classId);
        const studentData = insertStudentSchema.parse({ ...req.body, classId });
        const newStudent = await storage.createStudent(studentData);
        res.json(newStudent);
      } catch (error) {
        console.error("Error creating student:", error);
        res.status(500).json({ message: "Failed to create student" });
      }
    }
  );

  app.post('/api/classes/:classId/students/bulk', isAuthenticated, async (req: any, res) => {
    try {
      const classId = parseInt(req.params.classId);
      const { students } = req.body;
      
      if (!Array.isArray(students)) {
        return res.status(400).json({ message: "Students must be an array" });
      }

      const createdStudents = [];
      for (const studentData of students) {
        try {
          const validatedData = insertStudentSchema.parse({ ...studentData, classId });
          const newStudent = await storage.createStudent(validatedData);
          createdStudents.push(newStudent);
        } catch (error) {
          console.error(`Error creating student ${studentData.name}:`, error);
          // Continue with other students even if one fails
        }
      }

      console.log(`Bulk imported ${createdStudents.length} students to class ${classId}`);
      res.json(createdStudents);
    } catch (error) {
      console.error("Error bulk importing students:", error);
      res.status(500).json({ message: "Failed to import students" });
    }
  });

  app.put('/api/students/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const studentData = req.body;
      const updatedStudent = await storage.updateStudent(id, studentData);
      res.json(updatedStudent);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ message: "Failed to update student" });
    }
  });

  app.delete('/api/students/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteStudent(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // Question routes
  app.get('/api/questions', isAuthenticated, async (req: any, res) => {
    try {
      const teacherId = req.supabaseUser.id;
      const type = req.query.type as string;
      const questions = type
        ? await storage.getQuestionsByType(teacherId, type)
        : await storage.getQuestionsByTeacher(teacherId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.post('/api/questions', 
    isAuthenticated, 
    addUsageInfo,
    checkPlanLimit('create_question'),
    trackUsage,
    async (req: any, res) => {
      try {
        const teacherId = req.supabaseUser.id;
        const questionData = insertQuestionSchema.parse({ ...req.body, teacherId });
        const newQuestion = await storage.createQuestion(questionData);
        res.json(newQuestion);
      } catch (error) {
        console.error("Error creating question:", error);
        res.status(500).json({ message: "Failed to create question" });
      }
    }
  );

  app.put('/api/questions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const questionData = req.body;
      const updatedQuestion = await storage.updateQuestion(id, questionData);
      res.json(updatedQuestion);
    } catch (error) {
      console.error("Error updating question:", error);
      res.status(500).json({ message: "Failed to update question" });
    }
  });

  app.delete('/api/questions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteQuestion(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting question:", error);
      res.status(500).json({ message: "Failed to delete question" });
    }
  });

  // Attendance routes
  app.get('/api/classes/:classId/attendance', isAuthenticated, async (req: any, res) => {
    try {
      const classId = parseInt(req.params.classId);
      const date = req.query.date as string;
      const records = await storage.getAttendanceRecords(classId, date);
      res.json(records);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.post('/api/attendance', isAuthenticated, async (req: any, res) => {
    try {
      const { records } = req.body;
      
      if (!Array.isArray(records)) {
        return res.status(400).json({ message: "Records must be an array" });
      }

      const createdRecords = [];
      for (const recordData of records) {
        try {
          const validatedData = insertAttendanceRecordSchema.parse(recordData);
          const newRecord = await storage.createAttendanceRecord(validatedData);
          createdRecords.push(newRecord);
        } catch (error) {
          console.error(`Error creating attendance record:`, error);
        }
      }

      res.json(createdRecords);
    } catch (error) {
      console.error("Error creating attendance records:", error);
      res.status(500).json({ message: "Failed to create attendance records" });
    }
  });

  // Game routes
  app.get('/api/games', isAuthenticated, async (req: any, res) => {
    try {
      const teacherId = req.supabaseUser.id;
      const games = await storage.getGamesByTeacher(teacherId);
      res.json(games);
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.post('/api/games', 
    isAuthenticated, 
    addUsageInfo,
    checkPlanLimit('create_game'),
    trackUsage,
    async (req: any, res) => {
      try {
        const teacherId = req.supabaseUser.id;
        const gameData = insertGameSchema.parse({ ...req.body, teacherId });
        const newGame = await storage.createGame(gameData);
        res.json(newGame);
      } catch (error) {
        console.error("Error creating game:", error);
        res.status(500).json({ message: "Failed to create game" });
      }
    }
  );

  app.put('/api/games/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const gameData = req.body;
      const updatedGame = await storage.updateGame(id, gameData);
      res.json(updatedGame);
    } catch (error) {
      console.error("Error updating game:", error);
      res.status(500).json({ message: "Failed to update game" });
    }
  });

  app.delete('/api/games/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteGame(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting game:", error);
      res.status(500).json({ message: "Failed to delete game" });
    }
  });

  // AI routes
  app.post('/api/ai/generate-questions', isAuthenticated, async (req: any, res) => {
    try {
      const { topic, grade, count } = req.body;
      const questions = await generateQuestions(topic, grade, count);
      res.json({ questions });
    } catch (error) {
      console.error("Error generating questions:", error);
      res.status(500).json({ message: "Failed to generate questions" });
    }
  });

  app.post('/api/ai/generate-theme', isAuthenticated, async (req: any, res) => {
    try {
      const { themeName, description } = req.body;
      const theme = await generateGameTheme(themeName, description);
      res.json({ theme });
    } catch (error) {
      console.error("Error generating theme:", error);
      res.status(500).json({ message: "Failed to generate theme" });
    }
  });

  // Updated image analysis route - now accepts base64 data instead of file upload
  app.post('/api/ai/analyze-image', isAuthenticated, async (req: any, res) => {
    try {
      const { imageData } = req.body; // Expect base64 image data
      
      if (!imageData) {
        return res.status(400).json({ message: "No image data provided" });
      }

      const analysis = await analyzeImage(imageData);
      res.json({ analysis });
    } catch (error) {
      console.error("Error analyzing image:", error);
      res.status(500).json({ message: "Failed to analyze image" });
    }
  });

  // AI conversation routes
  app.get('/api/ai/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const teacherId = req.supabaseUser.id;
      const conversations = await storage.getConversationsByTeacher(teacherId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post('/api/ai/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const teacherId = req.supabaseUser.id;
      const conversationData = insertAiConversationSchema.parse({ ...req.body, teacherId });
      const newConversation = await storage.createConversation(conversationData);
      res.json(newConversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.put('/api/ai/conversations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const conversationData = req.body;
      const updatedConversation = await storage.updateConversation(id, conversationData);
      res.json(updatedConversation);
    } catch (error) {
      console.error("Error updating conversation:", error);
      res.status(500).json({ message: "Failed to update conversation" });
    }
  });

  // Game session routes for Supabase Realtime
  app.get('/api/game-sessions/:sessionId', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = req.params.sessionId;
      const session = await storage.getGameSession(sessionId);
      res.json(session);
    } catch (error) {
      console.error("Error fetching game session:", error);
      res.status(500).json({ message: "Failed to fetch game session" });
    }
  });

  app.post('/api/game-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const sessionData = insertGameSessionSchema.parse(req.body);
      const newSession = await storage.createGameSession(sessionData);
      res.json(newSession);
    } catch (error) {
      console.error("Error creating game session:", error);
      res.status(500).json({ message: "Failed to create game session" });
    }
  });

  app.put('/api/game-sessions/:sessionId', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = req.params.sessionId;
      const sessionData = req.body;
      const updatedSession = await storage.updateGameSession(sessionId, sessionData);
      res.json(updatedSession);
    } catch (error) {
      console.error("Error updating game session:", error);
      res.status(500).json({ message: "Failed to update game session" });
    }
  });

  app.delete('/api/game-sessions/:sessionId', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = req.params.sessionId;
      await storage.deleteGameSession(sessionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting game session:", error);
      res.status(500).json({ message: "Failed to delete game session" });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  return createServer(app);
}
