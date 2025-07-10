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
    if ((req.session as any).user) return res.json((req.session as any).user);
    res.status(401).json({ message: 'Not authenticated' });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if ((req.session as any).user) return next();
  res.status(401).json({ message: 'Unauthorized' });
}; 