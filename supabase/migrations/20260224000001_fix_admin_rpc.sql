-- Fix for Admin RPC functions when using Custom Admin Auth
-- Since the Admin Panel uses a custom authentication system (verify_admin_credentials)
-- rather than native Supabase Auth, auth.uid() is null.
-- We restore execution access but require the caller's admin UUID to verify authorization.

-- 1. Restore Execution Access
GRANT EXECUTE ON FUNCTION public.provision_new_admin TO public;
GRANT EXECUTE ON FUNCTION public.reset_admin_password TO public;
GRANT EXECUTE ON FUNCTION public.get_admin_roster TO public;
GRANT EXECUTE ON FUNCTION public.purge_admin_credential TO public;

-- 2. Modify functions to take p_caller_id and verify it
DROP FUNCTION IF EXISTS public.provision_new_admin(TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.provision_new_admin(p_caller_id UUID, p_email TEXT, p_password TEXT)
RETURNS SETOF public.admins AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.admins WHERE id = p_caller_id) THEN
        RAISE EXCEPTION 'Unauthorized: Invalid Caller ID';
    END IF;

    RETURN QUERY
    INSERT INTO public.admins (email, password_hash)
    VALUES (p_email, crypt(p_password, gen_salt('bf')))
    RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS public.reset_admin_password(UUID, TEXT);
CREATE OR REPLACE FUNCTION public.reset_admin_password(p_caller_id UUID, p_admin_id UUID, p_new_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.admins WHERE id = p_caller_id) THEN
        RAISE EXCEPTION 'Unauthorized: Invalid Caller ID';
    END IF;

    UPDATE public.admins 
    SET password_hash = crypt(p_new_password, gen_salt('bf'))
    WHERE id = p_admin_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS public.get_admin_roster();
CREATE OR REPLACE FUNCTION public.get_admin_roster(p_caller_id UUID)
RETURNS SETOF public.admins AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.admins WHERE id = p_caller_id) THEN
        RAISE EXCEPTION 'Unauthorized: Invalid Caller ID';
    END IF;

    RETURN QUERY
    SELECT * FROM public.admins ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS public.purge_admin_credential(UUID);
CREATE OR REPLACE FUNCTION public.purge_admin_credential(p_caller_id UUID, p_admin_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.admins WHERE id = p_caller_id) THEN
        RAISE EXCEPTION 'Unauthorized: Invalid Caller ID';
    END IF;

    -- Prevent an admin from deleting themselves
    IF p_caller_id = p_admin_id THEN
        RAISE EXCEPTION 'Action Denied: You cannot purge your own credentials.';
    END IF;

    DELETE FROM public.admins 
    WHERE id = p_admin_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-grant access for the newly defined functions
GRANT EXECUTE ON FUNCTION public.provision_new_admin(UUID, TEXT, TEXT) TO public, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.reset_admin_password(UUID, UUID, TEXT) TO public, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_roster(UUID) TO public, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.purge_admin_credential(UUID, UUID) TO public, authenticated, anon;
