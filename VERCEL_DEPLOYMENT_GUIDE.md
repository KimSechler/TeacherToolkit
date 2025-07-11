# Vercel Deployment Guide for TeacherToolkit

## Prerequisites
- Vercel account
- Supabase project set up
- Environment variables ready

## Step-by-Step Deployment

### 1. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository

### 2. Configure Project Settings
- **Framework Preset**: Other
- **Root Directory**: `/` (leave as default)
- **Build Command**: `npm run build`
- **Output Directory**: `dist/public`
- **Install Command**: `npm install`

### 3. Environment Variables
Add these in Vercel's Environment Variables section:

#### Required Variables:
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SESSION_SECRET=your-session-secret-key
NODE_ENV=production
```

#### Optional Variables (if using Google OAuth):
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 4. Build Configuration
The project uses a custom build setup:
- Frontend: Vite builds to `dist/public`
- Backend: Express server in `server/index.ts`
- Shared schema in `shared/` directory

### 5. Deployment
1. Click "Deploy"
2. Monitor the build logs for any issues
3. Once deployed, your app will be available at `https://your-project.vercel.app`

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check that all dependencies are in `package.json`
2. **Environment Variables**: Ensure all required env vars are set
3. **Database Connection**: Verify Supabase connection string
4. **API Routes**: Check that `/api/*` routes are working

### Build Logs to Watch For:
- TypeScript compilation errors
- Missing dependencies
- Environment variable issues
- Database connection problems

## Post-Deployment

1. **Test the Application**: Visit your deployed URL and test all features
2. **Check API Endpoints**: Verify `/api/*` routes are working
3. **Database Connection**: Ensure Supabase connection is working
4. **Authentication**: Test login/signup flows

## Custom Domain (Optional)
1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS settings as instructed

## Monitoring
- Use Vercel Analytics to monitor performance
- Check Function Logs for API issues
- Monitor database connections and performance 