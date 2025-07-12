# Vercel Environment Variables Setup Guide

## **CRITICAL: Environment Variables for Vercel Deployment**

Your application is failing on Vercel because of missing or incorrectly named environment variables. Follow this guide to fix the deployment.

### **Required Environment Variables for Vercel**

Add these environment variables in your Vercel dashboard:

#### **1. Database Configuration**
```
DATABASE_URL=postgresql://postgres:govjir-2natfy-ciCjot@db.sywjrwkokaqhkczlejsb.supabase.co:5432/postgres
```

#### **2. Frontend Supabase Configuration (CRITICAL)**
```
VITE_SUPABASE_URL=https://sywjrwkokaqhkczlejsb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **3. Backend Configuration**
```
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
NODE_ENV=production
```

### **How to Set Environment Variables in Vercel**

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Select your TeacherToolkit project

2. **Navigate to Settings**
   - Click on your project
   - Go to "Settings" tab
   - Click "Environment Variables"

3. **Add Each Variable**
   - Click "Add New"
   - Enter the variable name (e.g., `VITE_SUPABASE_URL`)
   - Enter the variable value
   - Select "Production" environment
   - Click "Save"

4. **Redeploy**
   - After adding all variables, go to "Deployments"
   - Click "Redeploy" on your latest deployment

### **Environment Variable Reference**

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `DATABASE_URL` | Supabase database connection | ✅ | `postgresql://postgres:...` |
| `VITE_SUPABASE_URL` | Frontend Supabase URL | ✅ | `https://sywjrwkokaqhkczlejsb.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Frontend Supabase key | ✅ | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SESSION_SECRET` | Session encryption | ✅ | `your-secret-key` |
| `NODE_ENV` | Environment mode | ✅ | `production` |

### **Common Issues and Solutions**

#### **Issue: "Missing Supabase environment variables"**
**Solution**: Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Vercel

#### **Issue: "Database connection failed"**
**Solution**: Verify `DATABASE_URL` is correct and accessible from Vercel

#### **Issue: "API routes not working"**
**Solution**: Check that all environment variables are set for "Production" environment

### **Testing Your Setup**

After setting environment variables:

1. **Redeploy your application**
2. **Check the build logs** for any errors
3. **Test the application** by visiting your Vercel URL
4. **Check browser console** for any frontend errors
5. **Test API endpoints** by visiting `/api/classes`

### **Security Notes**

- ✅ **VITE_ variables** are exposed to the browser (safe for public keys)
- ✅ **DATABASE_URL** is server-side only (secure)
- ✅ **SESSION_SECRET** is server-side only (secure)
- ⚠️ **Never commit** environment variables to Git

### **Next Steps**

1. Set all environment variables in Vercel
2. Redeploy the application
3. Test all functionality
4. Monitor for any remaining issues

Your application should now work properly on Vercel! 🚀 