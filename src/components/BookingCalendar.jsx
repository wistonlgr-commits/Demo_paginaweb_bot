import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Globe, 
  HelpCircle, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  MessageCircle, 
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import { 
  getAvailableSlotsForDate, 
  saveAppointment, 
  generateWhatsAppLink,
  formatHour12,
  syncAppointmentsWithServer,
  timeToMinutes,
  checkSlotConflict,
  WHATSAPP_PHONE 
} from '../services/appointmentService';
import './BookingCalendar.css';

const TIMEZONES = [
  { label: 'Venezuela (UTC-4)', value: 'Venezuela (UTC-4)' },
  { label: 'España / Europa Central (UTC+2)', value: 'España (UTC+2)' },
  { label: 'Estados Unidos - Florida / Este (UTC-4)', value: 'EE.UU. Este (UTC-4)' },
  { label: 'Colombia / Perú / Ecuador (UTC-5)', value: 'Colombia/Perú (UTC-5)' },
  { label: 'Chile / Argentina / Uruguay (UTC-3)', value: 'Chile/Argentina (UTC-3)' },
  { label: 'México / Centroamérica (UTC-6)', value: 'México (UTC-6)' },
  { label: 'Otro país / Zona horaria', value: 'Internacional' }
];

const MOTIVES = [
  'Ansiedad y gestión emocional',
  'Duelo y pérdidas',
  'Autoestima y límites',
  'Terapia de pareja',
  'Autosabotaje y hábitos',
  'Duelo migratorio y adaptación',
  'Estrés laboral y burnout',
  'Consulta psicológica general'
];

