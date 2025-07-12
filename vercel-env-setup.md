# 🔧 Vercel Environment Variables Setup

## 🚨 **CRITICAL: Add These Environment Variables to Vercel**

Go to your Vercel dashboard and add these environment variables:

### **Frontend Variables (VITE_ prefix)**
```
VITE_SUPABASE_URL=https://sywjrwkokaqhkczlejsb.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-from-supabase
```

### **Backend Variables (no VITE_ prefix)**
```
SUPABASE_URL=https://sywjrwkokaqhkczlejsb.supabase.co
SUPABASE_ANON_KEY=your-actual-anon-key-from-supabase
DATABASE_URL=postgresql://postgres:govjir-2natfy-ciCjot@db.sywjrwkokaqhkczlejsb.supabase.co:5432/postgres
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
NODE_ENV=production
```

## 🔍 **How to Find Your Supabase Anon Key**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `sywjrwkokaqhkczlejsb`
3. Go to **Settings** → **API**
4. Copy the **anon public** key (starts with `eyJ...`)

## 📋 **Step-by-Step Instructions**

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your `teacher-toolkit` project

2. **Navigate to Environment Variables**
   - Go to **Settings** tab
   - Click **Environment Variables**

3. **Add Each Variable**
   - Click **Add New**
   - Add each variable from the list above
   - Make sure to select **Production** environment
   - Click **Save**

4. **Redeploy**
   - Go to **Deployments** tab
   - Click **Redeploy** on your latest deployment

## 🎯 **Why This Fixes the Issue**

- **Frontend** needs `VITE_` prefixed variables (available in browser)
- **Backend** needs non-prefixed variables (available in serverless functions)
- Vercel serverless functions can't access `VITE_` variables
- This was causing the "Invalid API key" error

## ✅ **After Adding Variables**

Your app should work correctly at:
**https://teacher-toolkit-mnqzt87nj-teachertoolkits-projects.vercel.app** 