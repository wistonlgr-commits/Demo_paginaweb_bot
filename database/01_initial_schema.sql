-- =====================================================
-- Migration: 01_initial_schema.sql
-- Description: Initial database schema for Bobby (n8n WhatsApp bot) 
--              and Psicobienestar Web Booking System
-- Created at: 2026-10-04
-- =====================================================

-- 1. MAIN LEADS & APPOINTMENTS TABLE (Bobby + Web)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number TEXT UNIQUE NOT NULL,
    "Nombre" TEXT,
    "Ciudad" TEXT,
    "Motivo_Consulta" TEXT,
    "Temperatura" TEXT DEFAULT 'TIBIO',
    "Dia_Cita" TEXT,                               -- YYYY-MM-DD
    "Hora_Cita" TEXT,                              -- HH:00
    "Estado_Cita" TEXT DEFAULT 'confirmed',        -- confirmed, pending, cancelled
    "Fuente" TEXT DEFAULT 'organic',               -- whatsapp, web, manual, instagram
    "Email" TEXT,
    "Pais" TEXT,
    "Notas" TEXT,
    "Ultima_Interaccion" TIMESTAMPTZ DEFAULT NOW(),
    "Conversacion_Abierta" BOOLEAN DEFAULT FALSE,
    "bot_is_typing" BOOLEAN DEFAULT FALSE,
    "requiere_asistencia_humana" TEXT,
    "chat_history" JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CALENDAR BLOCKS TABLE (Vacations, days off, hours)
CREATE TABLE IF NOT EXISTS public.agenda_bloqueos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo TEXT NOT NULL,                            -- 'hour', 'day', 'week'
    fecha TEXT NOT NULL,                           -- YYYY-MM-DD
    hora TEXT,                                     -- '10:00', 'ALL DAY', 'ALL WEEK'
    motivo TEXT DEFAULT 'Schedule Blocked',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BOT CONFIGURATION TABLE
CREATE TABLE IF NOT EXISTS public.bot_config (
    id INT PRIMARY KEY DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    saturday_enabled BOOLEAN DEFAULT FALSE,
    saturday_start TEXT DEFAULT '08:00',
    saturday_end TEXT DEFAULT '13:00',
    saturday_mode TEXT DEFAULT 'all',
    saturday_specific_dates JSONB DEFAULT '[]'::jsonb,
    saturday_consultation_type TEXT DEFAULT 'both',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default row
INSERT INTO public.bot_config (id, is_active) 
VALUES (1, true) 
ON CONFLICT (id) DO NOTHING;

-- 4. BOT QUALITY INCIDENT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.bot_quality_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    telefono TEXT,
    tipo_incidencia TEXT,
    respuesta_raw TEXT,
    respuesta_saneada TEXT,
    entrada_paciente TEXT,
    fecha_registro TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ENGLISH COMPATIBILITY VIEW FOR CLEAN API ACCESS
CREATE OR REPLACE VIEW public.appointments_view AS
SELECT 
    id,
    phone_number,
    "Nombre" AS patient_name,
    "Ciudad" AS city,
    "Motivo_Consulta" AS consultation_reason,
    "Temperatura" AS temperature,
    "Dia_Cita" AS appointment_date,
    "Hora_Cita" AS appointment_time,
    "Estado_Cita" AS status,
    "Fuente" AS source,
    "Email" AS email,
    "Pais" AS country,
    "Notas" AS notes,
    "Ultima_Interaccion" AS last_interaction,
    "Conversacion_Abierta" AS human_takeover,
    created_at
FROM public.leads
WHERE "Dia_Cita" IS NOT NULL AND "Dia_Cita" <> '';

-- 6. PERMISSIONS & REALTIME SYNC
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public full access on leads" ON public.leads FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.agenda_bloqueos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public full access on agenda_bloqueos" ON public.agenda_bloqueos FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.bot_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public full access on bot_config" ON public.bot_config FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.bot_quality_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public full access on bot_quality_logs" ON public.bot_quality_logs FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime events for live calendar updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agenda_bloqueos;
