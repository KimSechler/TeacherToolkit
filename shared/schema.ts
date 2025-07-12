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
  
  // Subscription fields (Phase 1)
  planId: varchar("plan_id").default('free'), // 'free', 'basic', 'pro', 'enterprise'
  planStatus: varchar("plan_status").default('active'), // 'active', 'past_due', 'canceled', 'trial'
  subscriptionId: varchar("subscription_id"), // Future: Stripe subscription ID
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  
  // Usage tracking (Phase 1)
  monthlyUsage: jsonb("monthly_usage").default({ 
    questions: 0, 
    games: 0, 
    classes: 0, 
    students: 0,
    storage: 0 
  }),
  usageResetDate: timestamp("usage_reset_date"),
  
  // Compliance (Phase 1)
  dataRetentionConsent: boolean("data_retention_consent").default(false),
  marketingConsent: boolean("marketing_consent").default(false),
  lastPrivacyUpdate: timestamp("last_privacy_update"),
  
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
export const gameSessions = pgTable('game_sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  hostId: varchar('host_id', { length: 255 }).notNull(),
  participants: text('participants').array().notNull().default([]),
  state: jsonb('state').notNull().default({}),
  started: boolean('started').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
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

// Question usage tracking table
export const questionUsage = pgTable("question_usage", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull().references(() => questions.id),
  classId: integer("class_id").notNull().references(() => classes.id),
  usedAt: timestamp("used_at").defaultNow(),
  teacherId: varchar("teacher_id").notNull().references(() => users.id),
});

// Plans table (Phase 1)
export const plans = pgTable("plans", {
  id: varchar("id").primaryKey().notNull(), // 'free', 'basic', 'pro', 'enterprise'
  name: varchar("name").notNull(),
  description: text("description"),
  price: integer("price"), // Price in cents (0 for free)
  billingCycle: varchar("billing_cycle"), // 'monthly', 'yearly'
  
  // Limits
  maxClasses: integer("max_classes"),
  maxStudents: integer("max_students"),
  maxQuestionsPerMonth: integer("max_questions_per_month"),
  maxGamesPerMonth: integer("max_games_per_month"),
  maxStorageMb: integer("max_storage_mb"),
  
  // Features
  features: jsonb("features"), // Array of feature strings
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Usage logs table (Phase 1)
export const usageLogs = pgTable("usage_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: varchar("action").notNull(), // 'create_question', 'create_game', 'create_class', 'add_student'
  resourceType: varchar("resource_type").notNull(), // 'question', 'game', 'class', 'student'
  resourceId: varchar("resource_id"),
  metadata: jsonb("metadata"), // Additional context
  timestamp: timestamp("timestamp").defaultNow(),
});

// RBAC System Tables (Phase 1)
export const roles = pgTable("roles", {
  id: varchar("id").primaryKey().notNull(), // 'user', 'admin', 'super_admin', 'support'
  name: varchar("name").notNull(),
  description: text("description"),
  permissions: jsonb("permissions").notNull(), // Array of permission strings
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: varchar("role_id").notNull().references(() => roles.id, { onDelete: 'cascade' }),
  assignedBy: varchar("assigned_by").references(() => users.id), // Who assigned this role
  assignedAt: timestamp("assigned_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // Optional expiration
  isActive: boolean("is_active").default(true),
});

export const adminInvitations = pgTable("admin_invitations", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull(),
  roleId: varchar("role_id").notNull().references(() => roles.id),
  invitedBy: varchar("invited_by").notNull().references(() => users.id),
  token: varchar("token").notNull().unique(), // Secure invitation token
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  status: varchar("status").default('pending'), // 'pending', 'accepted', 'expired'
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: serial("id").primaryKey(),
  adminId: varchar("admin_id").notNull().references(() => users.id),
  action: varchar("action").notNull(), // 'user_plan_change', 'role_assignment', 'usage_reset', etc.
  targetUserId: varchar("target_user_id").references(() => users.id), // User being acted upon
  resourceType: varchar("resource_type"), // 'user', 'role', 'plan', etc.
  resourceId: varchar("resource_id"),
  oldValue: jsonb("old_value"), // Previous state
  newValue: jsonb("new_value"), // New state
  metadata: jsonb("metadata"), // Additional context
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
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
  host: one(users, { fields: [gameSessions.hostId], references: [users.id] }),
}));

export const aiConversationsRelations = relations(aiConversations, ({ one }) => ({
  teacher: one(users, { fields: [aiConversations.teacherId], references: [users.id] }),
}));

export const questionUsageRelations = relations(questionUsage, ({ one }) => ({
  question: one(questions, { fields: [questionUsage.questionId], references: [questions.id] }),
  class: one(classes, { fields: [questionUsage.classId], references: [classes.id] }),
  teacher: one(users, { fields: [questionUsage.teacherId], references: [users.id] }),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  users: many(users),
}));

export const usageLogsRelations = relations(usageLogs, ({ one }) => ({
  user: one(users, { fields: [usageLogs.userId], references: [users.id] }),
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

export type QuestionUsage = typeof questionUsage.$inferSelect;
export type InsertQuestionUsage = typeof questionUsage.$inferInsert;

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = typeof plans.$inferInsert;

export type UsageLog = typeof usageLogs.$inferSelect;
export type InsertUsageLog = typeof usageLogs.$inferInsert;

// RBAC Types
export type Role = typeof roles.$inferSelect;
export type InsertRole = typeof roles.$inferInsert;

export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = typeof userRoles.$inferInsert;

export type AdminInvitation = typeof adminInvitations.$inferSelect;
export type InsertAdminInvitation = typeof adminInvitations.$inferInsert;

export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;
export type InsertAdminAuditLog = typeof adminAuditLogs.$inferInsert;

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
  createdAt: true,
  updatedAt: true,
});

export const insertAiConversationSchema = createInsertSchema(aiConversations);

export const insertQuestionUsageSchema = createInsertSchema(questionUsage).omit({
  id: true,
  usedAt: true,
});

export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUsageLogSchema = createInsertSchema(usageLogs).omit({
  id: true,
  timestamp: true,
});
