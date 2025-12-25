# Database Setup Guide

## 🗄️ User Profiles Database Setup

To enable user profile storage in Supabase, you need to run the database migration.

### Option 1: Using Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link to your project**:
   ```bash
   supabase link --project-ref uzydtljwbzcybqeephen
   ```

4. **Run the migration**:
   ```bash
   supabase db push
   ```

### Option 2: Manual Setup via Supabase Dashboard

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to**: SQL Editor
3. **Copy and paste** the following SQL:

```sql
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    company TEXT,
    phone TEXT,
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on profile changes
CREATE OR REPLACE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

4. **Click "Run"** to execute the SQL

### Option 3: Disable Email Verification in Supabase Dashboard

1. **Go to Authentication > Settings** in your Supabase dashboard
2. **Find "Email Confirmations"** section
3. **Disable "Enable email confirmations"**
4. **Save changes**

## ✅ What This Sets Up

### Database Table: `user_profiles`
- **id**: Links to auth.users table
- **email**: User's email address
- **full_name**: User's full name
- **company**: User's company name
- **phone**: User's phone number (optional)
- **country**: User's country (optional)
- **created_at**: When profile was created
- **updated_at**: When profile was last updated

### Security Features
- **Row Level Security**: Users can only access their own profiles
- **Automatic Profile Creation**: Profile created automatically on signup
- **Auto-timestamps**: Created and updated timestamps managed automatically

### Authentication Flow
- **Immediate Signup**: No email verification required
- **Instant Access**: Users are signed in immediately after registration
- **Profile Auto-creation**: User profile created automatically with signup data

## 🧪 Testing

After setup, test the flow:

1. **Click "Apply for Access"** in the navigation
2. **Fill out the form** with your details
3. **Submit** - you should be immediately signed in
4. **Check your profile** - data should be saved in the database
5. **View in Supabase Dashboard** - check the `user_profiles` table

## 🔧 Troubleshooting

### Migration Fails
- Check your Supabase project permissions
- Ensure you're linked to the correct project
- Try running the SQL manually in the dashboard

### Email Verification Still Required
- Check Authentication settings in Supabase dashboard
- Ensure "Enable email confirmations" is disabled
- Clear browser cache and try again

### Profile Not Created
- Check the `handle_new_user()` function exists
- Verify the trigger is active
- Check Supabase logs for errors

Your database is now ready to store user profiles with immediate signup! 🎉