// =====================================================
// server.js
// Unified Fullstack Server (API + WebSockets + Web App)
// Connected to Supabase (PostgreSQL) for Bobby & Web
// =====================================================

import 'dotenv/config';
import WebSocket from 'ws';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { Server } from 'socket.io';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Polyfill native WebSocket for Node environments
if (!globalThis.WebSocket) {
  globalThis.WebSocket = WebSocket;
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Supabase Database Connection
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://eittsmxiqmzupwffghqy.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || ''; // Service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: WebSocket }
});

// Helper: Broadcast updated appointments to all connected clients
async function broadcastAppointments() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  try {
    const { data, error } = await supabase
      .from('appointments_view')
      .select('*')
      .order('appointment_date', { ascending: true });

    if (!error && data) {
      io.emit('appointments_updated', data);
    }
  } catch (err) {
    console.error('[Socket] Error broadcasting appointments:', err.message);
  }
}

// Helper: Broadcast updated schedule blocks
async function broadcastBlocks() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  try {
    const { data, error } = await supabase
      .from('agenda_bloqueos')
      .select('*')
      .order('fecha', { ascending: true });

    if (!error && data) {
      io.emit('blocks_updated', data);
    }
  } catch (err) {
    console.error('[Socket] Error broadcasting blocks:', err.message);
  }
}

// Debounce helper to prevent excessive broadcasts during rapid writes
let broadcastTimer = null;
function debouncedBroadcast() {
  if (broadcastTimer) clearTimeout(broadcastTimer);
  broadcastTimer = setTimeout(() => {
    broadcastAppointments();
    broadcastBlocks();
  }, 300);
}

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. Health & Status Check
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  if (SUPABASE_URL && SUPABASE_KEY) {
    const { error } = await supabase.from('bot_config').select('id').limit(1);
    dbStatus = error ? 'error' : 'connected';
  }
  res.json({
    status: 'online',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    connectedClients: io.engine.clientsCount
  });
});

// 2. Get All Appointments (Clean English View)
app.get('/api/appointments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('appointments_view')
      .select('*')
      .order('appointment_date', { ascending: true });

    if (error) throw error;
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Create or Upsert Appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const {
      patientName,
      phone,
      date,
      time,
      status = 'confirmed',
      source = 'web',
      email = '',
      country = 'Venezuela (UTC-4)',
      motive = 'General Consultation',
      notes = ''
    } = req.body;

    if (!phone || !date || !time) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: phone, date, and time are mandatory.'
      });
    }

    let phoneStr = String(phone).replace(/[^0-9]/g, '');
    if (phoneStr.startsWith('0') && phoneStr.length === 11) {
      phoneStr = '58' + phoneStr.substring(1);
    }

    const payload = {
      phone_number: phoneStr,
      Nombre: patientName || 'Patient',
      Dia_Cita: date,
      Hora_Cita: time,
      Estado_Cita: status,
      Fuente: source,
      Email: email,
      Pais: country,
      Motivo_Consulta: motive,
      Notas: notes,
      Temperatura: 'CALIENTE',
      Ultima_Interaccion: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('leads')
      .upsert(payload, { onConflict: 'phone_number' })
      .select();

    if (error) throw error;

    debouncedBroadcast();
    res.status(201).json({ success: true, data: data && data[0] ? data[0] : payload });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Update Appointment Status
app.patch('/api/appointments/:phone/status', async (req, res) => {
  try {
    const { phone } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required.' });
    }

    const { error } = await supabase
      .from('leads')
      .update({ Estado_Cita: status, updated_at: new Date().toISOString() })
      .eq('phone_number', phone);

    if (error) throw error;

    debouncedBroadcast();
    res.json({ success: true, message: 'Status updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Cancel / Delete Appointment
app.delete('/api/appointments/:phone', async (req, res) => {
  try {
    const { phone } = req.params;

    const { error } = await supabase
      .from('leads')
      .update({
        Dia_Cita: null,
        Hora_Cita: null,
        Estado_Cita: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('phone_number', phone);

    if (error) throw error;

    debouncedBroadcast();
    res.json({ success: true, message: 'Appointment cancelled successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Get Calendar Schedule Blocks
app.get('/api/blocks', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('agenda_bloqueos')
      .select('*')
      .order('fecha', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Add Calendar Block (hour, day, week)
app.post('/api/blocks', async (req, res) => {
  try {
    const { tipo = 'dia', fecha, hora, motivo = 'Schedule Blocked' } = req.body;

    if (!fecha) {
      return res.status(400).json({ success: false, error: 'Date (fecha) is required.' });
    }

    const newBlock = {
      tipo,
      fecha,
      hora: hora || (tipo === 'dia' ? 'TODO EL DIA' : (tipo === 'semana' ? 'TODA LA SEMANA' : '')),
      motivo
    };

    const { data, error } = await supabase
      .from('agenda_bloqueos')
      .insert([newBlock])
      .select();

    if (error) throw error;

    debouncedBroadcast();
    res.status(201).json({ success: true, data: data && data[0] ? data[0] : newBlock });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Delete Calendar Block
app.delete('/api/blocks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('agenda_bloqueos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    debouncedBroadcast();
    res.json({ success: true, message: 'Block removed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Bot Configuration & Status
app.get('/api/bot/config', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bot_config')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/bot/toggle', async (req, res) => {
  try {
    const { active } = req.body;
    const { error } = await supabase
      .from('bot_config')
      .upsert({ id: 1, is_active: active });

    if (error) throw error;

    io.emit('bot_status_changed', active);
    res.json({ success: true, active });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// STATIC FRONTEND ASSETS & MPA ROUTING
// ==========================================
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Clean URL Routing for Multi-Page Application
app.get('/agenda', (req, res) => {
  res.sendFile(path.join(distPath, 'agenda.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(distPath, 'admin.html'));
});

// Catch-all route to serve the main landing page (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ==========================================
// WEBSOCKET REALTIME CONNECTION
// ==========================================
io.on('connection', async (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Send initial data snapshot
  try {
    const { data: appointments } = await supabase.from('appointments_view').select('*');
    if (appointments) socket.emit('appointments_updated', appointments);

    const { data: blocks } = await supabase.from('agenda_bloqueos').select('*');
    if (blocks) socket.emit('blocks_updated', blocks);
  } catch (err) {
    console.error('[Socket] Initial snapshot error:', err.message);
  }

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Listen for Supabase Realtime Database Events
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase
    .channel('server-db-listener')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
      debouncedBroadcast();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'agenda_bloqueos' }, () => {
      debouncedBroadcast();
    })
    .subscribe();
}

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(`🚀 Unified Healthcare System Active`);
  console.log(`📡 Server running on http://0.0.0.0:${PORT}`);
  console.log(`🗄️ Connected to Supabase: ${SUPABASE_URL}`);
  console.log(`=========================================`);
});
