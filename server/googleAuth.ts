import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback";

export function setupGoogleAuth(app: Express) {
  // Check if Google OAuth is configured
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.log("⚠️  Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Google login.");
    return;
  }

  // Configure Google OAuth strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done: any) => {
        try {
          // Extract user information from Google profile
          const googleUser = {
            id: profile.id,
            email: profile.emails?.[0]?.value,
            firstName: profile.name?.givenName || profile.displayName?.split(" ")[0] || "",
            lastName: profile.name?.familyName || profile.displayName?.split(" ").slice(1).join(" ") || "",
            profileImageUrl: profile.photos?.[0]?.value || "",
            provider: "google",
            googleId: profile.id,
          };

          // Upsert user to database
          await storage.upsertUser({
            id: googleUser.id,
            email: googleUser.email!,
            firstName: googleUser.firstName,
            lastName: googleUser.lastName,
            profileImageUrl: googleUser.profileImageUrl,
          });

          return done(null, googleUser);
        } catch (error) {
          console.error("Google OAuth error:", error);
          return done(error as Error, null);
        }
      }
    )
  );

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  // Deserialize user from session
  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth routes
  app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/login?error=google_auth_failed",
      successRedirect: "/",
    })
  );

  // Logout route
  app.get("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/login");
    });
  });

  console.log("✅ Google OAuth configured successfully");
}

// Middleware to check if user is authenticated
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if Google OAuth is available
export const isGoogleAuthAvailable = (): boolean => {
  return !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
}; 