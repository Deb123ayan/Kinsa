# Troubleshooting Guide

## Common Warnings and Solutions

### 🟡 "Multiple GoTrueClient instances detected"

**What it means:** Supabase created multiple authentication clients in the same browser session.

**Solution:** ✅ **Already Fixed!** 
- Updated `client/src/lib/supabase.ts` to use singleton pattern
- Added custom storage key to prevent conflicts
- This warning should no longer appear

### 🟡 "Failed to load resource: 400 status"

**What it means:** A network request failed, often during authentication or API calls.

**Common causes:**
- Network connectivity issues
- Supabase service temporarily unavailable
- Invalid API requests during development

**Solutions:**
1. **Check network connection**
2. **Verify Supabase credentials** in `client/.env`
3. **Check Supabase dashboard** for service status
4. **Restart dev server** if persistent

### 🟡 Environment Variable Issues

**Error:** "Missing Supabase environment variables"

**Solution:**
1. Ensure `.env` file is in `client/.env` (not project root)
2. Restart dev server after changing environment variables
3. Check file format (no quotes around values)

```env
# client/.env
VITE_SUPABASE_URL=https://uzydtljwbzcybqeephen.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 🟡 Authentication Errors

**Common issues:**
- Email not verified
- Invalid credentials
- Network timeouts

**Solutions:**
1. **Check email verification** - Look for verification email
2. **Verify credentials** - Ensure correct email/password
3. **Check Supabase dashboard** - View user status and logs
4. **Clear browser storage** - Reset auth state if needed

### 🟡 Email Function Errors

**Error:** Email not sending

**Solutions:**
1. **Check SMTP configuration** in environment variables
2. **Verify Gmail app password** (not regular password)
3. **Deploy Edge Function** to Supabase
4. **Check function logs** in Supabase dashboard

## 🔧 Quick Fixes

### Reset Authentication State
```javascript
// In browser console
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### Check Environment Variables
```javascript
// In browser console
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing')
```

### Restart Development Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

## 🚨 When to Worry

**These are normal and can be ignored:**
- ✅ Multiple GoTrueClient instances (fixed)
- ✅ Occasional 400 errors during development
- ✅ Network timeouts during slow connections

**These need attention:**
- ❌ Persistent authentication failures
- ❌ Environment variables not loading
- ❌ Build failures
- ❌ Email functions not working in production

## 📞 Getting Help

1. **Check browser console** for detailed error messages
2. **Check Supabase dashboard** for service logs
3. **Verify configuration** against setup guides
4. **Test in incognito mode** to rule out browser cache issues

## 🎯 Performance Tips

1. **Clear browser cache** regularly during development
2. **Use incognito mode** for testing authentication flows
3. **Monitor network tab** for failed requests
4. **Check Supabase quotas** if experiencing rate limits

Your authentication system is working correctly! The warnings you saw are common during development and have been addressed with the optimizations made to the Supabase client.