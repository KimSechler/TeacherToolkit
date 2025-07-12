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
import { eq, and, desc, asc, gte, lte, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User>;

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
  getAttendanceRecords(classId: number, date: string): Promise<AttendanceRecord[]>;
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
  getGameSession(id: string): Promise<GameSession | undefined>;
  createGameSession(sessionData: InsertGameSession): Promise<GameSession>;
  updateGameSession(id: string, sessionData: Partial<InsertGameSession>): Promise<GameSession>;
  deleteGameSession(id: string): Promise<void>;

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

  // Test database connection
  async testDatabaseConnection(): Promise<boolean> {
    try {
      if (process.env.DATABASE_URL && db) {
        // Try a simple query to test the connection
        await db.select().from(classes).limit(1);
        console.log("✅ Database connection test successful");
        return true;
      }
      console.log("⚠️  No database URL configured, using mock data");
      return false;
    } catch (error) {
      console.error("❌ Database connection test failed:", error);
      return false;
    }
  }

  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    try {
      // Try real database first
      if (process.env.DATABASE_URL && db) {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, id));
        return user;
      }
    } catch (error) {
      console.error("Database error in getUser:", error);
    }
    
    // Fallback to mock data
    return {
      id: "1",
      email: "teacher@example.com",
      firstName: "Demo",
      lastName: "Teacher",
      profileImageUrl: "",
      planId: "free",
      planStatus: "active",
      subscriptionId: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      monthlyUsage: { questions: 0, games: 0, classes: 0, students: 0, storage: 0 },
      usageResetDate: null,
      dataRetentionConsent: false,
      marketingConsent: false,
      lastPrivacyUpdate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      // Try real database first
      if (process.env.DATABASE_URL && db) {
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, userData.id));

        if (existingUser) {
          const [updatedUser] = await db
            .update(users)
            .set({
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              profileImageUrl: userData.profileImageUrl,
              updatedAt: new Date()
            })
            .where(eq(users.id, userData.id))
            .returning();
          console.log("User updated in database:", updatedUser);
          return updatedUser;
        } else {
          const [newUser] = await db
            .insert(users)
            .values(userData)
            .returning();
          console.log("User created in database:", newUser);
          return newUser;
        }
      }
    } catch (error) {
      console.error("Database error in upsertUser:", error);
    }
    
    // Fallback to mock data
    return {
      id: userData.id || "1",
      email: userData.email || "teacher@example.com",
      firstName: userData.firstName || "Demo",
      lastName: userData.lastName || "Teacher",
      profileImageUrl: userData.profileImageUrl || "",
      planId: "free",
      planStatus: "active",
      subscriptionId: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      monthlyUsage: { questions: 0, games: 0, classes: 0, students: 0, storage: 0 },
      usageResetDate: null,
      dataRetentionConsent: false,
      marketingConsent: false,
      lastPrivacyUpdate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    try {
      // Try real database first
      if (process.env.DATABASE_URL && db) {
        const [updatedUser] = await db
          .update(users)
          .set({ ...userData, updatedAt: new Date() })
          .where(eq(users.id, id))
          .returning();
        console.log("User updated in database:", updatedUser);
        return updatedUser;
      }
    } catch (error) {
      console.error("Database error in updateUser:", error);
    }
    
    // Fallback to mock data - return a mock user with updated data
    const mockUser: User = {
      id: id,
      email: userData.email || "teacher@example.com",
      firstName: userData.firstName || "Demo",
      lastName: userData.lastName || "Teacher",
      profileImageUrl: userData.profileImageUrl || "",
      planId: userData.planId || "free",
      planStatus: userData.planStatus || "active",
      subscriptionId: userData.subscriptionId || null,
      currentPeriodStart: userData.currentPeriodStart || null,
      currentPeriodEnd: userData.currentPeriodEnd || null,
      monthlyUsage: userData.monthlyUsage || { questions: 0, games: 0, classes: 0, students: 0, storage: 0 },
      usageResetDate: userData.usageResetDate || null,
      dataRetentionConsent: userData.dataRetentionConsent || false,
      marketingConsent: userData.marketingConsent || false,
      lastPrivacyUpdate: userData.lastPrivacyUpdate || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log("Updated user in memory:", mockUser);
    return mockUser;
  }

  // Class operations
  async getClassesByTeacher(teacherId: string): Promise<Class[]> {
    try {
      // Try real database first
      if (process.env.DATABASE_URL && db) {
        console.log("Fetching classes for teacher:", teacherId);
        const dbClasses = await db
          .select()
          .from(classes)
          .where(eq(classes.teacherId, teacherId));
        console.log("Found classes in database:", dbClasses.length, dbClasses);
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
    console.log("Using mock data for classes, teacherId:", teacherId);
    const memoryClasses = DatabaseStorage.classes.filter(c => c.teacherId === teacherId);
    console.log("Found classes in memory:", memoryClasses.length, memoryClasses);
    return memoryClasses;
  }

  async getClass(id: number): Promise<Class | undefined> {
    const found = DatabaseStorage.classes.find(c => c.id === id);
    console.log("Get class by id:", id, found);
    return found;
  }

  async createClass(classData: InsertClass): Promise<Class> {
    try {
      // Try real database first
      if (process.env.DATABASE_URL && db) {
        console.log("Creating class in database with data:", classData);
        const [newClass] = await db
          .insert(classes)
          .values(classData)
          .returning();
        console.log("Successfully created class in database:", newClass);
        return newClass;
      }
    } catch (error) {
      console.error("Database error, falling back to mock data:", error);
    }
    
    // Fallback to mock data
    console.log("Creating class in memory with data:", classData);
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
    try {
      // Try real database first
      if (process.env.DATABASE_URL && db) {
        const [updatedClass] = await db
          .update(classes)
          .set({ ...classData, updatedAt: new Date() })
          .where(eq(classes.id, id))
          .returning();
        console.log("Updated class in database:", updatedClass);
        return updatedClass;
      }
    } catch (error) {
      console.error("Database error, falling back to mock data:", error);
    }
    
    // Fallback to mock data
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
    try {
      // Try real database first
      if (process.env.DATABASE_URL && db) {
        // Delete all students in this class first (due to foreign key constraints)
        await db.delete(students).where(eq(students.classId, id));
        // Then delete the class
        await db.delete(classes).where(eq(classes.id, id));
        console.log("Deleted class from database:", id);
        return;
      }
    } catch (error) {
      console.error("Database error, falling back to mock data:", error);
    }
    
    // Fallback to mock data
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
    try {
      // Try real database first
      if (process.env.DATABASE_URL && db) {
        const [newStudent] = await db
          .insert(students)
          .values(studentData)
          .returning();
        console.log("Created student in database:", newStudent);
        return newStudent;
      }
    } catch (error) {
      console.error("Database error, falling back to mock data:", error);
    }
    
    // Fallback to mock data
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
    try {
      // Try real database first
      if (process.env.DATABASE_URL && db) {
        const [updatedStudent] = await db
          .update(students)
          .set(studentData)
          .where(eq(students.id, id))
          .returning();
        console.log("Updated student in database:", updatedStudent);
        return updatedStudent;
      }
    } catch (error) {
      console.error("Database error, falling back to mock data:", error);
    }
    
    // Fallback to mock data
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
    try {
      // Try real database first
      if (process.env.DATABASE_URL && db) {
        await db.delete(students).where(eq(students.id, id));
        console.log("Deleted student from database:", id);
        return;
      }
    } catch (error) {
      console.error("Database error, falling back to mock data:", error);
    }
    
    // Fallback to mock data
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

  async getAttendanceRecords(classId: number, date: string): Promise<AttendanceRecord[]> {
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
          gte(attendanceRecords.date, startOfDay),
          lte(attendanceRecords.date, endOfDay)
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
    try {
      // Try real database first
      if (process.env.DATABASE_URL) {
        const [record] = await db.insert(attendanceRecords).values(recordData).returning();
        return record;
      }
    } catch (error) {
      console.error("Database error, falling back to mock data:", error);
    }
    
    // Fallback to mock data
    const mockRecord: AttendanceRecord = {
      id: Math.floor(Math.random() * 10000) + 1,
      studentId: recordData.studentId,
      classId: recordData.classId,
      date: recordData.date,
      isPresent: recordData.isPresent,
      questionId: recordData.questionId || null,
      answer: recordData.answer || null,
      createdAt: new Date()
    };
    
    console.log("Created attendance record in memory:", mockRecord);
    return mockRecord;
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
      return await db.select().from(games).where(eq(games.teacherId, teacherId));
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
    // Since the new schema doesn't have classId, we'll return empty array for now
    // This method might need to be rethought based on the new schema design
    return [];
  }

  async getGameSession(id: string): Promise<GameSession | undefined> {
    try {
      if (process.env.DATABASE_URL && db) {
        const [session] = await db.select().from(gameSessions).where(eq(gameSessions.id, id));
        return session;
      }
    } catch (error) {
      console.error("Database error in getGameSession:", error);
    }
    
    // Fallback to mock data
    return {
      id: id,
      hostId: "1",
      participants: [],
      state: {},
      started: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async createGameSession(sessionData: InsertGameSession): Promise<GameSession> {
    try {
      if (process.env.DATABASE_URL && db) {
        const [session] = await db.insert(gameSessions).values(sessionData).returning();
        return session;
      }
    } catch (error) {
      console.error("Database error in createGameSession:", error);
    }
    
    // Fallback to mock data
    return {
      id: sessionData.id,
      hostId: sessionData.hostId,
      participants: sessionData.participants || [],
      state: sessionData.state || {},
      started: sessionData.started || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateGameSession(
    id: string,
    sessionData: Partial<InsertGameSession>
  ): Promise<GameSession> {
    try {
      if (process.env.DATABASE_URL && db) {
        const [session] = await db
          .update(gameSessions)
          .set({ ...sessionData, updatedAt: new Date() })
          .where(eq(gameSessions.id, id))
          .returning();
        return session;
      }
    } catch (error) {
      console.error("Database error in updateGameSession:", error);
    }
    
    // Fallback to mock data
    return {
      id: id,
      hostId: sessionData.hostId || "1",
      participants: sessionData.participants || [],
      state: sessionData.state || {},
      started: sessionData.started || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async deleteGameSession(id: string): Promise<void> {
    try {
      if (process.env.DATABASE_URL && db) {
        await db.delete(gameSessions).where(eq(gameSessions.id, id));
      }
    } catch (error) {
      console.error("Database error in deleteGameSession:", error);
    }
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
