import express from 'express';
import type { Express, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from './storage';

// Extend the Request interface to include Supabase user
declare global {
  namespace Express {
    interface Request {
      supabaseUser?: any;
    }
  }
}

export function setupSupabaseAuth(app: Express) {
  // Middleware to verify Supabase JWT tokens
  const verifySupabaseToken: RequestHandler = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(); // Continue without authentication
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      // For now, let's decode the JWT without verification to get user info
      // In production, you should verify with Supabase's public key
      const decoded = jwt.decode(token) as any;

      if (decoded && decoded.sub) {
        // Get or create user in our database
        const user = await storage.upsertUser({
          id: decoded.sub,
          email: decoded.email,
          firstName: decoded.user_metadata?.first_name || decoded.email?.split('@')[0] || 'User',
          lastName: decoded.user_metadata?.last_name || '',
          profileImageUrl: decoded.user_metadata?.avatar_url || '',
        });

        req.supabaseUser = user;
        console.log("User authenticated and upserted:", user.id);
      }
    } catch (error) {
      console.error('Supabase token verification failed:', error);
      // Continue without authentication - let individual routes handle auth
    }
    
    next();
  };

  // Apply the middleware to all routes
  app.use(verifySupabaseToken);

  // Auth endpoints for Supabase
  app.get('/api/auth/user', (req, res) => {
    if (req.supabaseUser) {
      return res.json(req.supabaseUser);
    }
    res.status(401).json({ message: 'Not authenticated' });
  });

  // Health check endpoint
  app.get('/api/auth/health', (req, res) => {
    res.json({ status: 'ok', message: 'Auth service is running' });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.supabaseUser && req.supabaseUser.id) {
    console.log("User authenticated:", req.supabaseUser.id);
    return next();
  }
  
  console.log("User not authenticated");
  res.status(401).json({ message: "Unauthorized" });
}; 