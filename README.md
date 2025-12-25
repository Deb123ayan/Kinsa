# KINSA Global - Static Website with Supabase

This is now a static React website built with Vite, converted from a full-stack Express application, with Supabase integration for serverless functionality.

## Features

- ✅ Static React website
- ✅ Supabase integration
- ✅ **Full Authentication System** (Sign up, Sign in, Password reset)
- ✅ **Protected Routes** and content guards
- ✅ **User Management** with persistent sessions
- ✅ Serverless email functionality via Edge Functions
- ✅ Contact form with email notifications
- ✅ Environment variable configuration

## Development

```bash
npm run dev
```

Starts the development server on http://localhost:5000

## Build

```bash
npm run build
```

Builds the static site to the `dist` folder.

## Preview

```bash
npm run preview
```

Preview the built static site locally.

## Authentication Setup

✅ **Fully Configured!** Authentication is ready to use:

- **Sign Up/Sign In**: Complete user registration and login
- **Email Verification**: Users must verify their email
- **Password Reset**: Forgot password functionality
- **Protected Content**: Use `AuthGuard` component
- **User Sessions**: Persistent login across page refreshes

See [AUTH_SETUP.md](./AUTH_SETUP.md) for detailed authentication documentation.

### Quick Auth Usage:
```tsx
import { useAuth } from '@/context/auth-context'
import { AuthGuard } from '@/components/auth/AuthGuard'

function MyComponent() {
  const { user, signOut } = useAuth()
  
  return (
    <AuthGuard>
      <p>Welcome, {user?.email}!</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </AuthGuard>
  )
}
```

## Supabase Setup

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup instructions.

Quick setup:
1. Update `.env` with your Supabase credentials
2. Deploy edge functions: `npm run supabase:deploy`
3. All emails will be sent to `mukherjeed556@gmail.com`

## Email Setup

See [GMAIL_SETUP.md](./GMAIL_SETUP.md) for Gmail SMTP configuration.

The email system uses **Nodemailer with SMTP** for reliable email delivery.

## Deployment

The `dist` folder contains all the static files needed for deployment. You can deploy this to any static hosting service like:

- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Any web server

## Changes Made

- Removed server folder and all server-related code
- Removed Express, database, and authentication dependencies
- Updated build process to generate static files
- Simplified npm scripts for static site workflow
- Updated Vite config for static build output
- **Added Supabase integration with Edge Functions**
- **Added complete authentication system**
- **Added email functionality using Supabase Functions with Nodemailer**
- **Created contact form component**
- **Added protected routes and auth guards**

The website is now completely serverless and can be hosted anywhere that serves static files, with backend functionality provided by Supabase Edge Functions and authentication.