export default function BookingCalendar({ preselectedMotive }) {
  // Calendar month state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [customTimeInput, setCustomTimeInput] = useState('');
  const [customTimeError, setCustomTimeError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    country: 'Venezuela (UTC-4)',
    motive: preselectedMotive || 'Ansiedad y gestión emocional',
    notes: '',
    website_hp: ''
  });

  // Modal State
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Sync preselected motive from outside
  useEffect(() => {
    if (preselectedMotive) {
      setFormData((prev) => ({ ...prev, motive: preselectedMotive }));
    }
  }, [preselectedMotive]);

  // Set default selected date (tomorrow or next available business day)
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    // If tomorrow is Sunday, jump to Monday
    if (tomorrow.getDay() === 0) {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    const defaultDateStr = `${yyyy}-${mm}-${dd}`;
    
    setSelectedDate(defaultDateStr);
    loadSlots(defaultDateStr);

    // Sincronizar citas y ajustes con el servidor SiteGround
    syncAppointmentsWithServer().then(() => {
      loadSlots(defaultDateStr);
    });

    const handleUpdate = () => {
      loadSlots(selectedDate || defaultDateStr);
    };
    window.addEventListener('psicobienestarp_appointments_updated', handleUpdate);
    window.addEventListener('psicobienestarp_settings_updated', handleUpdate);
    return () => {
      window.removeEventListener('psicobienestarp_appointments_updated', handleUpdate);
      window.removeEventListener('psicobienestarp_settings_updated', handleUpdate);
    };
  }, []);

  const loadSlots = (dateStr) => {
    const slots = getAvailableSlotsForDate(dateStr);
    setAvailableSlots(slots);
    setCustomTimeError('');
    // Auto-select first available slot if previous is invalid
    const firstAvail = slots.find((s) => s.available);
    const chosen = firstAvail ? firstAvail.hour : '';
    setSelectedSlot(chosen);
    setCustomTimeInput(chosen);
  };

  const handleSlotSelect = (hour) => {
    setSelectedSlot(hour);
    setCustomTimeInput(hour);
    setCustomTimeError('');
  };

  const handleCustomTimeChange = (e) => {
    const val = e.target.value;
    setCustomTimeInput(val);
    setCustomTimeError('');

    if (!val) {
      setSelectedSlot('');
      return;
    }

    const min = timeToMinutes(val);
    if (min === null) {
      setCustomTimeError('Por favor ingresa un formato de hora válido.');
      return;
    }

    // Rango hábil: 7:00 AM (420 min) a 8:00 PM (1200 min)
    if (min < 420 || min > 1200) {
      setCustomTimeError('El horario de atención es de 7:00 AM a 8:00 PM (Hora Venezuela).');
      return;
    }

    // Validación de conflicto y buffer clínico (1h antes, 2h después)
    const conflict = checkSlotConflict(selectedDate, val);
    if (conflict.conflicted) {
      setCustomTimeError(conflict.message);
      setSelectedSlot('');
      return;
    }

    setSelectedSlot(val);
  };

  const handleDateClick = (dateStr) => {
    setSelectedDate(dateStr);
    loadSlots(dateStr);
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Generate calendar days for current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    daysArray.push(`${year}-${mm}-${dd}`);
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedDate) {
      setFormError('Por favor selecciona una fecha en el calendario.');
      return;
    }
    if (!selectedSlot) {
      setFormError(customTimeError || 'Por favor selecciona o escribe un horario válido.');
      return;
    }
    if (customTimeError) {
      setFormError(customTimeError);
      return;
    }
    if (!formData.patientName.trim()) {
      setFormError('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!formData.phone.trim()) {
      setFormError('Por favor ingresa tu número de WhatsApp para contactarte.');
      return;
    }

    setIsSubmitting(true);

    const appointmentPayload = {
      patientName: formData.patientName.trim(),
      phone: formData.phone.trim(),
      country: formData.country,
      motive: formData.motive,
      date: selectedDate,
      time: selectedSlot,
      notes: formData.notes.trim(),
      website_hp: formData.website_hp || ''
    };

    const saved = saveAppointment(appointmentPayload);
    setIsSubmitting(false);

    if (saved) {
      setConfirmedAppointment(saved);
      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // fallback
      }
    } else {
      setFormError('Ocurrió un error al procesar la cita. Intenta de nuevo.');
    }
  };

  const formattedSelectedDate = () => {
    if (!selectedDate) return '';
    try {
      const d = new Date(selectedDate + 'T00:00:00');
      return d.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return selectedDate;
    }
  };

  return (
    <section id="agendar" className="booking-section section-padding">
      <div className="container">
        {/* Header */}
        <div className="booking-header text-center fade-in-on-scroll">
          <div className="section-badge">
            <CalendarIcon size={16} />
            <span>Agenda Online Interactiva</span>
          </div>
          <h2 className="section-title">
            Valida tu Disponibilidad <br />
            <span className="text-gradient">y Da el Primer Paso a Tu Bienestar</span>
          </h2>
          <p className="section-subtitle">
            Selecciona el día y horario que mejor se adapte a tu rutina. Tras registrar tus datos,
            confirmaremos la cita directamente por WhatsApp para coordinar detalles y métodos de pago.
          </p>
        </div>

        {/* Calendar & Form Card */}
        <div className="booking-card glass-card is-visible">
          <div className="booking-grid">
            {/* Left: Interactive Calendar & Slot Picker */}
            <div className="calendar-side">
              <div className="calendar-header-bar">
                <h3 className="month-label">
                  {monthNames[month]} {year}
                </h3>
                <div className="month-nav-btns">
                  <button onClick={prevMonth} className="btn-nav-month" aria-label="Mes anterior">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={nextMonth} className="btn-nav-month" aria-label="Mes siguiente">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Day names */}
              <div className="weekdays-grid">
                <span>Lun</span>
                <span>Mar</span>
                <span>Mié</span>
                <span>Jue</span>
                <span>Vie</span>
                <span>Sáb</span>
                <span>Dom</span>
              </div>

              {/* Days Grid */}
              <div className="days-grid">
                {daysArray.map((dateStr, idx) => {
                  if (!dateStr) {
                    return <div key={`empty-${idx}`} className="day-cell empty"></div>;
                  }

                  const dayNum = parseInt(dateStr.split('-')[2], 10);
                  const isPast = dateStr < todayStr;
                  const dayObj = new Date(dateStr + 'T00:00:00');
                  const isSunday = dayObj.getDay() === 0;
                  const isDisabled = isPast || isSunday;
                  const isSelected = dateStr === selectedDate;
                  const isToday = dateStr === todayStr;

                  return (
                    <button
                      key={dateStr}
                      disabled={isDisabled}
                      onClick={() => handleDateClick(dateStr)}
                      className={`day-cell ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''} ${isToday ? 'today' : ''}`}
                    >
                      <span className="day-number">{dayNum}</span>
                      {!isDisabled && <span className="day-dot"></span>}
                    </button>
                  );
                })}
              </div>

              {/* Slots Section */}
              <div className="slots-container">
                <div className="slots-header">
                  <div className="slots-title">
                    <Clock size={18} className="text-teal" />
                    <span>Horarios Disponibles</span>
                  </div>
                  <span className="slots-sub">Sesión: 60 minutos (Hora Venezuela) 🌸</span>
                </div>

                {availableSlots.length === 0 ? (
                  <div className="no-slots-alert">
                    <span>No hay horarios hábiles en la fecha seleccionada. Por favor elige otro día.</span>
                  </div>
                ) : (
                  <div className="slots-chips-grid">
                    {availableSlots.map(({ hour, available, formatted }) => (
                      <button
                        key={hour}
                        type="button"
                        disabled={!available}
                        onClick={() => handleSlotSelect(hour)}
                        className={`slot-chip ${selectedSlot === hour ? 'active' : ''} ${!available ? 'booked' : ''}`}
                      >
                        <span>{formatted || formatHour12(hour)}</span>
                        {!available && <span className="booked-tag">Ocupado</span>}
                      </button>
                    ))}
                  </div>
                )}

                {/* Opción de escribir hora manual (7:00 AM a 8:00 PM) */}
                <div className="custom-time-picker-box">
                  <div className="custom-time-label-row">
                    <label htmlFor="custom-time-input" className="custom-time-label">
                      ¿Prefieres escribir otra hora específica?
                    </label>
                    <span className="custom-time-hint">Rango de 7:00 AM a 8:00 PM</span>
                  </div>
                  <div className="custom-time-input-group">
                    <input
                      id="custom-time-input"
                      type="time"
                      min="07:00"
                      max="20:00"
                      list="patient-custom-hours"
                      value={customTimeInput}
                      onChange={handleCustomTimeChange}
                      placeholder="HH:MM (ej. 07:30)"
                      className={`custom-time-input ${customTimeError ? 'has-error' : ''}`}
                    />
                    <datalist id="patient-custom-hours">
                      <option value="07:00">07:00 AM</option>
                      <option value="07:30">07:30 AM</option>
                      <option value="08:00">08:00 AM</option>
                      <option value="08:30">08:30 AM</option>
                      <option value="09:00">09:00 AM</option>
                      <option value="09:30">09:30 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="10:30">10:30 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="11:30">11:30 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="12:30">12:30 PM</option>
                      <option value="13:00">01:00 PM</option>
                      <option value="13:30">01:30 PM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="14:30">02:30 PM</option>
                      <option value="15:00">03:00 PM</option>
                      <option value="15:30">03:30 PM</option>
                      <option value="16:00">04:00 PM</option>
                      <option value="16:30">04:30 PM</option>
                      <option value="17:00">05:00 PM</option>
                      <option value="17:30">05:30 PM</option>
                      <option value="18:00">06:00 PM</option>
                      <option value="18:30">06:30 PM</option>
                      <option value="19:00">07:00 PM</option>
                      <option value="19:30">07:30 PM</option>
                      <option value="20:00">08:00 PM</option>
                    </datalist>
                  </div>
                  {customTimeError ? (
                    <p className="custom-time-error-msg">⚠️ {customTimeError}</p>
                  ) : selectedSlot ? (
                    <p className="custom-time-selected-preview">
                      ✓ Horario elegido: <strong>{formatHour12(selectedSlot)}</strong> ({selectedSlot} Hora Venezuela)
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Right: Booking Form */}
            <div className="form-side">
              <div className="form-header-badge">
                <Sparkles size={16} />
                <span>Resumen de tu selección</span>
              </div>

              <div className="selection-summary-card">
                <div className="summary-item">
                  <CalendarIcon size={18} className="text-teal" />
                  <div>
                    <span className="summary-label">Fecha elegida:</span>
                    <strong className="summary-val capitalize">{formattedSelectedDate()}</strong>
                  </div>
                </div>
                <div className="summary-item">
                  <Clock size={18} className="text-teal" />
                  <div>
                    <span className="summary-label">Hora:</span>
                    <strong className="summary-val">
                      {selectedSlot ? `${formatHour12(selectedSlot)} (${selectedSlot})` : 'Selecciona o escribe un horario'}
                    </strong>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="appointment-form">
                {/* Honeypot anti-spam oculto */}
                <input
                  type="text"
                  name="website_hp"
                  tabIndex={-1}
                  autoComplete="off"
                  style={{ display: 'none', position: 'absolute', left: '-9999px', opacity: 0 }}
                  value={formData.website_hp || ''}
                  onChange={(e) => setFormData({ ...formData, website_hp: e.target.value })}
                />

                {formError && (
                  <div className="form-error-banner">
                    {formError}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="patientName">
                    <User size={16} /> Nombre y Apellido *
                  </label>
                  <input
                    type="text"
                    id="patientName"
                    required
                    placeholder="Ej. María Pérez"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">
                    <Phone size={16} /> WhatsApp / Teléfono de Contacto *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    placeholder="Ej. +58 412 1234567 o +34 612 345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  <span className="input-hint">Incluye código de país para contactarte por WhatsApp</span>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="country">
                      <Globe size={16} /> País / Zona Horaria
                    </label>
                    <select
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz.value} value={tz.value}>{tz.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="motive">
                      <HelpCircle size={16} /> Motivo Principal
                    </label>
                    <select
                      id="motive"
                      value={formData.motive}
                      onChange={(e) => setFormData({ ...formData, motive: e.target.value })}
                    >
                      {MOTIVES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="notes">
                    Nota breve o qué te motiva a consultar (Opcional)
                  </label>
                  <textarea
                    id="notes"
                    rows="2"
                    placeholder="Cuéntame brevemente qué esperas de tus sesiones..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedSlot}
                  className="btn btn-primary btn-submit-booking"
                >
                  <Check size={20} />
                  <span>{isSubmitting ? 'Registrando...' : 'Validar Cita y Continuar'}</span>
                </button>

                <div className="guarantee-note">
                  <ShieldCheck size={16} className="text-teal" />
                  <span>Tus datos son 100% confidenciales. Sin cobros automáticos.</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal with WhatsApp CTA */}
      {confirmedAppointment && (
        <div className="modal-overlay" onClick={() => setConfirmedAppointment(null)}>
          <div className="modal-content confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setConfirmedAppointment(null)}
              aria-label="Cerrar modal"
            >
              <X size={20} />
            </button>

            <div className="modal-body-success">
              <div className="success-icon-badge">
                <CheckCircle2 size={48} className="text-teal" />
              </div>

              <h3 className="modal-success-title">
                ¡Solicitud Registrada con Éxito!
              </h3>

              <p className="modal-success-sub">
                Hemos reservado tu espacio provisionalmente. Para validar y asegurar tu cita
                con la Lic. Adriannis Rodríguez, confirma directamente a través de WhatsApp.
              </p>

              {/* Appointment Summary Box */}
              <div className="appointment-summary-box">
                <div className="summary-row">
                  <span className="row-label">👤 Paciente:</span>
                  <span className="row-value">{confirmedAppointment.patientName}</span>
                </div>
                <div className="summary-row">
                  <span className="row-label">📅 Fecha:</span>
                  <span className="row-value">{confirmedAppointment.date}</span>
                </div>
                <div className="summary-row">
                  <span className="row-label">⏰ Horario:</span>
                  <span className="row-value">{formatHour12(confirmedAppointment.time)} ({confirmedAppointment.time} Hora Vzla / {confirmedAppointment.country})</span>
                </div>
                <div className="summary-row">
                  <span className="row-label">🌱 Motivo:</span>
                  <span className="row-value">{confirmedAppointment.motive}</span>
                </div>
              </div>

              {/* Action WhatsApp Button */}
              <a
                href={generateWhatsAppLink(confirmedAppointment)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-whatsapp-confirm animate-pulse-glow"
              >
                <MessageCircle size={22} />
                <span>Confirmar por WhatsApp (+58 412-4335625)</span>
              </a>

              <p className="whatsapp-notice">
                Se abrirá tu WhatsApp con el mensaje listo para enviar.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
