-- Migration to add admin verification function
-- This allows checking hashed passwords in the public.admins table via RPC

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION verify_admin_credentials(p_email TEXT, p_password TEXT)
RETURNS TABLE (
    id UUID,
    email TEXT,
    user_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT a.id, a.email, a.user_id
    FROM public.admins a
    WHERE a.email = p_email 
    AND a.password_hash = crypt(p_password, a.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
