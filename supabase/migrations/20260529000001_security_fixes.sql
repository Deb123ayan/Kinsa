-- SECURITY FIXES MIGRATION
-- Objective: Patch critical vulnerabilities in admin authentication and RPCs.

-- 1. FIX: Privilege Escalation in `is_admin()`
-- The previous implementation allowed an attacker to gain admin privileges by 
-- registering a standard user account with an admin's email address due to the 
-- `OR email = auth.jwt() ->> 'email'` fallback. We remove this to strictly rely 
-- on cryptographic UUID matching.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. FIX: Insecure Direct Object Reference (IDOR) in Admin RPCs
-- The previous implementations required the caller to pass a `p_caller_id UUID`.
-- A UUID is not a secure token. If leaked, any user could perform admin actions.
-- We change these to use the secure `public.is_admin()` check internally.

-- First, drop the old vulnerable functions that take `p_caller_id`
DROP FUNCTION IF EXISTS public.provision_new_admin(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.reset_admin_password(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS public.get_admin_roster(UUID);
DROP FUNCTION IF EXISTS public.purge_admin_credential(UUID, UUID);

-- Recreate them securely relying on `auth.uid()` via `public.is_admin()`
CREATE OR REPLACE FUNCTION public.provision_new_admin(p_email TEXT, p_password TEXT)
RETURNS SETOF public.admins AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Administrative privileges required.';
    END IF;

    RETURN QUERY
    INSERT INTO public.admins (email, password_hash)
    VALUES (p_email, crypt(p_password, gen_salt('bf')))
    RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.reset_admin_password(p_admin_id UUID, p_new_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Administrative privileges required.';
    END IF;

    UPDATE public.admins 
    SET password_hash = crypt(p_new_password, gen_salt('bf'))
    WHERE id = p_admin_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_admin_roster()
RETURNS SETOF public.admins AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Administrative privileges required.';
    END IF;

    RETURN QUERY
    SELECT * FROM public.admins ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.purge_admin_credential(p_admin_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Administrative privileges required.';
    END IF;

    -- Prevent an admin from deleting their own credential via this method to avoid locking themselves out
    IF EXISTS (SELECT 1 FROM public.admins WHERE id = p_admin_id AND user_id = auth.uid()) THEN
        RAISE EXCEPTION 'Action Denied: You cannot purge your own credentials.';
    END IF;

    DELETE FROM public.admins 
    WHERE id = p_admin_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access ONLY to authenticated users. 
-- The internal `is_admin()` check will block non-admins.
GRANT EXECUTE ON FUNCTION public.provision_new_admin(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_admin_password(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_roster() TO authenticated;
GRANT EXECUTE ON FUNCTION public.purge_admin_credential(UUID) TO authenticated;

-- Ensure public access is revoked
REVOKE EXECUTE ON FUNCTION public.provision_new_admin(TEXT, TEXT) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.reset_admin_password(UUID, TEXT) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_roster() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.purge_admin_credential(UUID) FROM public, anon;
