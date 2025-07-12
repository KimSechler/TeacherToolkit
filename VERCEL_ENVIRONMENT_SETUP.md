# 🚀 Vercel Environment Variables Setup Guide

## **Critical: Environment Variables Required for Deployment**

Your TeacherToolkit application requires specific environment variables to work properly on Vercel. Follow this guide to set them up correctly.

## **Step 1: Access Vercel Environment Variables**

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your TeacherToolkit project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

## **Step 2: Required Environment Variables**

### **Database Configuration**
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### **Frontend Supabase Configuration (VITE_ prefix required)**
```
VITE_SUPABASE_URL=https://[PROJECT-REF].supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### **Backend Supabase Configuration**
```
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### **Session Security**
```
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
```

### **Environment**
```
NODE_ENV=production
```

## **Step 3: Optional Environment Variables**

### **Google OAuth (if using)**
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### **OpenAI Integration (if using)**
```
OPENAI_API_KEY=your-openai-api-key
```

## **Step 4: Environment Variable Configuration**

### **For All Environments (Production, Preview, Development)**
- Check the boxes for all environments
- This ensures your app works in all deployment scenarios

### **Variable Names Must Match Exactly**
- Frontend variables MUST start with `VITE_`
- Backend variables can use `NEXT_PUBLIC_` or no prefix
- Case-sensitive - match exactly as shown above

## **Step 5: Get Your Supabase Values**

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL**: Use for `VITE_SUPABASE_URL`
   - **anon/public key**: Use for `VITE_SUPABASE_ANON_KEY`
   - **Database connection string**: Use for `DATABASE_URL`

## **Step 6: Generate Session Secret**

Create a strong session secret:
```bash
# Generate a random 32-character string
openssl rand -base64 32
```

Or use an online generator and copy the result to `SESSION_SECRET`.

## **Step 7: Verify Configuration**

After setting all variables:

1. **Redeploy your application** in Vercel
2. **Check the build logs** for any environment variable errors
3. **Test the application** to ensure everything works

## **Common Issues and Solutions**

### **"VITE_SUPABASE_URL is not defined"**
- Ensure the variable name starts with `VITE_`
- Check that it's set for all environments
- Redeploy after adding the variable

### **"DATABASE_URL is not defined"**
- Verify the connection string format
- Ensure SSL is enabled in Supabase
- Check that the database is accessible

### **"Session secret is weak"**
- Generate a longer, more complex secret
- Use at least 32 characters
- Include letters, numbers, and special characters

### **"Build fails with environment errors"**
- Check all required variables are set
- Verify variable names match exactly
- Ensure no extra spaces or quotes

## **Security Best Practices**

1. **Never commit environment variables to Git**
2. **Use different values for development and production**
3. **Rotate secrets regularly**
4. **Use strong, unique passwords**
5. **Enable SSL for all database connections**

## **Testing Your Setup**

After deployment, test these features:

1. **Authentication**: Sign up/login should work
2. **Database Operations**: Creating classes, students, etc.
3. **API Endpoints**: All `/api/*` routes should respond
4. **Real-time Features**: Supabase real-time should work

## **Next Steps**

Once environment variables are configured:

1. **Deploy to Vercel**: `vercel --prod`
2. **Test all functionality**: Ensure everything works
3. **Monitor logs**: Check for any errors
4. **Set up monitoring**: Enable Vercel Analytics

## **Support**

If you encounter issues:

1. Check Vercel build logs for specific errors
2. Verify all environment variables are set correctly
3. Test database connectivity
4. Review Supabase project settings

Your TeacherToolkit should now be fully functional on Vercel! 🚀 