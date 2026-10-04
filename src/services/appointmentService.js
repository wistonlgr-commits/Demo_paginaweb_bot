// =====================================================
// appointmentService.js
// Clinical Appointment & Schedule Management Service
// Connected to Supabase (Single Source of Truth)
// =====================================================

import { supabase } from './supabaseClient';

const STORAGE_KEY = 'psicobienestarp_appointments_v1';
const BLOCKS_STORAGE_KEY = 'psicobienestarp_blocks_v1';
const SETTINGS_KEY = 'psicobienestarp_settings_v1';

export const WHATSAPP_PHONE = '584124335625'; // +58 412-4335625

// Master PIN SHA-256 Hash for Admin Access
export const MASTER_PIN_HASH = 'f9290b8ec13dbd54c61043ba2e10c3593fdd9eaee8c94a557d59d190a28c9741';

// Full working hours from 8:00 AM to 8:00 PM (including 1:00 PM / 13:00)
export const ALL_HOURS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00', // 1:00 PM
  '14:00', // 2:00 PM
  '15:00', // 3:00 PM
  '16:00', // 4:00 PM
  '17:00', // 5:00 PM
  '18:00', // 6:00 PM
  '19:00', // 7:00 PM
  '20:00'  // 8:00 PM
];

// Converts 'HH:mm' to total day minutes
export const timeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const parts = String(timeStr).trim().split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
};

// Formats 24h to friendly 12h representation (e.g., '13:00' -> '1:00 PM')
export const formatHour12 = (h24) => {
  if (!h24) return '';
  const parts = String(h24).trim().split(':');
  const h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  if (isNaN(h)) return h24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

// SHA-256 string hashing
export const hashPin = async (plainText) => {
  if (!plainText) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

const DEFAULT_SETTINGS = {
  pinHash: MASTER_PIN_HASH,
  psychologistName: 'Lic. Adriannis Rodríguez',
  defaultHours: ALL_HOURS,
  activeDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday
  sessionDurationMin: 60,
  blockedDates: [],
  scarcityPercent: 20, // Artificial scarcity percentage on public front
  timeZone: 'America/Caracas'
};

// ==========================================
// SETTINGS MANAGEMENT
// ==========================================
export const getSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    if (parsed.masterPin) {
      delete parsed.masterPin;
      parsed.pinHash = MASTER_PIN_HASH;
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed));
    }
    if (!parsed.pinHash) parsed.pinHash = MASTER_PIN_HASH;
    if (!parsed.defaultHours || parsed.defaultHours.length === 0) {
      parsed.defaultHours = ALL_HOURS;
    }
    if (parsed.scarcityPercent === undefined) parsed.scarcityPercent = 20;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (e) {
    console.error('[appointmentService] Error reading settings:', e);
    return DEFAULT_SETTINGS;
  }
};

export const updateSettings = (newSettings) => {
  try {
    const current = getSettings();
    const updated = { ...current, ...newSettings };
    if (updated.masterPin) delete updated.masterPin;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('psicobienestarp_settings_updated', { detail: updated }));
    return updated;
  } catch (e) {
    console.error('[appointmentService] Error saving settings:', e);
    return null;
  }
};

export const updatePinPassword = async (newPlainPin) => {
  if (!newPlainPin || newPlainPin.trim().length < 4) return false;
  const newHash = await hashPin(newPlainPin);
  return updateSettings({ pinHash: newHash });
};

export const verifyPin = async (inputPin) => {
  if (!inputPin) return false;
  try {
    const inputHash = await hashPin(inputPin);
    const settings = getSettings();
    const targetHash = settings.pinHash || MASTER_PIN_HASH;
    return inputHash === targetHash;
  } catch (e) {
    console.error('[appointmentService] Error verifying PIN:', e);
    return false;
  }
};

// ==========================================
// LOCAL STORAGE CACHE HELPERS
// ==========================================
export const getAppointments = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('[appointmentService] Error getting local appointments:', e);
    return [];
  }
};

