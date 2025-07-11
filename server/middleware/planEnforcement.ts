import type { RequestHandler } from "express";
import { UsageTracker } from "../lib/usageTracker";

/**
 * Middleware to check plan limits before allowing actions
 */
export const checkPlanLimit = (action: 'create_class' | 'add_student' | 'create_question' | 'create_game'): RequestHandler => {
  return async (req: any, res, next) => {
    try {
      const userId = req.supabaseUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const result = await UsageTracker.checkAndEnforceLimit(userId, action);
      
      if (!result.allowed) {
        return res.status(403).json({ 
          message: 'Plan limit exceeded',
          reason: result.reason,
          action,
          upgradeRequired: true
        });
      }

      // Add usage tracking to the request for later use
      req.usageAction = action;
      req.usageResourceType = action.replace('create_', '').replace('add_', '');
      
      next();
    } catch (error) {
      console.error('Error checking plan limit:', error);
      // Allow the request to continue if there's an error checking limits
      next();
    }
  };
};

/**
 * Middleware to track usage after successful actions
 */
export const trackUsage: RequestHandler = async (req: any, res, next) => {
  // Store the original send method
  const originalSend = res.send;
  
  // Override the send method to track usage after successful responses
  res.send = function(data: any) {
    // Only track usage for successful responses
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const userId = req.supabaseUser?.id;
      const action = req.usageAction;
      const resourceType = req.usageResourceType;
      
      if (userId && action && resourceType) {
        // Get the created resource ID from the response
        let resourceId: string | undefined;
        try {
          const responseData = typeof data === 'string' ? JSON.parse(data) : data;
          resourceId = responseData?.id?.toString();
        } catch (e) {
          // If we can't parse the response, that's okay
        }
        
        // Track the usage asynchronously (don't wait for it)
        UsageTracker.trackAction(userId, action, resourceType, resourceId).catch(error => {
          console.error('Error tracking usage:', error);
        });
      }
    }
    
    // Call the original send method
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * Middleware to add usage information to responses
 */
export const addUsageInfo: RequestHandler = async (req: any, res, next) => {
  try {
    const userId = req.supabaseUser?.id;
    if (userId) {
      const usage = await UsageTracker.getUserUsage(userId);
      const user = await req.supabaseUser;
      
      // Add usage info to response headers
      res.set('X-Usage-Classes', usage.classes.toString());
      res.set('X-Usage-Students', usage.students.toString());
      res.set('X-Usage-Questions', usage.questions.toString());
      res.set('X-Usage-Games', usage.games.toString());
      res.set('X-Plan-Id', user.planId || 'free');
      res.set('X-Plan-Status', user.planStatus || 'active');
    }
  } catch (error) {
    console.error('Error adding usage info:', error);
  }
  
  next();
}; 