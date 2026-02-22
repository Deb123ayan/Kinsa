-- SECURITY CONSOLIDATION MIGRATION
-- Objective: Close logic loops, restrict internal functions, and ensure admin visibility across the ledger.

-- 1. SECURE ADMIN STATUS CHECK
-- This function identifies if the current requesting user is a registered administrator.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if the current user (authenticated via Supabase Auth) 
    -- has an email that exists in the admins repository.
    RETURN EXISTS (
        SELECT 1 FROM public.admins
        WHERE user_id = auth.uid() 
        OR email = auth.jwt() ->> 'email'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RESTRICT ADMINISTRATIVE RPCs
-- Redefining existing functions to include security checks.
-- Revoke existing public access first.
REVOKE EXECUTE ON FUNCTION public.provision_new_admin(TEXT, TEXT) FROM public;
REVOKE EXECUTE ON FUNCTION public.reset_admin_password(UUID, TEXT) FROM public;
REVOKE EXECUTE ON FUNCTION public.get_admin_roster() FROM public;
REVOKE EXECUTE ON FUNCTION public.purge_admin_credential(UUID) FROM public;

-- Redefine provision_new_admin with internal check
CREATE OR REPLACE FUNCTION public.provision_new_admin(p_email TEXT, p_password TEXT)
RETURNS SETOF public.admins AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ACCESS: Administrative privileges required.';
    END IF;

    RETURN QUERY
    INSERT INTO public.admins (email, password_hash)
    VALUES (p_email, crypt(p_password, gen_salt('bf')))
    RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Redefine reset_admin_password with internal check
CREATE OR REPLACE FUNCTION public.reset_admin_password(p_admin_id UUID, p_new_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ACCESS: Administrative privileges required.';
    END IF;

    UPDATE public.admins 
    SET password_hash = crypt(p_new_password, gen_salt('bf'))
    WHERE id = p_admin_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Redefine get_admin_roster with internal check
CREATE OR REPLACE FUNCTION public.get_admin_roster()
RETURNS SETOF public.admins AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ACCESS: Administrative privileges required.';
    END IF;

    RETURN QUERY
    SELECT * FROM public.admins ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Redefine purge_admin_credential with internal check
CREATE OR REPLACE FUNCTION public.purge_admin_credential(p_admin_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ACCESS: Administrative privileges required.';
    END IF;

    DELETE FROM public.admins 
    WHERE id = p_admin_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Restore execution only for authenticated users (is_admin() check handles the rest)
GRANT EXECUTE ON FUNCTION public.provision_new_admin(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_admin_password(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_roster() TO authenticated;
GRANT EXECUTE ON FUNCTION public.purge_admin_credential(UUID) TO authenticated;

-- verify_admin_credentials MUST remain public as it is the login portal
GRANT EXECUTE ON FUNCTION public.verify_admin_credentials(TEXT, TEXT) TO public;


-- 3. GLOBAL ADMIN RLS POLICIES
-- Enabling the administrative panel to actually see the data across all tables.

-- For "order" table
-- First, drop the broad user update policy to prevent status manipulation
DROP POLICY IF EXISTS "Users can update their own orders" ON public."order";

CREATE POLICY "Admins can view all orders" ON public."order"
    FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all orders" ON public."order"
    FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete orders" ON public."order"
    FOR DELETE USING (public.is_admin());

-- For "Products" table (Fixing the vulnerability where any user could edit)
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON public."Products";
CREATE POLICY "Admins have full product control" ON public."Products"
    FOR ALL USING (public.is_admin());

-- For "contact_us" table
CREATE POLICY "Admins can view all inquiries" ON public.contact_us
    FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can manage inquiries" ON public.contact_us
    FOR ALL USING (public.is_admin());

-- For "payments" table
-- CRITICAL: Revoke broad user update access to prevent payment status manipulation
DROP POLICY IF EXISTS "Users can update their own payments" ON public.payments;

CREATE POLICY "Admins can view all payments" ON public.payments
    FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can manage payments" ON public.payments
    FOR ALL USING (public.is_admin());


-- 4. CLEANUP
-- Informational log entry to the schema
COMMENT ON FUNCTION public.is_admin() IS 'Security guard to verify administrative status based on auth context and admins table.';
