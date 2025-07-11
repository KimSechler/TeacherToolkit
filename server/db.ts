import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Database connection
let db: any;

if (process.env.DATABASE_URL) {
  // Use real database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  db = drizzle(pool, { schema });
  console.log("✅ Connected to Supabase database");
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
let mockGames = [
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

let mockGameSessions: any[] = [];

let mockQuestionUsage = [
  {
    id: 1,
    questionId: 1,
    classId: 1,
    usedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    teacherId: "1"
  }
];

let mockAiConversations: any[] = [];

// Create a more sophisticated mock database
const createMockDb = () => {
  let nextId = {
    users: 2,
    classes: 3,
    students: 9,
    questions: 2,
    attendance: 1,
    games: 1,
    gameSessions: 1,
    aiConversations: 1,
    questionUsage: 2
  };

  return {
    select: () => ({
      from: (table: any) => ({
        where: (condition: any) => {
          // Handle different table queries
          let results: any[] = [];
          
          if (table === 'classes') {
            if (condition && condition.teacherId) {
              results = mockClasses.filter(c => c.teacherId === condition.teacherId);
            } else {
              results = mockClasses;
            }
          } else if (table === 'students') {
            if (condition && condition.classId) {
              results = mockStudents.filter(s => s.classId === condition.classId);
            } else {
              results = mockStudents;
            }
          } else if (table === 'questions') {
            if (condition && condition.teacherId) {
              results = mockQuestions.filter(q => q.teacherId === condition.teacherId);
            } else {
              results = mockQuestions;
            }
          } else if (table === 'attendanceRecords') {
            results = mockAttendanceRecords;
          } else if (table === 'games') {
            if (condition && condition.teacherId) {
              results = mockGames.filter(g => g.teacherId === condition.teacherId);
            } else {
              results = mockGames;
            }
          } else if (table === 'gameSessions') {
            if (condition && condition.classId) {
              results = mockGameSessions.filter(s => s.classId === condition.classId);
            } else {
              results = mockGameSessions;
            }
          } else if (table === 'aiConversations') {
            if (condition && condition.teacherId) {
              results = mockAiConversations.filter(c => c.teacherId === condition.teacherId);
            } else {
              results = mockAiConversations;
            }
          } else if (table === 'questionUsage') {
            if (condition && condition.classId) {
              results = mockQuestionUsage.filter(u => u.classId === condition.classId);
            } else {
              results = mockQuestionUsage;
            }
          }
          
          return {
            orderBy: (order: any) => {
              // Handle orderBy for different tables
              if (order === 'asc') {
                return Promise.resolve([...results].sort((a, b) => a.name?.localeCompare(b.name) || 0));
              } else if (order === 'desc') {
                return Promise.resolve([...results].sort((a, b) => {
                  const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                  const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                  return dateB - dateA;
                }));
              }
              return Promise.resolve(results);
            },
            // Return results directly if no orderBy is called
            then: (resolve: any) => resolve(results),
            // Make it awaitable
            [Symbol.toStringTag]: 'Promise'
          };
        },
        orderBy: (order: any) => {
          // Handle orderBy for different tables
          if (order === 'asc') {
            return Promise.resolve([...mockClasses].sort((a, b) => a.name.localeCompare(b.name)));
          } else if (order === 'desc') {
            return Promise.resolve([...mockQuestions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
          }
          return Promise.resolve([]);
        }
      })
    }),
    insert: (table: any) => ({
      values: (data: any) => ({
        returning: () => {
          if (table === 'classes') {
            const newClass = {
              id: nextId.classes++,
              ...data,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            mockClasses.push(newClass);
            return Promise.resolve([newClass]);
          } else if (table === 'students') {
            const newStudent = {
              id: nextId.students++,
              ...data,
              createdAt: new Date()
            };
            mockStudents.push(newStudent);
            return Promise.resolve([newStudent]);
          } else if (table === 'questions') {
            const newQuestion = {
              id: nextId.questions++,
              ...data,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            mockQuestions.push(newQuestion);
            return Promise.resolve([newQuestion]);
          } else if (table === 'attendanceRecords') {
            const newRecord = {
              id: nextId.attendance++,
              ...data,
              createdAt: new Date()
            };
            mockAttendanceRecords.push(newRecord);
            return Promise.resolve([newRecord]);
          } else if (table === 'games') {
            const newGame = {
              id: nextId.games++,
              ...data,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            mockGames.push(newGame);
            return Promise.resolve([newGame]);
          } else if (table === 'aiConversations') {
            const newConversation = {
              id: nextId.aiConversations++,
              ...data,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            mockAiConversations.push(newConversation);
            return Promise.resolve([newConversation]);
          } else if (table === 'questionUsage') {
            const newUsage = {
              id: nextId.questionUsage++,
              ...data,
              usedAt: data.usedAt || new Date()
            };
            mockQuestionUsage.push(newUsage);
            return Promise.resolve([newUsage]);
          }
          return Promise.resolve([]);
        }
      })
    }),
    update: (table: any) => ({
      set: (data: any) => ({
        where: (condition: any) => ({
          returning: () => {
            if (table === 'classes') {
              const index = mockClasses.findIndex(c => c.id === condition);
              if (index !== -1) {
                mockClasses[index] = { ...mockClasses[index], ...data, updatedAt: new Date() };
                return Promise.resolve([mockClasses[index]]);
              }
            } else if (table === 'students') {
              const index = mockStudents.findIndex(s => s.id === condition);
              if (index !== -1) {
                mockStudents[index] = { ...mockStudents[index], ...data };
                return Promise.resolve([mockStudents[index]]);
              }
            } else if (table === 'questions') {
              const index = mockQuestions.findIndex(q => q.id === condition);
              if (index !== -1) {
                mockQuestions[index] = { ...mockQuestions[index], ...data, updatedAt: new Date() };
                return Promise.resolve([mockQuestions[index]]);
              }
            } else if (table === 'games') {
              const index = mockGames.findIndex(g => g.id === condition);
              if (index !== -1) {
                mockGames[index] = { ...mockGames[index], ...data, updatedAt: new Date() };
                return Promise.resolve([mockGames[index]]);
              }
            }
            return Promise.resolve([]);
          }
        })
      })
    }),
    delete: (table: any) => ({
      where: (condition: any) => ({
        returning: () => {
          if (table === 'classes') {
            const index = mockClasses.findIndex(c => c.id === condition);
            if (index !== -1) {
              const deleted = mockClasses.splice(index, 1)[0];
              return Promise.resolve([deleted]);
            }
          } else if (table === 'students') {
            const index = mockStudents.findIndex(s => s.id === condition);
            if (index !== -1) {
              const deleted = mockStudents.splice(index, 1)[0];
              return Promise.resolve([deleted]);
            }
          } else if (table === 'questions') {
            const index = mockQuestions.findIndex(q => q.id === condition);
            if (index !== -1) {
              const deleted = mockQuestions.splice(index, 1)[0];
              return Promise.resolve([deleted]);
            }
          } else if (table === 'games') {
            const index = mockGames.findIndex(g => g.id === condition);
            if (index !== -1) {
              const deleted = mockGames.splice(index, 1)[0];
              return Promise.resolve([deleted]);
            }
          }
          return Promise.resolve([]);
        }
      })
    })
  };
};

// Export the database instance
if (process.env.DATABASE_URL) {
  // Use real database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  db = drizzle(pool, { schema });
  console.log("✅ Connected to Supabase database");
} else {
  // Use mock database
  db = createMockDb();
  console.warn("⚠️  DATABASE_URL not set. Using mock database for development.");
  console.warn("   Set up a real database for full functionality.");
}

export { db };