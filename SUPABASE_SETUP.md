# 🗄️ Supabase Setup Guide

## **Step 1: Create Supabase Account**
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended)
4. Create a new organization

## **Step 2: Create Project**
1. Click "New Project"
2. Choose your organization
3. Enter project details:
   - **Name**: `teachertoolkit`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
4. Click "Create new project"

## **Step 3: Get Connection Details**
1. Go to **Settings** → **Database**
2. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

## **Step 4: Set Environment Variables**
Create a `.env.local` file:
```bash
# Database
DATABASE_URL=your-supabase-connection-string

# Supabase (for auth)
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Auth (optional - for Google OAuth)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## **Step 5: Run Migrations**
```bash
npm run db:push
```

## **Step 6: Test Connection**
```bash
curl http://localhost:3000/api/classes
```

## **Benefits for TeacherToolkit**
- ✅ **SOC 2 compliant** - Enterprise security
- ✅ **Built-in auth** - Replace current auth system
- ✅ **Real-time** - Perfect for live games
- ✅ **Row-level security** - Data isolation
- ✅ **Automatic backups** - Data safety
- ✅ **Free tier** - 500MB database, 2GB bandwidth 