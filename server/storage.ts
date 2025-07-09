import {
  users,
  classes,
  students,
  questions,
  attendanceRecords,
  games,
  gameSessions,
  aiConversations,
  type User,
  type UpsertUser,
  type Class,
  type InsertClass,
  type Student,
  type InsertStudent,
  type Question,
  type InsertQuestion,
  type AttendanceRecord,
  type InsertAttendanceRecord,
  type Game,
  type InsertGame,
  type GameSession,
  type InsertGameSession,
  type AiConversation,
  type InsertAiConversation,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Class operations
  getClassesByTeacher(teacherId: string): Promise<Class[]>;
  getClass(id: number): Promise<Class | undefined>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: number, classData: Partial<InsertClass>): Promise<Class>;
  deleteClass(id: number): Promise<void>;

  // Student operations
  getStudentsByClass(classId: number): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  createStudent(studentData: InsertStudent): Promise<Student>;
  updateStudent(id: number, studentData: Partial<InsertStudent>): Promise<Student>;
  deleteStudent(id: number): Promise<void>;

  // Question operations
  getQuestionsByTeacher(teacherId: string): Promise<Question[]>;
  getQuestionsByType(teacherId: string, type: string): Promise<Question[]>;
  getQuestion(id: number): Promise<Question | undefined>;
  createQuestion(questionData: InsertQuestion): Promise<Question>;
  updateQuestion(id: number, questionData: Partial<InsertQuestion>): Promise<Question>;
  deleteQuestion(id: number): Promise<void>;

  // Attendance operations
  getAttendanceByClassAndDate(classId: number, date: Date): Promise<AttendanceRecord[]>;
  getAttendanceByStudent(studentId: number): Promise<AttendanceRecord[]>;
  createAttendanceRecord(recordData: InsertAttendanceRecord): Promise<AttendanceRecord>;
  updateAttendanceRecord(id: number, recordData: Partial<InsertAttendanceRecord>): Promise<AttendanceRecord>;
  getAttendanceStats(classId: number, startDate: Date, endDate: Date): Promise<any>;

  // Game operations
  getGamesByTeacher(teacherId: string): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  createGame(gameData: InsertGame): Promise<Game>;
  updateGame(id: number, gameData: Partial<InsertGame>): Promise<Game>;
  deleteGame(id: number): Promise<void>;

  // Game session operations
  getGameSessionsByClass(classId: number): Promise<GameSession[]>;
  getGameSession(id: number): Promise<GameSession | undefined>;
  createGameSession(sessionData: InsertGameSession): Promise<GameSession>;
  updateGameSession(id: number, sessionData: Partial<InsertGameSession>): Promise<GameSession>;

  // AI conversation operations
  getConversationsByTeacher(teacherId: string): Promise<AiConversation[]>;
  getConversation(id: number): Promise<AiConversation | undefined>;
  createConversation(conversationData: InsertAiConversation): Promise<AiConversation>;
  updateConversation(id: number, conversationData: Partial<InsertAiConversation>): Promise<AiConversation>;
  deleteConversation(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Class operations
  async getClassesByTeacher(teacherId: string): Promise<Class[]> {
    return await db
      .select()
      .from(classes)
      .where(eq(classes.teacherId, teacherId))
      .orderBy(asc(classes.name));
  }

  async getClass(id: number): Promise<Class | undefined> {
    const [classRecord] = await db.select().from(classes).where(eq(classes.id, id));
    return classRecord;
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const [classRecord] = await db.insert(classes).values(classData).returning();
    return classRecord;
  }

  async updateClass(id: number, classData: Partial<InsertClass>): Promise<Class> {
    const [classRecord] = await db
      .update(classes)
      .set({ ...classData, updatedAt: new Date() })
      .where(eq(classes.id, id))
      .returning();
    return classRecord;
  }

  async deleteClass(id: number): Promise<void> {
    await db.delete(classes).where(eq(classes.id, id));
  }

  // Student operations
  async getStudentsByClass(classId: number): Promise<Student[]> {
    return await db
      .select()
      .from(students)
      .where(eq(students.classId, classId))
      .orderBy(asc(students.name));
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async createStudent(studentData: InsertStudent): Promise<Student> {
    const [student] = await db.insert(students).values(studentData).returning();
    return student;
  }

  async updateStudent(id: number, studentData: Partial<InsertStudent>): Promise<Student> {
    const [student] = await db
      .update(students)
      .set(studentData)
      .where(eq(students.id, id))
      .returning();
    return student;
  }

  async deleteStudent(id: number): Promise<void> {
    await db.delete(students).where(eq(students.id, id));
  }

  // Question operations
  async getQuestionsByTeacher(teacherId: string): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(eq(questions.teacherId, teacherId))
      .orderBy(desc(questions.createdAt));
  }

  async getQuestionsByType(teacherId: string, type: string): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(and(eq(questions.teacherId, teacherId), eq(questions.type, type)))
      .orderBy(desc(questions.createdAt));
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question;
  }

  async createQuestion(questionData: InsertQuestion): Promise<Question> {
    const [question] = await db.insert(questions).values(questionData).returning();
    return question;
  }

  async updateQuestion(id: number, questionData: Partial<InsertQuestion>): Promise<Question> {
    const [question] = await db
      .update(questions)
      .set(questionData)
      .where(eq(questions.id, id))
      .returning();
    return question;
  }

  async deleteQuestion(id: number): Promise<void> {
    await db.delete(questions).where(eq(questions.id, id));
  }

  // Attendance operations
  async getAttendanceByClassAndDate(classId: number, date: Date): Promise<AttendanceRecord[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select()
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.classId, classId),
          eq(attendanceRecords.date, startOfDay)
        )
      );
  }

  async getAttendanceByStudent(studentId: number): Promise<AttendanceRecord[]> {
    return await db
      .select()
      .from(attendanceRecords)
      .where(eq(attendanceRecords.studentId, studentId))
      .orderBy(desc(attendanceRecords.date));
  }

  async createAttendanceRecord(recordData: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const [record] = await db.insert(attendanceRecords).values(recordData).returning();
    return record;
  }

  async updateAttendanceRecord(
    id: number,
    recordData: Partial<InsertAttendanceRecord>
  ): Promise<AttendanceRecord> {
    const [record] = await db
      .update(attendanceRecords)
      .set(recordData)
      .where(eq(attendanceRecords.id, id))
      .returning();
    return record;
  }

  async getAttendanceStats(classId: number, startDate: Date, endDate: Date): Promise<any> {
    // This would typically involve complex SQL aggregations
    // For now, return basic stats structure
    return {
      totalDays: 0,
      averageAttendance: 0,
      studentStats: [],
    };
  }

  // Game operations
  async getGamesByTeacher(teacherId: string): Promise<Game[]> {
    return await db
      .select()
      .from(games)
      .where(eq(games.teacherId, teacherId))
      .orderBy(desc(games.createdAt));
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }

  async createGame(gameData: InsertGame): Promise<Game> {
    const [game] = await db.insert(games).values(gameData).returning();
    return game;
  }

  async updateGame(id: number, gameData: Partial<InsertGame>): Promise<Game> {
    const [game] = await db
      .update(games)
      .set({ ...gameData, updatedAt: new Date() })
      .where(eq(games.id, id))
      .returning();
    return game;
  }

  async deleteGame(id: number): Promise<void> {
    await db.delete(games).where(eq(games.id, id));
  }

  // Game session operations
  async getGameSessionsByClass(classId: number): Promise<GameSession[]> {
    return await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.classId, classId))
      .orderBy(desc(gameSessions.startedAt));
  }

  async getGameSession(id: number): Promise<GameSession | undefined> {
    const [session] = await db.select().from(gameSessions).where(eq(gameSessions.id, id));
    return session;
  }

  async createGameSession(sessionData: InsertGameSession): Promise<GameSession> {
    const [session] = await db.insert(gameSessions).values(sessionData).returning();
    return session;
  }

  async updateGameSession(
    id: number,
    sessionData: Partial<InsertGameSession>
  ): Promise<GameSession> {
    const [session] = await db
      .update(gameSessions)
      .set(sessionData)
      .where(eq(gameSessions.id, id))
      .returning();
    return session;
  }

  // AI conversation operations
  async getConversationsByTeacher(teacherId: string): Promise<AiConversation[]> {
    return await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.teacherId, teacherId))
      .orderBy(desc(aiConversations.updatedAt));
  }

  async getConversation(id: number): Promise<AiConversation | undefined> {
    const [conversation] = await db.select().from(aiConversations).where(eq(aiConversations.id, id));
    return conversation;
  }

  async createConversation(conversationData: InsertAiConversation): Promise<AiConversation> {
    const [conversation] = await db.insert(aiConversations).values(conversationData).returning();
    return conversation;
  }

  async updateConversation(
    id: number,
    conversationData: Partial<InsertAiConversation>
  ): Promise<AiConversation> {
    const [conversation] = await db
      .update(aiConversations)
      .set({ ...conversationData, updatedAt: new Date() })
      .where(eq(aiConversations.id, id))
      .returning();
    return conversation;
  }

  async deleteConversation(id: number): Promise<void> {
    await db.delete(aiConversations).where(eq(aiConversations.id, id));
  }
}

export const storage = new DatabaseStorage();
