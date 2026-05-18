-- 1. Search Systems: Full-Text Search & Inverted Indexes
-- Adding a tsvector column for lightning-fast text search on Products
ALTER TABLE public."Products" 
ADD COLUMN IF NOT EXISTS fts tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(name, '')), 'A') || 
  setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(code, '')), 'C')
) STORED;

-- Create a GIN (Generalized Inverted Index) for the tsvector column
CREATE INDEX IF NOT EXISTS products_fts_idx ON public."Products" USING GIN (fts);

-- 2. CQRS & Materialized Views (Analytics & Data Engineering)
-- Separating the "Write" path from the "Read" path for Dashboard Analytics

-- Drop the view if it exists to allow re-running the migration safely
DROP MATERIALIZED VIEW IF EXISTS public.admin_analytics;

-- Create the Materialized View
CREATE MATERIALIZED VIEW public.admin_analytics AS
SELECT 
    1 as id, -- Dummy ID for the unique index
    COUNT(o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_sales,
    COUNT(o.id) FILTER (WHERE status IN ('pending', 'in transit')) as active_orders
FROM public."order" o;

-- Create a UNIQUE index on the materialized view (Required for CONCURRENTLY refreshes)
CREATE UNIQUE INDEX IF NOT EXISTS admin_analytics_unique_idx ON public.admin_analytics(id);

-- Create a function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_admin_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.admin_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Expose the refresh function via RPC so the admin dashboard can trigger a refresh manually if needed
-- Or it can be called by pg_cron
-- e.g., SELECT cron.schedule('refresh_analytics', '* * * * *', 'SELECT refresh_admin_analytics()');

-- 3. Event-Driven Architecture & WebSockets (Messaging)
-- Enable Supabase Realtime for the "order" table to push instant notifications

DO $$
BEGIN
  -- Check if the supabase_realtime publication exists (it should on Supabase projects)
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    -- Check if the table is already in the publication to avoid errors
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'order'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public."order";
    END IF;
  ELSE
    -- For local environments where supabase_realtime might not exist, create it
    CREATE PUBLICATION supabase_realtime FOR TABLE public."order";
  END IF;
END
$$;
