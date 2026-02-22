-- Migration to create the admins table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to check their own admin status
CREATE POLICY "Users can check their own admin status" ON public.admins
    FOR SELECT USING (auth.uid() = user_id);

-- Also allow the verify_admin_credentials function to work correctly
-- Since it is SECURITY DEFINER, it doesn't need explicit policies to bypass RLS for its own logic,
-- but the table must exist.

-- Insert a default admin if needed (optional, but good for testing)
-- The password hash below is for 'admin123' using blowfish (pgcrypto crypt)
-- You can use verify_admin_credentials to login
-- INSERT INTO public.admins (email, password_hash)
-- VALUES ('admin@kinsa-global.com', crypt('admin123', gen_salt('bf')));
