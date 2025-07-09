import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Classes table
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  grade: varchar("grade"),
  teacherId: varchar("teacher_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Students table
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  classId: integer("class_id").notNull().references(() => classes.id),
  avatarUrl: varchar("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Questions table
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  type: varchar("type").notNull(), // 'qotd', 'quiz', 'game'
  options: jsonb("options").notNull(), // Array of answer options
  correctAnswer: varchar("correct_answer"),
  teacherId: varchar("teacher_id").notNull().references(() => users.id),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Attendance records table
export const attendanceRecords = pgTable("attendance_records", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  classId: integer("class_id").notNull().references(() => classes.id),
  date: timestamp("date").notNull(),
  isPresent: boolean("is_present").notNull(),
  questionId: integer("question_id").references(() => questions.id),
  answer: varchar("answer"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Games table
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  template: varchar("template").notNull(), // 'multiple_choice', 'drag_drop', 'matching'
  theme: varchar("theme").notNull(), // 'halloween', 'space', 'jungle', etc.
  content: jsonb("content").notNull(), // Game-specific content structure
  teacherId: varchar("teacher_id").notNull().references(() => users.id),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Game sessions table
export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id),
  classId: integer("class_id").notNull().references(() => classes.id),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  results: jsonb("results"), // Student responses and scores
});

// AI conversations table
export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  teacherId: varchar("teacher_id").notNull().references(() => users.id),
  title: varchar("title"),
  messages: jsonb("messages").notNull(), // Array of chat messages
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  classes: many(classes),
  questions: many(questions),
  games: many(games),
  aiConversations: many(aiConversations),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  teacher: one(users, { fields: [classes.teacherId], references: [users.id] }),
  students: many(students),
  attendanceRecords: many(attendanceRecords),
  gameSessions: many(gameSessions),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  class: one(classes, { fields: [students.classId], references: [classes.id] }),
  attendanceRecords: many(attendanceRecords),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  teacher: one(users, { fields: [questions.teacherId], references: [users.id] }),
  attendanceRecords: many(attendanceRecords),
}));

export const attendanceRecordsRelations = relations(attendanceRecords, ({ one }) => ({
  student: one(students, { fields: [attendanceRecords.studentId], references: [students.id] }),
  class: one(classes, { fields: [attendanceRecords.classId], references: [classes.id] }),
  question: one(questions, { fields: [attendanceRecords.questionId], references: [questions.id] }),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  teacher: one(users, { fields: [games.teacherId], references: [users.id] }),
  gameSessions: many(gameSessions),
}));

export const gameSessionsRelations = relations(gameSessions, ({ one }) => ({
  game: one(games, { fields: [gameSessions.gameId], references: [games.id] }),
  class: one(classes, { fields: [gameSessions.classId], references: [classes.id] }),
}));

export const aiConversationsRelations = relations(aiConversations, ({ one }) => ({
  teacher: one(users, { fields: [aiConversations.teacherId], references: [users.id] }),
}));

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertClass = typeof classes.$inferInsert;
export type Class = typeof classes.$inferSelect;

export type InsertStudent = typeof students.$inferInsert;
export type Student = typeof students.$inferSelect;

export type InsertQuestion = typeof questions.$inferInsert;
export type Question = typeof questions.$inferSelect;

export type InsertAttendanceRecord = typeof attendanceRecords.$inferInsert;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;

export type InsertGame = typeof games.$inferInsert;
export type Game = typeof games.$inferSelect;

export type InsertGameSession = typeof gameSessions.$inferInsert;
export type GameSession = typeof gameSessions.$inferSelect;

export type InsertAiConversation = typeof aiConversations.$inferInsert;
export type AiConversation = typeof aiConversations.$inferSelect;

// Insert schemas
export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
});

export const insertAttendanceRecordSchema = createInsertSchema(attendanceRecords).omit({
  id: true,
  createdAt: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  id: true,
  startedAt: true,
});

export const insertAiConversationSchema = createInsertSchema(aiConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
