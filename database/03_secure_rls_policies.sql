-- =====================================================
-- Migration: 03_secure_rls_policies.sql
-- Description: Locks down the database tables so that 
--              they can only be accessed by authenticated users
--              (i.e., the psychologist dashboard via the PIN).
--              The n8n Bot uses the Service Role Key, so it bypasses RLS
--              and will continue working normally.
-- =====================================================

-- 1. Secure 'leads' table
DROP POLICY IF EXISTS "Allow public full access on leads" ON public.leads;
CREATE POLICY "Allow authenticated full access on leads" ON public.leads
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 2. Secure 'agenda_bloqueos' table
DROP POLICY IF EXISTS "Allow public full access on agenda_bloqueos" ON public.agenda_bloqueos;
CREATE POLICY "Allow authenticated full access on agenda_bloqueos" ON public.agenda_bloqueos
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 3. Secure 'bot_config' table
DROP POLICY IF EXISTS "Allow public full access on bot_config" ON public.bot_config;
CREATE POLICY "Allow authenticated full access on bot_config" ON public.bot_config
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 4. Secure 'bot_quality_logs' table
DROP POLICY IF EXISTS "Allow public full access on bot_quality_logs" ON public.bot_quality_logs;
CREATE POLICY "Allow authenticated full access on bot_quality_logs" ON public.bot_quality_logs
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

