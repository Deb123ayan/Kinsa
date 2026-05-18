-- Secure the previously vulnerable admin management functions
-- We revoke public execution and recreate the functions with an internal auth check 
-- or restrict to authenticated users only.

-- 1. Revoke public execution
REVOKE EXECUTE ON FUNCTION public.provision_new_admin(TEXT, TEXT) FROM public;
REVOKE EXECUTE ON FUNCTION public.reset_admin_password(UUID, TEXT) FROM public;
REVOKE EXECUTE ON FUNCTION public.get_admin_roster() FROM public;
REVOKE EXECUTE ON FUNCTION public.purge_admin_credential(UUID) FROM public;

-- 2. Modify functions to require an admin caller
-- We assume the caller must be a logged-in user whose UUID exists in the admins table

CREATE OR REPLACE FUNCTION public.provision_new_admin(p_email TEXT, p_password TEXT)
RETURNS SETOF public.admins AS $$
BEGIN
    -- Authorization check: Ensure the caller is an existing admin
    IF NOT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()) THEN
        RAISE EXCEPTION 'Unauthorized: Caller is not an admin';
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
    IF NOT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()) THEN
        RAISE EXCEPTION 'Unauthorized: Caller is not an admin';
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
    IF NOT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()) THEN
        RAISE EXCEPTION 'Unauthorized: Caller is not an admin';
    END IF;

    RETURN QUERY
    SELECT * FROM public.admins ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.purge_admin_credential(p_admin_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()) THEN
        RAISE EXCEPTION 'Unauthorized: Caller is not an admin';
    END IF;

    DELETE FROM public.admins 
    WHERE id = p_admin_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant access ONLY to authenticated users (who will then be verified by the auth.uid() check inside)
GRANT EXECUTE ON FUNCTION public.provision_new_admin(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_admin_password(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_roster() TO authenticated;
GRANT EXECUTE ON FUNCTION public.purge_admin_credential(UUID) TO authenticated;
