import express from 'express';
import type { Express, RequestHandler } from 'express';

const DEMO_USER = {
  id: "1",
  username: 'teacher',
  firstName: 'Demo',
  lastName: 'Teacher',
  email: 'teacher@example.com',
  profileImageUrl: '',
};

export function setupLocalAuth(app: Express) {
  app.post('/api/login', express.json(), (req, res) => {
    const { username, password } = req.body;
    if (username === 'teacher' && password === 'password') {
      (req.session as any).user = DEMO_USER;
      return res.json({ success: true });
    }
    res.status(401).json({ message: 'Invalid credentials' });
  });

  app.post('/api/logout', (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
  });

  app.get('/api/auth/user', (req, res) => {
    // Check for both session user (local auth) and passport user (Google OAuth)
    const sessionUser = (req.session as any).user;
    const passportUser = req.user;
    
    if (sessionUser) {
      return res.json(sessionUser);
    } else if (passportUser) {
      return res.json(passportUser);
    }
    
    res.status(401).json({ message: 'Not authenticated' });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  const user = (req.session as any).user || req.user;
  
  if (user && user.id) {
    // Validate session hasn't expired
    if (req.session && req.session.cookie && req.session.cookie.expires) {
      const expires = new Date(req.session.cookie.expires);
      if (expires < new Date()) {
        return res.status(401).json({ message: "Session expired" });
      }
    }
    
    return next();
  }
  
  res.status(401).json({ message: "Unauthorized" });
}; 