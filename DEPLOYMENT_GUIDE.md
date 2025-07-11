# TeacherToolkit Deployment Guide

## 🚀 Deploy to Vercel (Recommended)

### Why Vercel?
- ✅ **Free tier**: 100GB bandwidth, 100 serverless function executions/day
- ✅ **Perfect for your stack**: React + Node.js API routes
- ✅ **Automatic deployments** from Git
- ✅ **Built-in CDN** and edge caching
- ✅ **Easy environment variable management**

### Pre-Deployment Checklist

1. **Environment Variables** - Set these in Vercel:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id (optional)
   GOOGLE_CLIENT_SECRET=your_google_client_secret (optional)
   OPENAI_API_KEY=your_openai_key (optional)
   ```

2. **Database Setup**:
   - Ensure your Supabase database is properly configured
   - Run migrations: `npm run db:push`
   - Verify RBAC tables are created

3. **Domain Configuration** (if using custom domain):
   - Add your domain in Vercel dashboard
   - Update Supabase auth redirect URLs

### Deployment Steps

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**:
   - Go to Vercel dashboard → Project Settings → Environment Variables
   - Add all required environment variables

5. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`

### Post-Deployment

1. **Test Your App**:
   - Verify all API endpoints work
   - Test authentication flow
   - Check admin panel functionality

2. **Monitor Usage**:
   - Check Vercel dashboard for function execution counts
   - Monitor bandwidth usage
   - Set up alerts for approaching limits

3. **Performance Optimization**:
   - Enable edge caching for static assets
   - Optimize images and bundle size
   - Use CDN for better global performance

## 🔧 Optimization for Free Tier

### Serverless Function Limits
- **Timeout**: 10 seconds max
- **Size**: 50MB max
- **Memory**: 1024MB max

### Cost-Saving Tips
1. **Optimize API calls**:
   - Use caching where possible
   - Minimize database queries
   - Implement request batching

2. **Static asset optimization**:
   - Compress images
   - Use modern image formats (WebP)
   - Enable gzip compression

3. **Database optimization**:
   - Use connection pooling
   - Implement query caching
   - Optimize database indexes

### Monitoring Free Tier Usage
- **Bandwidth**: 100GB/month
- **Function executions**: 100/day
- **Build minutes**: 100/month

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check environment variables
   - Verify TypeScript compilation
   - Check for missing dependencies

2. **API Timeouts**:
   - Optimize database queries
   - Implement caching
   - Consider breaking large operations

3. **Authentication Issues**:
   - Verify Supabase configuration
   - Check redirect URLs
   - Ensure JWT secret is set

### Performance Issues
- Use Vercel Analytics to identify bottlenecks
- Implement proper error handling
- Add request logging for debugging

## 📈 Scaling Considerations

### When to Upgrade
- **Bandwidth**: >100GB/month
- **Function executions**: >100/day
- **Build time**: >100 minutes/month

### Upgrade Path
1. **Vercel Pro**: $20/month
   - Unlimited function executions
   - 1TB bandwidth
   - Team collaboration

2. **Vercel Enterprise**: Custom pricing
   - Advanced security features
   - Custom domains
   - Priority support

## 🔒 Security Best Practices

1. **Environment Variables**:
   - Never commit secrets to Git
   - Use Vercel's environment variable system
   - Rotate keys regularly

2. **API Security**:
   - Implement rate limiting
   - Use CORS properly
   - Validate all inputs

3. **Database Security**:
   - Use connection pooling
   - Implement proper RBAC
   - Regular security audits

## 📞 Support

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Community**: https://github.com/vercel/vercel/discussions
- **Supabase Documentation**: https://supabase.com/docs

---

**Note**: This deployment guide is optimized for Vercel's free tier. Monitor your usage closely and upgrade when needed to avoid service interruptions. 