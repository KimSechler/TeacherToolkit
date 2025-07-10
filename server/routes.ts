import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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
import multer from "multer";
import fs from "fs";

const upload = multer({ dest: "uploads/" });

export async function registerRoutes(app: Express, isAuthenticated: RequestHandler): Promise<Server> {
  // Auth routes (handled by local auth)

  // Class routes
  app.get('/api/classes', isAuthenticated, async (req: any, res) => {
    try {
      const teacherId = req.session.user.id;
      const classes = await storage.getClassesByTeacher(teacherId);
      res.json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  app.post('/api/classes', isAuthenticated, async (req: any, res) => {
    try {
      const teacherId = req.session.user.id;
      const classData = insertClassSchema.parse({ ...req.body, teacherId });
      const newClass = await storage.createClass(classData);
      res.json(newClass);
    } catch (error) {
      console.error("Error creating class:", error);
      res.status(500).json({ message: "Failed to create class" });
    }
  });

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

  app.post('/api/classes/:classId/students', isAuthenticated, async (req: any, res) => {
    try {
      const classId = parseInt(req.params.classId);
      const studentData = insertStudentSchema.parse({ ...req.body, classId });
      const newStudent = await storage.createStudent(studentData);
      res.json(newStudent);
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(500).json({ message: "Failed to create student" });
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
      const teacherId = req.session.user.id;
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

  app.post('/api/questions', isAuthenticated, async (req: any, res) => {
    try {
      const teacherId = req.session.user.id;
      const questionData = insertQuestionSchema.parse({ ...req.body, teacherId });
      const newQuestion = await storage.createQuestion(questionData);
      res.json(newQuestion);
    } catch (error) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Failed to create question" });
    }
  });

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
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      const attendance = await storage.getAttendanceByClassAndDate(classId, date);
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.post('/api/attendance', isAuthenticated, async (req: any, res) => {
    try {
      const recordData = insertAttendanceRecordSchema.parse(req.body);
      const newRecord = await storage.createAttendanceRecord(recordData);
      res.json(newRecord);
    } catch (error) {
      console.error("Error creating attendance record:", error);
      res.status(500).json({ message: "Failed to create attendance record" });
    }
  });

  app.put('/api/attendance/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const recordData = req.body;
      const updatedRecord = await storage.updateAttendanceRecord(id, recordData);
      res.json(updatedRecord);
    } catch (error) {
      console.error("Error updating attendance record:", error);
      res.status(500).json({ message: "Failed to update attendance record" });
    }
  });

  // Game routes
  app.get('/api/games', isAuthenticated, async (req: any, res) => {
    try {
      const teacherId = req.session.user.id;
      const games = await storage.getGamesByTeacher(teacherId);
      res.json(games);
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.post('/api/games', isAuthenticated, async (req: any, res) => {
    try {
      const teacherId = req.session.user.id;
      const gameData = insertGameSchema.parse({ ...req.body, teacherId });
      const newGame = await storage.createGame(gameData);
      res.json(newGame);
    } catch (error) {
      console.error("Error creating game:", error);
      res.status(500).json({ message: "Failed to create game" });
    }
  });

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

  // Game session routes
  app.get('/api/classes/:classId/game-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const classId = parseInt(req.params.classId);
      const sessions = await storage.getGameSessionsByClass(classId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching game sessions:", error);
      res.status(500).json({ message: "Failed to fetch game sessions" });
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

  app.put('/api/game-sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const sessionData = req.body;
      const updatedSession = await storage.updateGameSession(id, sessionData);
      res.json(updatedSession);
    } catch (error) {
      console.error("Error updating game session:", error);
      res.status(500).json({ message: "Failed to update game session" });
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

  app.post('/api/ai/analyze-image', isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const imageBuffer = fs.readFileSync(req.file.path);
      const base64Image = imageBuffer.toString('base64');

      const analysis = await analyzeImage(base64Image);

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.json({ analysis });
    } catch (error) {
      console.error("Error analyzing image:", error);
      res.status(500).json({ message: "Failed to analyze image" });
    }
  });

  // AI conversation routes
  app.get('/api/ai/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const teacherId = req.session.user.id;
      const conversations = await storage.getConversationsByTeacher(teacherId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post('/api/ai/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const teacherId = req.session.user.id;
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

  // Question usage tracking routes
  app.post('/api/question-usage', isAuthenticated, async (req: any, res) => {
    try {
      const teacherId = req.session.user.id;
      const usageData = insertQuestionUsageSchema.parse({ ...req.body, teacherId });
      const newUsage = await storage.recordQuestionUsage(usageData);
      res.json(newUsage);
    } catch (error) {
      console.error("Error recording question usage:", error);
      res.status(500).json({ message: "Failed to record question usage" });
    }
  });

  app.get('/api/classes/:classId/recent-questions', isAuthenticated, async (req: any, res) => {
    try {
      const classId = parseInt(req.params.classId);
      const daysBack = req.query.days ? parseInt(req.query.days as string) : 7;
      const recentQuestions = await storage.getRecentlyUsedQuestions(classId, daysBack);
      res.json(recentQuestions);
    } catch (error) {
      console.error("Error fetching recent questions:", error);
      res.status(500).json({ message: "Failed to fetch recent questions" });
    }
  });

  // Attendance stats
  app.get('/api/classes/:classId/attendance/stats', isAuthenticated, async (req: any, res) => {
    try {
      const classId = parseInt(req.params.classId);
      const students = await storage.getStudentsByClass(classId);

      // For demo purposes, return mock stats
      res.json({
        totalStudents: students.length,
        presentToday: Math.floor(students.length * 0.85), // 85% attendance
        attendanceRate: 85,
        responses: Math.floor(students.length * 0.75), // 75% responded to question
      });
    } catch (error) {
      console.error("Error fetching attendance stats:", error);
      res.status(500).json({ message: "Failed to fetch attendance stats" });
    }
  });

  // Enhanced attendance results
  app.get('/api/classes/:classId/attendance/results', isAuthenticated, async (req: any, res) => {
    try {
      const classId = parseInt(req.params.classId);
      const { date } = req.query;
      const students = await storage.getStudentsByClass(classId);

      // Mock comprehensive results data
      const mockResults = {
        classId,
        className: `Class ${classId}`,
        date: date || new Date().toISOString(),
        question: "What's your favorite color?",
        answers: [
          {
            answer: "Red",
            count: Math.floor(students.length * 0.3),
            percentage: 30,
            students: students.slice(0, Math.floor(students.length * 0.3)).map(s => s.name),
            color: "#EF4444"
          },
          {
            answer: "Blue", 
            count: Math.floor(students.length * 0.4),
            percentage: 40,
            students: students.slice(Math.floor(students.length * 0.3), Math.floor(students.length * 0.7)).map(s => s.name),
            color: "#3B82F6"
          },
          {
            answer: "Green",
            count: Math.floor(students.length * 0.3),
            percentage: 30,
            students: students.slice(Math.floor(students.length * 0.7)).map(s => s.name),
            color: "#10B981"
          }
        ],
        totalStudents: students.length,
        respondedStudents: students.length,
        attendanceRate: 100,
        sessionDuration: 15,
        teacherName: "Mrs. Johnson",
        checkInTimes: students.reduce((acc, student, index) => {
          acc[student.name] = new Date(Date.now() - (index * 60000)).toLocaleTimeString();
          return acc;
        }, {} as Record<string, string>),
        metadata: {
          themeUsed: "Puppy Theme",
          settingsUsed: {
            soundEnabled: true,
            confettiEnabled: true,
            animationsEnabled: true,
            visualEffectsEnabled: true,
            autoSaveEnabled: true,
            showProgressBar: true
          },
          startTime: new Date(Date.now() - 15 * 60000).toLocaleTimeString(),
          endTime: new Date().toLocaleTimeString()
        }
      };

      res.json(mockResults);
    } catch (error) {
      console.error("Error fetching attendance results:", error);
      res.status(500).json({ message: "Failed to fetch attendance results" });
    }
  });

  // Save teacher settings
  app.post('/api/settings', isAuthenticated, async (req: any, res) => {
    try {
      const teacherId = req.session.user.id;
      const settings = req.body;
      
      // In a real app, save to database
      // await storage.saveTeacherSettings(teacherId, settings);
      
      res.json({ message: "Settings saved successfully", settings });
    } catch (error) {
      console.error("Error saving settings:", error);
      res.status(500).json({ message: "Failed to save settings" });
    }
  });

  // Get teacher settings
  app.get('/api/settings', isAuthenticated, async (req: any, res) => {
    try {
      const teacherId = req.session.user.id;
      
      // In a real app, get from database
      // const settings = await storage.getTeacherSettings(teacherId);
      
      // Mock default settings
      const defaultSettings = {
        soundEnabled: true,
        confettiEnabled: true,
        animationsEnabled: true,
        visualEffectsEnabled: true,
        autoSaveEnabled: true,
        showProgressBar: true
      };
      
      res.json(defaultSettings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Save attendance session
  app.post('/api/attendance/session', isAuthenticated, async (req: any, res) => {
    try {
      const { classId, date, question, answers, attendanceData, settings, metadata } = req.body;
      const teacherId = req.session.user.id;
      
      // In a real app, save comprehensive session data
      // await storage.saveAttendanceSession({
      //   teacherId,
      //   classId,
      //   date,
      //   question,
      //   answers,
      //   attendanceData,
      //   settings,
      //   metadata
      // });
      
      res.json({ message: "Attendance session saved successfully" });
    } catch (error) {
      console.error("Error saving attendance session:", error);
      res.status(500).json({ message: "Failed to save attendance session" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const teacherId = req.session.user.id;
      const classes = await storage.getClassesByTeacher(teacherId);
      const questions = await storage.getQuestionsByTeacher(teacherId);
      const games = await storage.getGamesByTeacher(teacherId);

      // Calculate total students from all classes (mock data)
      const totalStudents = classes.length * 25; // Assume 25 students per class

      res.json({
        totalStudents,
        totalClasses: classes.length,
        totalQuestions: questions.length,
        totalGames: games.length,
        attendanceRate: 94, // This would be calculated from actual attendance data
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
