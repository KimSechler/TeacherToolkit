import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { setupSupabaseAuth, isAuthenticated } from "./supabaseAuth";
import { setupGoogleAuth, isGoogleAuthAvailable } from "./googleAuth";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupWebSocket } from './ws';
import { storage } from "./storage";
import { db } from "./db";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || "dev-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

setupSupabaseAuth(app);
setupGoogleAuth(app);

// Add route to check if Google OAuth is available
app.get("/api/auth/google/available", (req, res) => {
  res.json({ available: isGoogleAuthAvailable() });
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Test database connection on startup
  try {
    await storage.testDatabaseConnection();
  } catch (error) {
    console.error("Failed to test database connection:", error);
  }

  // Initialize RBAC system
  try {
    // First, create RBAC tables if they don't exist
    console.log("🔧 Creating RBAC tables...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "roles" (
        "id" varchar PRIMARY KEY NOT NULL,
        "name" varchar NOT NULL,
        "description" text,
        "permissions" jsonb NOT NULL,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "user_roles" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" varchar NOT NULL,
        "role_id" varchar NOT NULL,
        "assigned_by" varchar,
        "assigned_at" timestamp DEFAULT now(),
        "expires_at" timestamp,
        "is_active" boolean DEFAULT true
      );
    `);
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "admin_audit_logs" (
        "id" serial PRIMARY KEY NOT NULL,
        "admin_id" varchar NOT NULL,
        "action" varchar NOT NULL,
        "target_user_id" varchar,
        "resource_type" varchar,
        "resource_id" varchar,
        "old_value" jsonb,
        "new_value" jsonb,
        "metadata" jsonb,
        "ip_address" varchar,
        "user_agent" text,
        "timestamp" timestamp DEFAULT now()
      );
    `);
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "admin_invitations" (
        "id" serial PRIMARY KEY NOT NULL,
        "email" varchar NOT NULL,
        "role_id" varchar NOT NULL,
        "invited_by" varchar NOT NULL,
        "token" varchar NOT NULL,
        "expires_at" timestamp NOT NULL,
        "accepted_at" timestamp,
        "status" varchar DEFAULT 'pending',
        "created_at" timestamp DEFAULT now(),
        CONSTRAINT "admin_invitations_token_unique" UNIQUE("token")
      );
    `);
    
    console.log("✅ RBAC tables created");
    
    // Initialize roles
    const { RBACService } = await import('./lib/rbacService');
    await RBACService.initializeRoles();
    console.log("✅ RBAC system initialized");
    
    // Assign super admin role to andrewjstoy@gmail.com
    const assignSuperAdminRole = await import('../assign-admin-role');
    await assignSuperAdminRole.default();
  } catch (error) {
    console.error("❌ Failed to initialize RBAC:", error);
  }

  const server = await registerRoutes(app, isAuthenticated);

  // Add this line to start WebSocket server
  setupWebSocket(server);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log the error for debugging
    console.error(`[ERROR] ${status}: ${message}`, err);
    
    // Only send error response if headers haven't been sent
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
    
    // Don't throw the error - it will crash the server
    // The error is already logged above
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 3000;
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})();
