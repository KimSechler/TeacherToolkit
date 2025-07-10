# Google OAuth Setup Guide for TeacherToolkit

This guide will walk you through setting up Google OAuth authentication for your TeacherToolkit application.

## Prerequisites

- A Google account
- Access to Google Cloud Console
- Your TeacherToolkit application running locally

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on "Select a project" at the top of the page
3. Click "New Project"
4. Enter a project name (e.g., "TeacherToolkit")
5. Click "Create"

## Step 2: Enable the Google+ API

1. In your new project, go to "APIs & Services" > "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click on "Google Identity" and then "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: TeacherToolkit
   - User support email: Your email
   - Developer contact information: Your email
   - Save and continue through the other sections

4. Create the OAuth client ID:
   - Application type: Web application
   - Name: TeacherToolkit Web Client
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback` (for development)
     - `https://yourdomain.com/api/auth/google/callback` (for production)
   - Click "Create"

5. Copy the Client ID and Client Secret (you'll need these for the next step)

## Step 4: Configure Environment Variables

Create or update your `.env` file in the root of your project:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Other existing environment variables...
SESSION_SECRET=your_session_secret
DATABASE_URL=your_database_url
```

## Step 5: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/login`

3. You should see a "Continue with Google" button below the regular login form

4. Click the Google button to test the OAuth flow

## Step 6: Production Deployment

When deploying to production:

1. Update your Google OAuth credentials in Google Cloud Console:
   - Add your production domain to "Authorized JavaScript origins"
   - Add your production callback URL to "Authorized redirect URIs"

2. Update your environment variables:
   ```bash
   GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
   ```

3. Ensure your session configuration is secure:
   ```javascript
   cookie: {
     secure: true, // Must be true for HTTPS
     httpOnly: true,
     maxAge: 24 * 60 * 60 * 1000
   }
   ```

## Troubleshooting

### Common Issues

1. **"Google OAuth not configured" message**
   - Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in your environment variables
   - Restart your server after adding the environment variables

2. **"redirect_uri_mismatch" error**
   - Ensure the callback URL in your Google OAuth credentials matches exactly
   - Check for trailing slashes or protocol mismatches

3. **"invalid_client" error**
   - Verify your Client ID and Client Secret are correct
   - Make sure you're using the right credentials for your environment (dev vs prod)

4. **Session not persisting**
   - Check that your session configuration is correct
   - Ensure cookies are being set properly

### Debug Mode

To enable debug logging, add this to your environment variables:
```bash
DEBUG=passport:*
```

## Security Considerations

1. **Never commit your Client Secret to version control**
   - Always use environment variables
   - Add `.env` to your `.gitignore` file

2. **Use HTTPS in production**
   - Google OAuth requires HTTPS for production
   - Set `secure: true` in your session configuration

3. **Validate user data**
   - Always validate the user information returned from Google
   - Consider implementing additional security measures for sensitive operations

## Additional Features

### Customizing the OAuth Flow

You can customize the OAuth flow by modifying the scope in `server/googleAuth.ts`:

```javascript
scope: ["profile", "email", "openid"]
```

### Adding More OAuth Providers

The current implementation is designed to be easily extensible. You can add other OAuth providers (GitHub, Microsoft, etc.) by:

1. Installing the appropriate passport strategy
2. Creating a new auth module similar to `googleAuth.ts`
3. Integrating it into your main server file

## Support

If you encounter issues:

1. Check the browser console for JavaScript errors
2. Check the server logs for backend errors
3. Verify your Google OAuth configuration
4. Ensure all environment variables are set correctly

For additional help, refer to:
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Documentation](http://www.passportjs.org/)
- [Express Session Documentation](https://github.com/expressjs/session) 