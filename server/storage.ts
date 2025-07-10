import {
  users,
  classes,
  students,
  questions,
  attendanceRecords,
  games,
  gameSessions,
  aiConversations,
  questionUsage,
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
  type QuestionUsage,
  type InsertQuestionUsage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, gte, inArray } from "drizzle-orm";

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

  // Question usage tracking
  recordQuestionUsage(usageData: InsertQuestionUsage): Promise<QuestionUsage>;
  getQuestionUsageByClass(classId: number, daysBack?: number): Promise<QuestionUsage[]>;
  getRecentlyUsedQuestions(classId: number, daysBack?: number): Promise<number[]>;
}

export class DatabaseStorage implements IStorage {
  // In-memory storage for development (persists during server session)
  private static classes: Class[] = [
    {
      id: 1,
      name: "Math 101",
      teacherId: "1",
      grade: "3rd Grade",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      name: "Science Explorers",
      teacherId: "1",
      grade: "4th Grade",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  private static students: Student[] = [
    { id: 1, name: "Alice Johnson", classId: 1, createdAt: new Date(), avatarUrl: null },
    { id: 2, name: "Bob Smith", classId: 1, createdAt: new Date(), avatarUrl: null },
    { id: 3, name: "Charlie Brown", classId: 1, createdAt: new Date(), avatarUrl: null },
    { id: 4, name: "Diana Prince", classId: 1, createdAt: new Date(), avatarUrl: null },
    { id: 5, name: "Ethan Hunt", classId: 1, createdAt: new Date(), avatarUrl: null },
    { id: 6, name: "Fiona Gallagher", classId: 1, createdAt: new Date(), avatarUrl: null },
    { id: 7, name: "George Washington", classId: 1, createdAt: new Date(), avatarUrl: null },
    { id: 8, name: "Hannah Montana", classId: 1, createdAt: new Date(), avatarUrl: null },
    { id: 9, name: "Isabella Rodriguez", classId: 1, createdAt: new Date(), avatarUrl: null },
    { id: 10, name: "Jack Thompson", classId: 1, createdAt: new Date(), avatarUrl: null },
    { id: 11, name: "Katie Wilson", classId: 1, createdAt: new Date(), avatarUrl: null },
    { id: 12, name: "Liam Davis", classId: 1, createdAt: new Date(), avatarUrl: null }
  ];

  private static nextClassId = 3;
  private static nextStudentId = 13;

  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    // Return demo user for development
    return {
      id: "1",
      email: "teacher@example.com",
      firstName: "Demo",
      lastName: "Teacher",
      profileImageUrl: "",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    return {
      id: userData.id || "1",
      email: userData.email || "teacher@example.com",
      firstName: userData.firstName || "Demo",
      lastName: userData.lastName || "Teacher",
      profileImageUrl: userData.profileImageUrl || "",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Class operations
  async getClassesByTeacher(teacherId: string): Promise<Class[]> {
    try {
      // Try real database first
      if (process.env.DATABASE_URL) {
        const dbClasses = await db
          .select()
          .from(classes)
          .where(eq(classes.teacherId, teacherId));
        return dbClasses.sort((a: Class, b: Class) => {
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return dateB - dateA;
        });
      }
    } catch (error) {
      console.error("Database error, falling back to mock data:", error);
    }
    
    // Fallback to mock data
    const memoryClasses = DatabaseStorage.classes.filter(c => c.teacherId === teacherId);
    return memoryClasses;
  }

  async getClass(id: number): Promise<Class | undefined> {
    const found = DatabaseStorage.classes.find(c => c.id === id);
    console.log("Get class by id:", id, found);
    return found;
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const newClass = {
      id: DatabaseStorage.nextClassId++,
      name: classData.name,
      teacherId: classData.teacherId,
      grade: classData.grade || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    DatabaseStorage.classes.push(newClass);
    console.log("Created class in memory:", newClass);
    return newClass;
  }

  async updateClass(id: number, classData: Partial<InsertClass>): Promise<Class> {
    const classIndex = DatabaseStorage.classes.findIndex(c => c.id === id);
    if (classIndex !== -1) {
      DatabaseStorage.classes[classIndex] = {
        ...DatabaseStorage.classes[classIndex],
        ...classData,
        updatedAt: new Date()
      };
      console.log("Updated class in memory:", DatabaseStorage.classes[classIndex]);
      return DatabaseStorage.classes[classIndex];
    }
    throw new Error("Class not found");
  }

  async deleteClass(id: number): Promise<void> {
    const classIndex = DatabaseStorage.classes.findIndex(c => c.id === id);
    if (classIndex !== -1) {
      const deleted = DatabaseStorage.classes[classIndex];
      DatabaseStorage.classes.splice(classIndex, 1);
      // Also delete all students in this class
      DatabaseStorage.students = DatabaseStorage.students.filter(s => s.classId !== id);
      console.log("Deleted class in memory:", deleted);
    }
  }

  // Student operations
  async getStudentsByClass(classId: number): Promise<Student[]> {
    try {
      // Try real database first
      if (process.env.DATABASE_URL) {
        const dbStudents = await db
          .select()
          .from(students)
          .where(eq(students.classId, classId));
        return dbStudents.sort((a: Student, b: Student) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB; // Oldest first
        });
      }
    } catch (error) {
      console.error("Database error, falling back to mock data:", error);
    }
    
    // Fallback to mock data
    const classStudents = DatabaseStorage.students.filter(s => s.classId === classId);
    return classStudents;
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const found = DatabaseStorage.students.find(s => s.id === id);
    console.log("Get student by id:", id, found);
    return found;
  }

  async createStudent(studentData: InsertStudent): Promise<Student> {
    const newStudent = {
      id: DatabaseStorage.nextStudentId++,
      name: studentData.name,
      classId: studentData.classId,
      avatarUrl: studentData.avatarUrl || null,
      createdAt: new Date()
    };
    DatabaseStorage.students.push(newStudent);
    console.log("Created student in memory:", newStudent);
    return newStudent;
  }

  async updateStudent(id: number, studentData: Partial<InsertStudent>): Promise<Student> {
    const studentIndex = DatabaseStorage.students.findIndex(s => s.id === id);
    if (studentIndex !== -1) {
      DatabaseStorage.students[studentIndex] = {
        ...DatabaseStorage.students[studentIndex],
        ...studentData
      };
      console.log("Updated student in memory:", DatabaseStorage.students[studentIndex]);
      return DatabaseStorage.students[studentIndex];
    }
    throw new Error("Student not found");
  }

  async deleteStudent(id: number): Promise<void> {
    const studentIndex = DatabaseStorage.students.findIndex(s => s.id === id);
    if (studentIndex !== -1) {
      const deleted = DatabaseStorage.students[studentIndex];
      DatabaseStorage.students.splice(studentIndex, 1);
      console.log("Deleted student in memory:", deleted);
    }
  }

  // Question operations
  async getQuestionsByTeacher(teacherId: string): Promise<Question[]> {
    try {
      const questionList = await db
        .select()
        .from(questions)
        .where(eq(questions.teacherId, teacherId));

      // Sort in JavaScript since mock database doesn't support orderBy
      return questionList.sort((a: Question, b: Question) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    } catch (error) {
      console.error("Error fetching questions by teacher:", error);
      // Return empty array for mock database
      return [];
    }
  }

  async getQuestionsByType(teacherId: string, type: string): Promise<Question[]> {
    try {
      const questionList = await db
        .select()
        .from(questions)
        .where(and(eq(questions.teacherId, teacherId), eq(questions.type, type)));

      // Sort in JavaScript since mock database doesn't support orderBy
      return questionList.sort((a: Question, b: Question) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    } catch (error) {
      console.error("Error fetching questions by type:", error);
      // Return empty array for mock database
      return [];
    }
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
    try {
      const records = await db
        .select()
        .from(attendanceRecords)
        .where(eq(attendanceRecords.studentId, studentId));

      // Sort in JavaScript since mock database doesn't support orderBy
      return records.sort((a: AttendanceRecord, b: AttendanceRecord) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });
    } catch (error) {
      console.error("Error fetching attendance by student:", error);
      // Return empty array for mock database
      return [];
    }
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
    try {
      return await db.select().from(games).where({ teacherId });
    } catch (error) {
      console.error("Error fetching games:", error);
      // Return demo games for development
      return [
        {
          id: 1,
          title: "Math Quiz",
          description: "Fun math questions for 3rd graders",
          template: "multiple_choice",
          theme: "space",
          content: { questions: [] },
          teacherId: "1",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
    }
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
    try {
      const sessions = await db
        .select()
        .from(gameSessions)
        .where(eq(gameSessions.classId, classId));

      // Sort in JavaScript since mock database doesn't support orderBy
      return sessions.sort((a: GameSession, b: GameSession) => {
        const dateA = a.startedAt ? new Date(a.startedAt).getTime() : 0;
        const dateB = b.startedAt ? new Date(b.startedAt).getTime() : 0;
        return dateB - dateA;
      });
    } catch (error) {
      console.error("Error fetching game sessions by class:", error);
      // Return empty array for mock database
      return [];
    }
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
    try {
      const conversations = await db
        .select()
        .from(aiConversations)
        .where(eq(aiConversations.teacherId, teacherId));

      // Sort in JavaScript since mock database doesn't support orderBy
      return conversations.sort((a: AiConversation, b: AiConversation) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
      });
    } catch (error) {
      console.error("Error fetching conversations by teacher:", error);
      // Return empty array for mock database
      return [];
    }
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

  // Question usage tracking
  async recordQuestionUsage(usageData: InsertQuestionUsage): Promise<QuestionUsage> {
    const [usage] = await db.insert(questionUsage).values(usageData).returning();
    return usage;
  }

  async getQuestionUsageByClass(classId: number, daysBack?: number): Promise<QuestionUsage[]> {
    const date = daysBack ? new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000) : new Date(0);
    
    try {
      const usage = await db
        .select()
        .from(questionUsage)
        .where(and(eq(questionUsage.classId, classId), gte(questionUsage.usedAt, date)));

      // Sort in JavaScript since mock database doesn't support orderBy
      return usage.sort((a: QuestionUsage, b: QuestionUsage) => {
        const dateA = a.usedAt ? new Date(a.usedAt).getTime() : 0;
        const dateB = b.usedAt ? new Date(b.usedAt).getTime() : 0;
        return dateB - dateA;
      });
    } catch (error) {
      console.error("Error fetching question usage by class:", error);
      // Return empty array for mock database
      return [];
    }
  }

  async getRecentlyUsedQuestions(classId: number, daysBack?: number): Promise<number[]> {
    const date = daysBack ? new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000) : new Date(0);
    
    try {
      const usage = await db
        .select()
        .from(questionUsage)
        .where(and(eq(questionUsage.classId, classId), gte(questionUsage.usedAt, date)));

      // Sort in JavaScript since mock database doesn't support orderBy
      return usage
        .sort((a: QuestionUsage, b: QuestionUsage) => {
          const dateA = a.usedAt ? new Date(a.usedAt).getTime() : 0;
          const dateB = b.usedAt ? new Date(b.usedAt).getTime() : 0;
          return dateB - dateA;
        })
        .map((u: QuestionUsage) => u.questionId);
    } catch (error) {
      console.error("Error fetching recently used questions:", error);
      // Return empty array for mock database
      return [];
    }
  }

  // Batch operations for better performance
  async batchGetStudentsByClasses(classIds: number[]): Promise<Record<number, Student[]>> {
    try {
      if (process.env.DATABASE_URL) {
        const allStudents = await db
          .select()
          .from(students)
          .where(inArray(students.classId, classIds));
        
        // Group students by classId
        const groupedStudents: Record<number, Student[]> = {};
        allStudents.forEach((student: Student) => {
          if (!groupedStudents[student.classId]) {
            groupedStudents[student.classId] = [];
          }
          groupedStudents[student.classId].push(student);
        });
        
        return groupedStudents;
      }
    } catch (error) {
      console.error("Database error in batch operation, falling back to individual queries:", error);
    }
    
    // Fallback to individual queries
    const result: Record<number, Student[]> = {};
    for (const classId of classIds) {
      result[classId] = await this.getStudentsByClass(classId);
    }
    return result;
  }

  async batchGetAttendanceByClassesAndDate(classIds: number[], date: Date): Promise<Record<number, AttendanceRecord[]>> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      if (process.env.DATABASE_URL) {
        const allRecords = await db
          .select()
          .from(attendanceRecords)
          .where(
            and(
              inArray(attendanceRecords.classId, classIds),
              eq(attendanceRecords.date, startOfDay)
            )
          );
        
        // Group records by classId
        const groupedRecords: Record<number, AttendanceRecord[]> = {};
        allRecords.forEach((record: AttendanceRecord) => {
          if (!groupedRecords[record.classId]) {
            groupedRecords[record.classId] = [];
          }
          groupedRecords[record.classId].push(record);
        });
        
        return groupedRecords;
      }
    } catch (error) {
      console.error("Database error in batch attendance operation:", error);
    }
    
    // Fallback to individual queries
    const result: Record<number, AttendanceRecord[]> = {};
    for (const classId of classIds) {
      result[classId] = await this.getAttendanceByClassAndDate(classId, date);
    }
    return result;
  }
}

export const storage = new DatabaseStorage();
