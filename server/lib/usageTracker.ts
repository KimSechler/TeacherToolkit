import { storage } from "../storage";
import { PlanService, type UsageCounts } from "./planConfig";
import { usageLogs, type InsertUsageLog } from "@shared/schema";
import { db } from "../db";
import { eq, and, gte, count } from "drizzle-orm";
import { classes, students, questions, games } from "@shared/schema";

export class UsageTracker {
  /**
   * Track a user action and log it
   */
  static async trackAction(
    userId: string,
    action: 'create_class' | 'add_student' | 'create_question' | 'create_game',
    resourceType: 'class' | 'student' | 'question' | 'game',
    resourceId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      // Log the action
      const logEntry: InsertUsageLog = {
        userId,
        action,
        resourceType,
        resourceId,
        metadata
      };

      await db.insert(usageLogs).values(logEntry);

      // Update user's monthly usage
      await this.updateUserUsage(userId, action);
    } catch (error) {
      console.error('Error tracking usage:', error);
      // Don't throw - usage tracking shouldn't break core functionality
    }
  }

  /**
   * Update user's monthly usage counts
   */
  static async updateUserUsage(userId: string, action: string): Promise<void> {
    try {
      const user = await storage.getUser(userId);
      if (!user) return;

      // Check if we need to reset usage (new month)
      if (PlanService.shouldResetUsage(user.usageResetDate)) {
        await this.resetMonthlyUsage(userId);
        return;
      }

      // Get current usage
      const currentUsage = user.monthlyUsage as UsageCounts || {
        questions: 0,
        games: 0,
        classes: 0,
        students: 0,
        storage: 0
      };

      // Increment appropriate counter
      switch (action) {
        case 'create_class':
          currentUsage.classes++;
          break;
        case 'add_student':
          currentUsage.students++;
          break;
        case 'create_question':
          currentUsage.questions++;
          break;
        case 'create_game':
          currentUsage.games++;
          break;
      }

      // Update user record
      await storage.updateUser(userId, {
        monthlyUsage: currentUsage,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating user usage:', error);
    }
  }

  /**
   * Reset monthly usage for a user
   */
  static async resetMonthlyUsage(userId: string): Promise<void> {
    try {
      const resetUsage = {
        questions: 0,
        games: 0,
        classes: 0,
        students: 0,
        storage: 0
      };

      await storage.updateUser(userId, {
        monthlyUsage: resetUsage,
        usageResetDate: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error resetting monthly usage:', error);
    }
  }

  /**
   * Get current usage for a user
   */
  static async getUserUsage(userId: string): Promise<UsageCounts> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return { questions: 0, games: 0, classes: 0, students: 0, storage: 0 };
      }

      // Check if we need to reset usage
      if (PlanService.shouldResetUsage(user.usageResetDate)) {
        await this.resetMonthlyUsage(userId);
        return { questions: 0, games: 0, classes: 0, students: 0, storage: 0 };
      }

      return user.monthlyUsage as UsageCounts || {
        questions: 0,
        games: 0,
        classes: 0,
        students: 0,
        storage: 0
      };
    } catch (error) {
      console.error('Error getting user usage:', error);
      return { questions: 0, games: 0, classes: 0, students: 0, storage: 0 };
    }
  }

  /**
   * Calculate actual usage from database (for verification)
   */
  static async calculateActualUsage(userId: string): Promise<UsageCounts> {
    try {
      // Count classes
      const [classCount] = await db
        .select({ count: count() })
        .from(classes)
        .where(eq(classes.teacherId, userId));

      // Count students
      const [studentCount] = await db
        .select({ count: count() })
        .from(students)
        .innerJoin(classes, eq(students.classId, classes.id))
        .where(eq(classes.teacherId, userId));

      // Count questions created this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [questionCount] = await db
        .select({ count: count() })
        .from(questions)
        .where(
          and(
            eq(questions.teacherId, userId),
            gte(questions.createdAt, startOfMonth)
          )
        );

      // Count games created this month
      const [gameCount] = await db
        .select({ count: count() })
        .from(games)
        .where(
          and(
            eq(games.teacherId, userId),
            gte(games.createdAt, startOfMonth)
          )
        );

      return {
        classes: classCount.count,
        students: studentCount.count,
        questions: questionCount.count,
        games: gameCount.count,
        storage: 0 // TODO: Calculate actual storage usage
      };
    } catch (error) {
      console.error('Error calculating actual usage:', error);
      return { questions: 0, games: 0, classes: 0, students: 0, storage: 0 };
    }
  }

  /**
   * Check if user can perform an action and enforce limits
   */
  static async checkAndEnforceLimit(
    userId: string,
    action: 'create_class' | 'add_student' | 'create_question' | 'create_game'
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return { allowed: false, reason: 'User not found' };
      }

      // Check plan status
      if (user.planStatus !== 'active' && user.planStatus !== 'trial') {
        return { allowed: false, reason: 'Subscription is not active' };
      }

      const currentUsage = await this.getUserUsage(userId);
      const result = PlanService.canPerformAction(user.planId || 'free', currentUsage, action);

      return result;
    } catch (error) {
      console.error('Error checking limits:', error);
      return { allowed: false, reason: 'Error checking plan limits' };
    }
  }
} 