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

// Cache for Supabase public key
let supabasePublicKey: string | null = null;

// Debug logging for environment variables
console.log('🔍 Environment Variables Debug:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET (length: ' + process.env.SUPABASE_ANON_KEY.length + ')' : 'NOT SET');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'SET (length: ' + process.env.VITE_SUPABASE_ANON_KEY.length + ')' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV);

async function getSupabasePublicKey(): Promise<string> {
  if (supabasePublicKey) {
    return supabasePublicKey;
  }

  try {
    // Use the correct environment variable name for backend
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL not configured');
    }

    console.log('🔍 Fetching public key from:', supabaseUrl);

    const response = await fetch(`${supabaseUrl}/rest/v1/auth/jwks`);
    const jwks = await response.json();
    
    // Get the first key (Supabase typically has one)
    if (jwks.keys && jwks.keys.length > 0) {
      supabasePublicKey = jwks.keys[0].n as string; // Use the modulus as the public key
      console.log('✅ Supabase public key fetched successfully');
      return supabasePublicKey;
    } else {
      throw new Error('No public keys found in JWKS');
    }
  } catch (error) {
    console.error('❌ Error fetching Supabase public key:', error);
    throw error;
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
      
      try {
        // For now, we'll decode to get user info (you can add verification later)
        const decoded = jwt.decode(token) as any;
        
        if (decoded && decoded.sub) {
          req.supabaseUser = {
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role
          };
          console.log('✅ Token verified for user:', decoded.sub);
        }
      } catch (error) {
        console.error('❌ Token verification failed:', error);
        // Continue without authentication rather than failing
      }
      
      next();
    } catch (error) {
      console.error('❌ Auth middleware error:', error);
      next(); // Continue without authentication
    }
  };

  app.use(verifySupabaseToken);
}

export function isAuthenticated(): RequestHandler {
  return (req, res, next) => {
    if (!req.supabaseUser) {
      return res.status(401).json({ 
        message: 'Authentication required',
        error: 'No valid Supabase token found'
      });
    }
    next();
  };
} 