export const getCalendarBlocks = () => {
  try {
    const raw = localStorage.getItem(BLOCKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('[appointmentService] Error getting local blocks:', e);
    return [];
  }
};

// Normalize database lead record into standard frontend appointment model
const mapLeadToAppointment = (lead) => ({
  id: lead.id,
  patientName: lead.Nombre || 'Paciente',
  phone: lead.phone_number || '',
  email: lead.Email || '',
  country: lead.Pais || 'Venezuela (UTC-4)',
  motive: lead.Motivo_Consulta || 'Consulta General',
  date: lead.Dia_Cita || '',
  time: lead.Hora_Cita || '',
  status: lead.Estado_Cita || 'confirmada',
  notes: lead.Notas || '',
  source: lead.Fuente || 'web',
  createdAt: lead.created_at || new Date().toISOString()
});

// ==========================================
// SYNC WITH SUPABASE (Source of Truth)
// ==========================================
export const syncAppointmentsWithServer = async () => {
  try {
    // 1. Fetch all scheduled appointments from Supabase leads table
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .not('Dia_Cita', 'is', null)
      .neq('Dia_Cita', '')
      .order('Dia_Cita', { ascending: true });

    if (leadsError) {
      console.warn('[appointmentService] Error querying leads:', leadsError.message);
    }

    // 2. Fetch all schedule blocks
    const { data: blocksData, error: blocksError } = await supabase
      .from('agenda_bloqueos')
      .select('*')
      .order('fecha', { ascending: true });

    if (blocksError) {
      console.warn('[appointmentService] Error querying agenda_bloqueos:', blocksError.message);
    }

    // Map and cache appointments
    if (leadsData && Array.isArray(leadsData)) {
      const appointments = leadsData.map(mapLeadToAppointment);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
      window.dispatchEvent(new CustomEvent('psicobienestarp_appointments_updated', { detail: appointments }));
      console.log(`[appointmentService] Synced ${appointments.length} appointments from Supabase.`);
    }

    // Cache blocks
    if (blocksData && Array.isArray(blocksData)) {
      localStorage.setItem(BLOCKS_STORAGE_KEY, JSON.stringify(blocksData));
      window.dispatchEvent(new CustomEvent('psicobienestarp_blocks_updated', { detail: blocksData }));
    }

    return getAppointments();
  } catch (err) {
    console.error('[appointmentService] syncAppointmentsWithServer exception:', err);
    return getAppointments();
  }
};

// ==========================================
// SAVE APPOINTMENT (Immediate UI + Supabase)
// ==========================================
export const saveAppointment = async (appointmentData) => {
  try {
    // Clean and normalize phone number for WhatsApp E.164 consistency
    let rawPhone = String(appointmentData.phone || '').replace(/[^0-9]/g, '');
    if (rawPhone.startsWith('0') && rawPhone.length === 11) {
      rawPhone = '58' + rawPhone.substring(1);
    }
    if (!rawPhone) {
      rawPhone = 'WEB-' + Date.now();
    }

    const newAppointment = {
      id: appointmentData.id || 'apt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      patientName: appointmentData.patientName ? appointmentData.patientName.trim() : 'Paciente',
      phone: rawPhone,
      email: appointmentData.email ? appointmentData.email.trim() : '',
      country: appointmentData.country || 'Venezuela (UTC-4)',
      motive: appointmentData.motive || 'Consulta General',
      date: appointmentData.date || new Date().toISOString().split('T')[0],
      time: appointmentData.time || '10:00',
      status: appointmentData.status || 'confirmada',
      notes: appointmentData.notes ? appointmentData.notes.trim() : '',
      source: appointmentData.source || 'web',
      createdAt: new Date().toISOString()
    };

    // 1. Optimistic Local Cache Update
    const currentList = getAppointments();
    const updatedList = [newAppointment, ...currentList.filter((a) => a.id !== newAppointment.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent('psicobienestarp_appointments_updated', { detail: updatedList }));

    // 2. Persist to Supabase leads table
    const leadPayload = {
      phone_number: rawPhone,
      Nombre: newAppointment.patientName,
      Dia_Cita: newAppointment.date,
      Hora_Cita: newAppointment.time,
      Estado_Cita: newAppointment.status,
      Fuente: newAppointment.source,
      Email: newAppointment.email,
      Pais: newAppointment.country,
      Motivo_Consulta: newAppointment.motive,
      Notas: newAppointment.notes,
      Temperatura: 'CALIENTE',
      Ultima_Interaccion: new Date().toISOString()
    };

    // Upsert into Supabase (matched by phone_number)
    const { error: upsertError } = await supabase
      .from('leads')
      .upsert(leadPayload, { onConflict: 'phone_number' });

    if (upsertError) {
      console.warn('[appointmentService] Supabase upsert error:', upsertError.message);
    } else {
      console.log('[appointmentService] Appointment successfully persisted to Supabase.');
    }

    return newAppointment;
  } catch (e) {
    console.error('[appointmentService] Error saving appointment:', e);
    return null;
  }
};

// ==========================================
// UPDATE APPOINTMENT STATUS
// ==========================================
export const updateAppointmentStatus = async (id, newStatus) => {
  try {
    const list = getAppointments();
    const target = list.find((a) => a.id === id);
    const updated = list.map((a) => (a.id === id ? { ...a, status: newStatus } : a));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('psicobienestarp_appointments_updated', { detail: updated }));

    if (target && target.phone) {
      await supabase
        .from('leads')
        .update({ Estado_Cita: newStatus })
        .eq('phone_number', target.phone);
    }

    return updated;
  } catch (e) {
    console.error('[appointmentService] Error updating appointment status:', e);
    return null;
  }
};

// ==========================================
// DELETE / CANCEL APPOINTMENT
// ==========================================
export const deleteAppointment = async (id) => {
  try {
    const list = getAppointments();
    const target = list.find((a) => a.id === id);
    const filtered = list.filter((a) => a.id !== id);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('psicobienestarp_appointments_updated', { detail: filtered }));

    if (target && target.phone) {
      // Clear appointment slot in Supabase
      await supabase
        .from('leads')
        .update({
          Dia_Cita: null,
          Hora_Cita: null,
          Estado_Cita: 'cancelada'
        })
        .eq('phone_number', target.phone);
    }

    return filtered;
  } catch (e) {
    console.error('[appointmentService] Error deleting appointment:', e);
    return null;
  }
};

