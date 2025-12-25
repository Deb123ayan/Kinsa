# Gmail SMTP Setup for Nodemailer

## Quick Setup for Gmail

### 1. Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled

### 2. Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" as the app
3. Generate password
4. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### 3. Update Environment Variables

In your `.env` file:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
```

### 4. Deploy to Supabase

Add these same variables to your Supabase Edge Functions environment:
1. Go to Supabase Dashboard
2. Settings > Edge Functions
3. Add environment variables:
   - `SMTP_HOST`: `smtp.gmail.com`
   - `SMTP_PORT`: `587`
   - `SMTP_USER`: `your-gmail@gmail.com`
   - `SMTP_PASS`: `your-app-password`

### 5. Test

Run your contact form - emails should now be sent to `mukherjeed556@gmail.com` via Gmail SMTP!

## Alternative Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### Custom SMTP
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```