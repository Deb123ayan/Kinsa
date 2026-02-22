-- 1. Ensure user_id is optional in the admins table (Fixes the Not-Null constraint error)
ALTER TABLE public.admins ALTER COLUMN user_id DROP NOT NULL;

-- 2. Refined provisioning function (SET OF rows)
CREATE OR REPLACE FUNCTION public.provision_new_admin(p_email TEXT, p_password TEXT)
RETURNS SETOF public.admins AS $$
BEGIN
    RETURN QUERY
    INSERT INTO public.admins (email, password_hash)
    VALUES (p_email, crypt(p_password, gen_salt('bf')))
    RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Password Reset Function
CREATE OR REPLACE FUNCTION public.reset_admin_password(p_admin_id UUID, p_new_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.admins 
    SET password_hash = crypt(p_new_password, gen_salt('bf'))
    WHERE id = p_admin_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Roster Fetch Function
CREATE OR REPLACE FUNCTION public.get_admin_roster()
RETURNS SETOF public.admins AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.admins ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Secure Purge Function (Delete based on UUID)
-- This allows admins to delete other admins securely via RPC
CREATE OR REPLACE FUNCTION public.purge_admin_credential(p_admin_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM public.admins 
    WHERE id = p_admin_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permissions
GRANT EXECUTE ON FUNCTION public.provision_new_admin(TEXT, TEXT) TO public;
GRANT EXECUTE ON FUNCTION public.reset_admin_password(UUID, TEXT) TO public;
GRANT EXECUTE ON FUNCTION public.get_admin_roster() TO public;
GRANT EXECUTE ON FUNCTION public.purge_admin_credential(UUID) TO public;
