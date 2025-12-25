# Supabase Setup Guide with Nodemailer

## 1. Update Environment Variables

Update your `.env` file with your actual Supabase project details and SMTP configuration:

```env
VITE_SUPABASE_URL=https://uzydtljwbzcybqeephen.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6eWR0bGp3YnpjeWJxZWVwaGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTUyNDksImV4cCI6MjA4MjIzMTI0OX0.lW4fF3gIB31c68lMfWdkv1Gmn4C36Myg4dDVegrgUEg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6eWR0bGp3YnpjeWJxZWVwaGVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjY1NTI0OSwiZXhwIjoyMDgyMjMxMjQ5fQ.jWE7WKgiWJzDxzcqerRomfOiy_7pC98h5w_FxifSGOs

# SMTP Configuration for Nodemailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 2. Gmail App Password Setup (Recommended)

For Gmail SMTP, you'll need to create an App Password:

1. Go to your Google Account settings
2. Enable 2-Factor Authentication if not already enabled
3. Go to Security > 2-Step Verification > App passwords
4. Generate a new app password for "Mail"
5. Use this app password as `SMTP_PASS` (not your regular Gmail password)

## 3. Deploy Edge Function

To deploy the email function to Supabase:

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref uzydtljwbzcybqeephen

# Deploy the function
npm run supabase:deploy
```

## 4. Set Environment Variables in Supabase

In your Supabase dashboard, go to Settings > Edge Functions and add these environment variables:

- `SMTP_HOST` (e.g., smtp.gmail.com)
- `SMTP_PORT` (e.g., 587)
- `SMTP_USER` (your email address)
- `SMTP_PASS` (your app password)

## 5. Email Configuration

### Current Setup with Nodemailer
- Uses SMTP to send emails (supports Gmail, Outlook, Yahoo, custom SMTP)
- All emails are sent to: `mukherjeed556@gmail.com`
- Email includes: Name, Email, Subject, and Message from contact form
- Emails are logged to console in development (when SMTP not configured)
- Beautiful HTML email template with proper formatting
- Reply-to is set to the customer's email for easy responses

### Supported Email Providers
- **Gmail**: smtp.gmail.com:587 (requires app password)
- **Outlook**: smtp-mail.outlook.com:587
- **Yahoo**: smtp.mail.yahoo.com:587
- **Custom SMTP**: Any SMTP server

## 6. Contact Form Fields

The contact form includes:
- **Name**: Customer's name
- **Email**: Customer's email (used for reply-to)
- **Subject**: Email subject line
- **Message**: Customer's message

All form submissions will be sent to `mukherjeed556@gmail.com` with the subject line: `[KINSA Contact] {subject}`

## 7. Using the Contact Form

Import and use the ContactForm component:

```tsx
import { ContactForm } from '@/components/ContactForm'

function App() {
  return (
    <div>
      <ContactForm />
    </div>
  )
}
```

## 8. Testing

```bash
# Start your app
npm run dev
```

### Development Mode (SMTP not configured)
- Emails are logged to console
- Shows what would be sent

### Production Mode (SMTP configured)
- Emails are sent via Nodemailer using your SMTP settings
- Sent to: `mukherjeed556@gmail.com`
- Subject: `[KINSA Contact] {whatever subject user entered}`
- Body: Formatted HTML with name, email, subject, and message
- Reply-to: Set to the customer's email for easy replies

## 9. Troubleshooting

### Common Issues:
1. **Gmail "Less secure app access"**: Use App Password instead
2. **Port 587 vs 465**: Use 587 for STARTTLS, 465 for SSL
3. **Authentication failed**: Double-check email and app password
4. **Firewall issues**: Ensure SMTP ports are not blocked

### Error Logs:
Check Supabase Edge Function logs for detailed error messages if emails fail to send.