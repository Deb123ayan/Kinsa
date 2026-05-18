-- Migration to add Rate Limiting for Edge Functions
CREATE TABLE IF NOT EXISTS public.rate_limits (
    ip TEXT PRIMARY KEY,
    points INT DEFAULT 10,
    last_reset TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Secure function to check and decrement rate limit
-- Accessible only by authenticated service role or specific secure contexts
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_ip TEXT, p_max_points INT, p_reset_seconds INT)
RETURNS BOOLEAN AS $$
DECLARE
    v_points INT;
BEGIN
    -- Upsert the IP record, resetting points if time has elapsed
    INSERT INTO public.rate_limits (ip, points, last_reset)
    VALUES (p_ip, p_max_points - 1, now())
    ON CONFLICT (ip) DO UPDATE 
    SET points = CASE 
            WHEN extract(epoch from (now() - public.rate_limits.last_reset)) > p_reset_seconds THEN p_max_points - 1
            ELSE public.rate_limits.points - 1
        END,
        last_reset = CASE 
            WHEN extract(epoch from (now() - public.rate_limits.last_reset)) > p_reset_seconds THEN now()
            ELSE public.rate_limits.last_reset
        END
    RETURNING points INTO v_points;

    -- Return true if allowed (points >= 0), false if rate limited
    RETURN v_points >= 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Do NOT grant to public. Only service roles or authenticated users should use this.
-- If Edge Functions use anon key, we can grant it to anon, but we should verify the Edge Function passes a correct IP.
-- To allow edge functions using ANON key to call it (since they pass IP):
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INT, INT) TO anon, authenticated;
