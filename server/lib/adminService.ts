import { storage } from "../storage";
import { UsageTracker } from "./usageTracker";
import { PlanService } from "./planConfig";
import { db } from "../db";
import { users, classes, students, questions, games, usageLogs } from "@shared/schema";
import { eq, count, desc, gte } from "drizzle-orm";

export interface AdminUserStats {
  totalUsers: number;
  activeUsers: number;
  freeUsers: number;
  paidUsers: number;
  totalRevenue: number;
  averageUsage: {
    classes: number;
    students: number;
    questions: number;
    games: number;
  };
}

export interface UserDetails {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  planId: string;
  planStatus: string;
  monthlyUsage: any;
  createdAt: Date;
  lastActive: Date;
  totalClasses: number;
  totalStudents: number;
  totalQuestions: number;
  totalGames: number;
}

export class AdminService {
  /**
   * Check if a user is an admin
   */
  static async isAdmin(userId: string): Promise<boolean> {
    try {
      // Use the new RBAC system
      const { RBACService } = await import('./rbacService');
      return await RBACService.hasAdminRole(userId);
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Get system-wide statistics
   */
  static async getSystemStats(): Promise<AdminUserStats> {
    try {
      // Get total users
      const [totalUsersResult] = await db
        .select({ count: count() })
        .from(users);

      // Get active users (users with planStatus 'active')
      const [activeUsersResult] = await db
        .select({ count: count() })
        .from(users)
        .where(eq(users.planStatus, 'active'));

      // Get free users
      const [freeUsersResult] = await db
        .select({ count: count() })
        .from(users)
        .where(eq(users.planId, 'free'));

      // Get paid users
      const [paidUsersResult] = await db
        .select({ count: count() })
        .from(users)
        .where(eq(users.planId, 'basic'));

      // Calculate average usage
      const allUsers = await db.select().from(users);
      let totalClasses = 0, totalStudents = 0, totalQuestions = 0, totalGames = 0;

      for (const user of allUsers) {
        const usage = await UsageTracker.calculateActualUsage(user.id);
        totalClasses += usage.classes;
        totalStudents += usage.students;
        totalQuestions += usage.questions;
        totalGames += usage.games;
      }

      const activeUserCount = activeUsersResult.count || 0;
      const averageUsage = {
        classes: activeUserCount > 0 ? Math.round(totalClasses / activeUserCount) : 0,
        students: activeUserCount > 0 ? Math.round(totalStudents / activeUserCount) : 0,
        questions: activeUserCount > 0 ? Math.round(totalQuestions / activeUserCount) : 0,
        games: activeUserCount > 0 ? Math.round(totalGames / activeUserCount) : 0,
      };

      return {
        totalUsers: totalUsersResult.count || 0,
        activeUsers: activeUserCount,
        freeUsers: freeUsersResult.count || 0,
        paidUsers: paidUsersResult.count || 0,
        totalRevenue: 0, // Will be calculated when Stripe is integrated
        averageUsage
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      throw error;
    }
  }

  /**
   * Get all users with detailed information
   */
  static async getAllUsers(): Promise<UserDetails[]> {
    try {
      const allUsers = await db.select().from(users);
      const userDetails: UserDetails[] = [];

      for (const user of allUsers) {
        const usage = await UsageTracker.calculateActualUsage(user.id);
        const currentUsage = await UsageTracker.getUserUsage(user.id);

        userDetails.push({
          id: user.id,
          email: user.email || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          planId: user.planId || 'free',
          planStatus: user.planStatus || 'active',
          monthlyUsage: currentUsage,
          createdAt: user.createdAt || new Date(),
          lastActive: user.updatedAt || new Date(),
          totalClasses: usage.classes,
          totalStudents: usage.students,
          totalQuestions: usage.questions,
          totalGames: usage.games,
        });
      }

      return userDetails.sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime());
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  /**
   * Update user's plan (admin function)
   */
  static async updateUserPlan(userId: string, planId: string, planStatus: string = 'active'): Promise<void> {
    try {
      // Validate plan ID
      PlanService.getPlanLimits(planId);

      await storage.updateUser(userId, {
        planId,
        planStatus,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating user plan:', error);
      throw error;
    }
  }

  /**
   * Reset user's usage (admin function)
   */
  static async resetUserUsage(userId: string): Promise<void> {
    try {
      await UsageTracker.resetMonthlyUsage(userId);
    } catch (error) {
      console.error('Error resetting user usage:', error);
      throw error;
    }
  }

  /**
   * Get user activity logs
   */
  static async getUserActivityLogs(userId: string, days: number = 30): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const logs = await db
        .select()
        .from(usageLogs)
        .where(eq(usageLogs.userId, userId))
        .orderBy(desc(usageLogs.timestamp));

      return logs;
    } catch (error) {
      console.error('Error getting user activity logs:', error);
      throw error;
    }
  }

  /**
   * Get system-wide activity logs
   */
  static async getSystemActivityLogs(days: number = 7): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const logs = await db
        .select()
        .from(usageLogs)
        .where(gte(usageLogs.timestamp, startDate))
        .orderBy(desc(usageLogs.timestamp));

      return logs;
    } catch (error) {
      console.error('Error getting system activity logs:', error);
      throw error;
    }
  }

  /**
   * Delete user and all their data (admin function)
   */
  static async deleteUser(userId: string): Promise<void> {
    try {
      // This is a destructive operation - in production, you might want to soft delete
      // For now, we'll just mark the user as inactive
      await storage.updateUser(userId, {
        planStatus: 'deleted',
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
} 