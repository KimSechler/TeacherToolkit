import { Plan } from "@shared/schema";

export interface PlanLimits {
  maxClasses: number;
  maxStudents: number;
  maxQuestionsPerMonth: number;
  maxGamesPerMonth: number;
  maxStorageMb: number;
  features: string[];
}

export interface UsageCounts {
  questions: number;
  games: number;
  classes: number;
  students: number;
  storage: number;
}

// Plan configurations for Phase 1
export const PLAN_CONFIGS: Record<string, PlanLimits> = {
  free: {
    maxClasses: 3,
    maxStudents: 50,
    maxQuestionsPerMonth: 100,
    maxGamesPerMonth: 5,
    maxStorageMb: 100,
    features: [
      'Basic attendance tracking',
      'Question of the day',
      'Simple game templates',
      'Basic reports'
    ]
  },
  basic: {
    maxClasses: 10,
    maxStudents: 200,
    maxQuestionsPerMonth: 500,
    maxGamesPerMonth: 25,
    maxStorageMb: 1024, // 1GB
    features: [
      'Advanced attendance tracking',
      'Custom questions',
      'Multiple game templates',
      'Advanced reports',
      'Data export'
    ]
  },
  pro: {
    maxClasses: 50,
    maxStudents: 1000,
    maxQuestionsPerMonth: 2000,
    maxGamesPerMonth: 100,
    maxStorageMb: 10240, // 10GB
    features: [
      'Unlimited attendance tracking',
      'AI question generation',
      'Custom game themes',
      'Advanced analytics',
      'Priority support',
      'API access'
    ]
  },
  enterprise: {
    maxClasses: -1, // Unlimited
    maxStudents: -1, // Unlimited
    maxQuestionsPerMonth: -1, // Unlimited
    maxGamesPerMonth: -1, // Unlimited
    maxStorageMb: 102400, // 100GB
    features: [
      'Everything in Pro',
      'White-label options',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantees',
      'Advanced security'
    ]
  }
};

export class PlanService {
  /**
   * Get plan limits for a specific plan ID
   */
  static getPlanLimits(planId: string): PlanLimits {
    const limits = PLAN_CONFIGS[planId];
    if (!limits) {
      throw new Error(`Unknown plan: ${planId}`);
    }
    return limits;
  }

  /**
   * Check if a user can perform an action based on their plan and current usage
   */
  static canPerformAction(
    userPlanId: string,
    currentUsage: UsageCounts,
    action: 'create_class' | 'add_student' | 'create_question' | 'create_game'
  ): { allowed: boolean; reason?: string } {
    const limits = this.getPlanLimits(userPlanId);
    
    switch (action) {
      case 'create_class':
        if (limits.maxClasses === -1) return { allowed: true };
        if (currentUsage.classes >= limits.maxClasses) {
          return { 
            allowed: false, 
            reason: `Plan limit reached: ${limits.maxClasses} classes maximum` 
          };
        }
        break;
        
      case 'add_student':
        if (limits.maxStudents === -1) return { allowed: true };
        if (currentUsage.students >= limits.maxStudents) {
          return { 
            allowed: false, 
            reason: `Plan limit reached: ${limits.maxStudents} students maximum` 
          };
        }
        break;
        
      case 'create_question':
        if (limits.maxQuestionsPerMonth === -1) return { allowed: true };
        if (currentUsage.questions >= limits.maxQuestionsPerMonth) {
          return { 
            allowed: false, 
            reason: `Monthly limit reached: ${limits.maxQuestionsPerMonth} questions maximum` 
          };
        }
        break;
        
      case 'create_game':
        if (limits.maxGamesPerMonth === -1) return { allowed: true };
        if (currentUsage.games >= limits.maxGamesPerMonth) {
          return { 
            allowed: false, 
            reason: `Monthly limit reached: ${limits.maxGamesPerMonth} games maximum` 
          };
        }
        break;
    }
    
    return { allowed: true };
  }

  /**
   * Get upgrade suggestions based on current usage
   */
  static getUpgradeSuggestions(currentUsage: UsageCounts): string[] {
    const suggestions: string[] = [];
    
    if (currentUsage.classes >= 2) {
      suggestions.push('Upgrade to Basic for more classes');
    }
    
    if (currentUsage.students >= 40) {
      suggestions.push('Upgrade to Basic for more students');
    }
    
    if (currentUsage.questions >= 80) {
      suggestions.push('Upgrade to Basic for more questions per month');
    }
    
    if (currentUsage.games >= 4) {
      suggestions.push('Upgrade to Basic for more games per month');
    }
    
    return suggestions;
  }

  /**
   * Check if usage should be reset (new month)
   */
  static shouldResetUsage(lastResetDate: Date | null): boolean {
    if (!lastResetDate) return true;
    
    const now = new Date();
    const lastReset = new Date(lastResetDate);
    
    // Reset if it's a new month
    return now.getMonth() !== lastReset.getMonth() || 
           now.getFullYear() !== lastReset.getFullYear();
  }
} 