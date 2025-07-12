import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Basic health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database connection test
app.get("/api/db/test", async (req, res) => {
  try {
    const hasDbUrl = !!process.env.DATABASE_URL;
    res.json({ 
      connected: hasDbUrl,
      configured: hasDbUrl
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Database connection failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Environment variables check (for debugging)
app.get("/api/env/check", (req, res) => {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? 'SET' : 'NOT_SET',
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET',
    SESSION_SECRET: process.env.SESSION_SECRET ? 'SET' : 'NOT_SET',
  };
  
  res.json({ 
    environment: envVars,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`[ERROR] ${status}: ${message}`, err);
  
  if (!res.headersSent) {
    res.status(status).json({ message });
  }
});

// Export for Vercel
export default app; 