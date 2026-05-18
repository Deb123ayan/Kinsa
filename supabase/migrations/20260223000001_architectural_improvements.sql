-- Migration: Architectural Improvements
-- Implements principles from the System Design Reference: Observability, Scalability, and Resilience

-- ==========================================
-- 1. Observability: Zero Trust Audit Logging
-- ==========================================
-- Logs sensitive actions to maintain an immutable record of who did what.

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID, -- usually maps to auth.uid()
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Optimize queries for common access patterns (Observability indexing)
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Secure the audit logs via RLS (Zero Trust Architecture)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

-- Audit logs are strictly append-only. Nobody can update or delete.
CREATE POLICY "No one can modify audit logs" ON public.audit_logs FOR UPDATE USING (false);
CREATE POLICY "No one can delete audit logs" ON public.audit_logs FOR DELETE USING (false);

-- Secure function to write audit logs (Security Definer elevates privileges temporarily to insert)
CREATE OR REPLACE FUNCTION public.log_audit_event(
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL,
    p_ip TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata, ip_address)
    VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_metadata, p_ip);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- 2. Scalability: Token Bucket Rate Limiting
-- ==========================================
-- Replaces naive fixed-window with a robust Token Bucket algorithm to handle burst traffic gracefully.

CREATE TABLE IF NOT EXISTS public.token_buckets (
    key TEXT PRIMARY KEY,
    tokens FLOAT NOT NULL,
    last_refill TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Optimize for fast lookups
ALTER TABLE public.token_buckets ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.consume_token(
    p_key TEXT,
    p_bucket_capacity FLOAT,
    p_refill_rate_per_second FLOAT,
    p_tokens_to_consume FLOAT DEFAULT 1.0
) RETURNS BOOLEAN AS $$
DECLARE
    v_current_tokens FLOAT;
    v_last_refill TIMESTAMP WITH TIME ZONE;
    v_now TIMESTAMP WITH TIME ZONE := now();
    v_time_passed FLOAT;
    v_new_tokens FLOAT;
BEGIN
    -- Read current state with an exclusive row lock
    SELECT tokens, last_refill INTO v_current_tokens, v_last_refill
    FROM public.token_buckets
    WHERE key = p_key
    FOR UPDATE;

    IF NOT FOUND THEN
        -- Initial insert: bucket is full, consume tokens immediately
        v_current_tokens := p_bucket_capacity;
        v_last_refill := v_now;
        
        INSERT INTO public.token_buckets (key, tokens, last_refill)
        VALUES (p_key, v_current_tokens - p_tokens_to_consume, v_now);
        
        RETURN p_tokens_to_consume <= p_bucket_capacity;
    END IF;

    -- Calculate how many tokens we've regenerated since the last request
    v_time_passed := extract(epoch from (v_now - v_last_refill));
    v_new_tokens := least(p_bucket_capacity, v_current_tokens + (v_time_passed * p_refill_rate_per_second));

    -- Check if we have enough tokens to fulfill the request
    IF v_new_tokens >= p_tokens_to_consume THEN
        UPDATE public.token_buckets
        SET tokens = v_new_tokens - p_tokens_to_consume,
            last_refill = v_now
        WHERE key = p_key;
        RETURN TRUE;
    ELSE
        -- Not enough tokens, just update the generated tokens and reject
        UPDATE public.token_buckets
        SET tokens = v_new_tokens,
            last_refill = v_now
        WHERE key = p_key;
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution for service roles or authenticated users
GRANT EXECUTE ON FUNCTION public.consume_token(TEXT, FLOAT, FLOAT, FLOAT) TO anon, authenticated;
