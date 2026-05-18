-- Migration: Data Partitioning
-- Implements PostgreSQL Declarative Partitioning for the audit_logs table.
-- As logs grow into millions of rows, querying a monolithic table becomes slow. 
-- Partitioning by date ensures that querying recent logs remains lightning fast.

-- Drop the unpartitioned table created in the previous migration
DROP TABLE IF EXISTS public.audit_logs CASCADE;

-- Recreate as a partitioned table by range (created_at)
CREATE TABLE public.audit_logs (
    id UUID DEFAULT gen_random_uuid(),
    actor_id UUID, -- auth.uid()
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    PRIMARY KEY (id, created_at) -- The partition key MUST be part of the primary key
) PARTITION BY RANGE (created_at);

-- Create monthly partitions (In a production system, a cron job pg_cron would automate this)
CREATE TABLE public.audit_logs_y2026m02 PARTITION OF public.audit_logs
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE public.audit_logs_y2026m03 PARTITION OF public.audit_logs
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

CREATE TABLE public.audit_logs_y2026m04 PARTITION OF public.audit_logs
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

CREATE TABLE public.audit_logs_y2026m05 PARTITION OF public.audit_logs
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

CREATE TABLE public.audit_logs_y2026m06 PARTITION OF public.audit_logs
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

-- A default partition to act as a safety net if a monthly partition hasn't been created yet
CREATE TABLE public.audit_logs_default PARTITION OF public.audit_logs DEFAULT;

-- Re-apply performance indexes (these will apply to all partitions automatically)
CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Re-apply RLS Policies for Zero Trust
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

CREATE POLICY "No one can modify audit logs" ON public.audit_logs FOR UPDATE USING (false);
CREATE POLICY "No one can delete audit logs" ON public.audit_logs FOR DELETE USING (false);
