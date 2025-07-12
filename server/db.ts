import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Database connection with serverless optimization
let db: any;

if (process.env.DATABASE_URL) {
  // Use real database with serverless-optimized connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    // Serverless optimizations
    max: 1, // Limit connections for serverless
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: true
  });
  
  db = drizzle(pool, { schema });
  console.log("✅ Connected to Supabase database (serverless optimized)");
} else {
  console.warn("⚠️  DATABASE_URL not set. Using mock database for development.");
  console.warn("   Set up a real database for full functionality.");
}

// Mock data storage
let mockClasses = [
  {
    id: 1,
    name: "Math 101",
    teacherId: "1",
    grade: "3rd",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    name: "Science Lab",
    teacherId: "1", 
    grade: "4th",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

let mockStudents = [
  { id: 1, name: "Alice Johnson", classId: 1, createdAt: new Date(), avatarUrl: null },
  { id: 2, name: "Bob Smith", classId: 1, createdAt: new Date(), avatarUrl: null },
  { id: 3, name: "Charlie Brown", classId: 1, createdAt: new Date(), avatarUrl: null },
  { id: 4, name: "Diana Prince", classId: 1, createdAt: new Date(), avatarUrl: null },
  { id: 5, name: "Ethan Hunt", classId: 1, createdAt: new Date(), avatarUrl: null },
  { id: 6, name: "Fiona Gallagher", classId: 1, createdAt: new Date(), avatarUrl: null },
  { id: 7, name: "George Washington", classId: 1, createdAt: new Date(), avatarUrl: null },
  { id: 8, name: "Hannah Montana", classId: 1, createdAt: new Date(), avatarUrl: null }
];

let mockQuestions = [
  {
    id: 1,
    text: "What is 2 + 2?",
    type: "multiple_choice",
    options: ["3", "4", "5", "6"],
    correctAnswer: "4",
    teacherId: "1",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

let mockAttendanceRecords: any[] = [];

// Mock database functions
function createMockDb() {
  return {
    select: () => ({
      from: (table: any) => {
        if (table === 'classes') {
          return Promise.resolve(mockClasses);
        } else if (table === 'students') {
          return Promise.resolve(mockStudents);
        } else if (table === 'questions') {
          return Promise.resolve(mockQuestions);
        } else if (table === 'attendance_records') {
          return Promise.resolve(mockAttendanceRecords);
        }
        return Promise.resolve([]);
      },
      where: (condition: any) => {
        // Simple mock where clause
        return Promise.resolve([]);
      }
    }),
    insert: (table: any) => ({
      values: (data: any) => ({
        returning: () => {
          if (table === 'classes') {
            const newClass = { ...data, id: mockClasses.length + 1 };
            mockClasses.push(newClass);
            return Promise.resolve([newClass]);
          } else if (table === 'students') {
            const newStudent = { ...data, id: mockStudents.length + 1 };
            mockStudents.push(newStudent);
            return Promise.resolve([newStudent]);
          } else if (table === 'attendance_records') {
            const newRecords = Array.isArray(data) ? data : [data];
            newRecords.forEach((record: any, index: number) => {
              record.id = mockAttendanceRecords.length + index + 1;
              mockAttendanceRecords.push(record);
            });
            return Promise.resolve(newRecords);
          }
          return Promise.resolve([]);
        }
      })
    }),
    update: (table: any) => ({
      set: (data: any) => ({
        where: (condition: any) => ({
          returning: () => Promise.resolve([])
        })
      })
    }),
    delete: (table: any) => ({
      where: (condition: any) => ({
        returning: () => Promise.resolve([])
      })
    }),
    execute: (sql: string) => {
      console.log('Mock SQL execution:', sql);
      return Promise.resolve({ rows: [] });
    }
  };
}

// Export the database instance
if (process.env.DATABASE_URL) {
  // Use real database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    // Serverless optimizations
    max: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: true
  });
  
  db = drizzle(pool, { schema });
  console.log("✅ Connected to Supabase database (serverless optimized)");
} else {
  // Use mock database
  db = createMockDb();
  console.warn("⚠️  DATABASE_URL not set. Using mock database for development.");
  console.warn("   Set up a real database for full functionality.");
}

export { db };