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

    const response = await fetch(`${supabaseUrl}/rest/v1/auth/jwks`);
    const jwks = await response.json();
    
    // Get the first key (Supabase typically uses one key)
    const key = jwks.keys[0];
    if (!key) {
      throw new Error('No JWT keys found');
    }

    // Convert JWK to PEM format
    const { createPublicKey } = await import('crypto');
    const publicKey = createPublicKey({
      key: {
        kty: key.kty,
        n: key.n,
        e: key.e,
      },
      format: 'jwk',
    });

    supabasePublicKey = publicKey.export({ type: 'spki', format: 'pem' }) as string;
    return supabasePublicKey;
  } catch (error) {
    console.error('Failed to fetch Supabase public key:', error);
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
        // Get Supabase public key and verify the JWT
        const publicKey = await getSupabasePublicKey();
        const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
        const decoded = jwt.verify(token, publicKey, { 
          algorithms: ['RS256'],
          issuer: supabaseUrl,
          audience: 'authenticated'
        }) as any;

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
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError);
        // Continue without authentication - let individual routes handle auth
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
    res.json({ 
      status: 'ok', 
      auth: 'supabase',
      timestamp: new Date().toISOString()
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.supabaseUser && req.supabaseUser.id) {
    return next();
  }
  
  res.status(401).json({ message: "Unauthorized" });
}; 