// ==========================================
// CALENDAR BLOCKS MANAGEMENT
// ==========================================
export const addCalendarBlock = async (blockData) => {
  try {
    const payload = {
      tipo: blockData.tipo || 'dia',
      fecha: blockData.fecha,
      hora: blockData.hora || (blockData.tipo === 'dia' ? 'TODO EL DIA' : 'TODA LA SEMANA'),
      motivo: blockData.motivo || 'Agenda Bloqueada'
    };

    const { data, error } = await supabase
      .from('agenda_bloqueos')
      .insert([payload])
      .select();

    if (error) throw error;

    await syncAppointmentsWithServer();
    return data && data[0] ? data[0] : payload;
  } catch (e) {
    console.error('[appointmentService] Error creating calendar block:', e);
    return null;
  }
};

export const deleteCalendarBlock = async (id) => {
  try {
    const { error } = await supabase
      .from('agenda_bloqueos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await syncAppointmentsWithServer();
    return true;
  } catch (e) {
    console.error('[appointmentService] Error deleting calendar block:', e);
    return false;
  }
};

// ==========================================
// CONFLICT & AVAILABILITY ENGINE
// ==========================================
export const checkSlotConflict = (dateString, candidateTimeStr) => {
  const candMin = timeToMinutes(candidateTimeStr);
  if (candMin === null) return { conflicted: false };

  // 1. Check dedicated agenda_bloqueos
  const blocks = getCalendarBlocks();
  for (const blk of blocks) {
    if (blk.fecha === dateString) {
      const hRaw = (blk.hora || '').toUpperCase();
      if (blk.tipo === 'dia' || hRaw.includes('TODO EL DIA') || hRaw.includes('ALL DAY')) {
        return {
          conflicted: true,
          reason: 'block_day',
          message: `Día bloqueado: ${blk.motivo || 'Agenda cerrada'}`
        };
      }
      if (blk.tipo === 'hora' || hRaw.includes(candidateTimeStr)) {
        return {
          conflicted: true,
          reason: 'block_hour',
          message: `Horario bloqueado: ${blk.motivo || 'Compromiso clínico'}`
        };
      }
    }
  }

  // 2. Check scheduled appointments (with 1h before & 2h after buffer rules)
  const appointments = getAppointments();
  const dayAppointments = appointments.filter(
    (a) => a.date === dateString && a.status !== 'cancelada'
  );

  for (const apt of dayAppointments) {
    const aptMin = timeToMinutes(apt.time);
    if (aptMin === null) continue;

    // Exact appointment match
    if (candMin === aptMin) {
      return {
        conflicted: true,
        reason: 'booked',
        message: `Horario ocupado por cita médica (${formatHour12(apt.time)})`
      };
    }

    // 1 hour buffer before consultation: [aptMin - 60, aptMin)
    if (candMin >= aptMin - 60 && candMin < aptMin) {
      return {
        conflicted: true,
        reason: 'buffer_before',
        message: `No disponible: 1 hora previa a consulta de las ${formatHour12(apt.time)}`
      };
    }

    // 2 hours buffer after consultation: (aptMin, aptMin + 180) (60 min session + 120 min rest)
    if (candMin > aptMin && candMin < aptMin + 180) {
      return {
        conflicted: true,
        reason: 'buffer_after',
        message: `No disponible: descanso clínico posterior a consulta de las ${formatHour12(apt.time)}`
      };
    }
  }

  return { conflicted: false };
};

export const getAvailableSlotsForDate = (dateString, forAdmin = false) => {
  const settings = getSettings();
  const selectedDate = new Date(dateString + 'T00:00:00');
  const dayOfWeek = selectedDate.getDay(); // 0: Sunday, 1: Monday, etc.

  // Check if day is inactive or explicitly in blockedDates array
  if (!settings.activeDays.includes(dayOfWeek) || settings.blockedDates.includes(dateString)) {
    return [];
  }

  const hoursToUse = (settings.defaultHours && settings.defaultHours.length > 0)
    ? settings.defaultHours
    : ALL_HOURS;

  const scarcity = (settings.scarcityPercent !== undefined && !forAdmin)
    ? Number(settings.scarcityPercent)
    : 0;

  return hoursToUse.map((hour) => {
    // 1. Conflict check against real appointments and blocks
    const conflict = checkSlotConflict(dateString, hour);
    if (conflict.conflicted) {
      return {
        hour,
        formatted: formatHour12(hour),
        available: false,
        isRealBooking: conflict.reason === 'booked',
        isBufferBlocked: conflict.reason.startsWith('buffer_'),
        isManualBlock: conflict.reason.startsWith('block_'),
        conflictReason: conflict.message
      };
    }

    // 2. Synthetic scarcity algorithm (only for public front)
    if (scarcity > 0 && !forAdmin) {
      const seedStr = `${dateString}-${hour}-psi`;
      let hash = 0;
      for (let i = 0; i < seedStr.length; i++) {
        hash = (hash << 5) - hash + seedStr.charCodeAt(i);
        hash |= 0;
      }
      const score = Math.abs(hash) % 100;
      if (score < scarcity) {
        return {
          hour,
          formatted: formatHour12(hour),
          available: false,
          isSyntheticScarcity: true,
          conflictReason: 'Cupo de atención ocupado'
        };
      }
    }

    return {
      hour,
      formatted: formatHour12(hour),
      available: true
    };
  });
};

// ==========================================
// WHATSAPP LINK GENERATOR
// ==========================================
export const generateWhatsAppLink = (appointment) => {
  const directBase = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}`;
  if (!appointment) return directBase;

  const patientName = appointment.patientName || 'Paciente';
  const date = appointment.date || '';
  const time = appointment.time || '';
  const formattedTime = formatHour12(time) || time;
  const country = appointment.country || 'Online';
  const motive = appointment.motive || 'Consulta Psicológica';
  const notes = appointment.notes || '';

  let friendlyDate = date;
  if (date) {
    try {
      const d = new Date(date + 'T00:00:00');
      friendlyDate = d.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      friendlyDate = date;
    }
  }

  const message = 
`¡Hola Lic. Adriannis! ✨
Acabo de registrar una solicitud de cita en *PsicobienestarP*:

🔹 *Paciente:* ${patientName}
🔹 *Fecha:* ${friendlyDate}
🔹 *Hora:* ${formattedTime} (${time} Hora Venezuela / ${country})
🔹 *Motivo:* ${motive}
${notes ? `🔹 *Nota breve:* ${notes}\n` : ''}
¿Tienen disponibilidad en esa fecha y horario para confirmar mi sesión? ¡Muchas gracias!`;

  return `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(message)}`;
};

// ==========================================
// REALTIME SUBSCRIPTION LISTENER
// ==========================================
if (typeof window !== 'undefined') {
  // Listen for live database changes from Supabase (WhatsApp bot or Admin updates)
  supabase
    .channel('realtime_leads_and_blocks')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
      console.log('[appointmentService] Live update received on leads.');
      syncAppointmentsWithServer();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'agenda_bloqueos' }, () => {
      console.log('[appointmentService] Live update received on agenda_bloqueos.');
      syncAppointmentsWithServer();
    })
    .subscribe();
}
