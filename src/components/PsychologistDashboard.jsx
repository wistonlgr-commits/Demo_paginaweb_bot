import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Search, 
  Filter, 
  Download, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Trash2, 
  ShieldCheck, 
  Sparkles,
  ArrowLeft,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  List,
  Ban,
  Check,
  Plus,
  RefreshCw,
  Sliders,
  Sparkle
} from 'lucide-react';
import { 
  getAppointments, 
  saveAppointment,
  updateAppointmentStatus, 
  deleteAppointment, 
  getSettings, 
  updateSettings, 
  updatePinPassword,
  verifyPin,
  syncAppointmentsWithServer,
  ALL_HOURS,
  formatHour12,
  checkSlotConflict
} from '../services/appointmentService';
import './PsychologistDashboard.css';

const TIMEZONES_LIST = [
  'Venezuela (UTC-4)',
  'España / Europa Central (UTC+2)',
  'Estados Unidos - Florida / Este (UTC-4)',
  'Colombia / Perú / Ecuador (UTC-5)',
  'Chile / Argentina / Uruguay (UTC-3)',
  'México / Centroamérica (UTC-6)',
  'Internacional / Otro'
];

const MOTIVES_LIST = [
  'Ansiedad y gestión emocional',
  'Duelo y pérdidas',
  'Autoestima y límites',
  'Terapia de pareja y comunicación',
  'Estrés laboral y burnout',
  'Depresión y desmotivación',
  'Crecimiento personal',
  'Consulta General'
];

export default function PsychologistDashboard({ isOpen, onClose, isStandalonePage = false }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [appointments, setAppointments] = useState([]);
  const [settings, setSettings] = useState(getSettings());
  const [statusFilter, setStatusFilter] = useState('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('calendario'); // 'calendario' | 'citas' | 'horarios'

  // Block date input & PIN update
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newPin, setNewPin] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const showSuccess = (msg) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  // Manual Appointment Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    patientName: '',
    phone: '',
    email: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    country: 'Venezuela (UTC-4)',
    motive: 'Ansiedad y gestión emocional',
    status: 'confirmada',
    notes: ''
  });

  // Calendar View State
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [selectedCalDate, setSelectedCalDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });

  const monthNamesEs = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const loadData = async (showFeedback = false) => {
    const localApts = getAppointments();
    setAppointments([...localApts]);
    setSettings(getSettings());
    setIsSyncing(true);
    try {
      const serverData = await syncAppointmentsWithServer();
      if (serverData && Array.isArray(serverData)) {
        setAppointments([...serverData]);
        
        // Si el mes que está visualizando no tiene citas, pero hay citas en el servidor, enfocar el mes con citas
        const todayStrLocal = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
        const currentViewPrefix = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;
        const hasAptsInCurrentView = serverData.some((a) => a.date && a.date.startsWith(currentViewPrefix));
        
        if (!hasAptsInCurrentView && serverData.length > 0) {
          const targetApt = serverData.find((a) => a.date >= todayStrLocal) || serverData[0];
          if (targetApt && targetApt.date) {
            const [y, m, d] = targetApt.date.split('-');
            setCalYear(parseInt(y, 10));
            setCalMonth(parseInt(m, 10) - 1);
            setSelectedCalDate(targetApt.date);
          }
        }

        if (showFeedback) {
          showSuccess(`✓ Sincronizado: ${serverData.length} ${serverData.length === 1 ? 'cita actualizada' : 'citas actualizadas'} con el servidor.`);
        }
      } else if (showFeedback) {
        showSuccess('✓ Sincronización completada.');
      }
    } catch (err) {
      console.warn('[Dashboard] Fallo al cargar datos:', err);
      if (showFeedback) {
        alert('Aviso: No se pudo conectar con el servidor. Mostrando citas locales.');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Polling automático cada 8 segundos si está autenticado para ver citas nuevas en tiempo real
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      syncAppointmentsWithServer().then((serverData) => {
        if (serverData && Array.isArray(serverData)) {
          setAppointments(serverData);
        }
      }).catch(() => {});
    }, 8000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Listen to multi-tab storage updates
  useEffect(() => {
    const handleUpdate = () => {
      setAppointments(getAppointments());
      setSettings(getSettings());
    };
    window.addEventListener('psicobienestarp_appointments_updated', handleUpdate);
    window.addEventListener('psicobienestarp_settings_updated', handleUpdate);
    return () => {
      window.removeEventListener('psicobienestarp_appointments_updated', handleUpdate);
      window.removeEventListener('psicobienestarp_settings_updated', handleUpdate);
    };
  }, []);

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (!pinInput.trim() || isVerifying) return;
    setIsVerifying(true);
    setPinError(false);

    try {
      const isValid = await verifyPin(pinInput);
      if (isValid) {
        setIsAuthenticated(true);
        setPinError(false);
        loadData();
      } else {
        setPinError(true);
      }
    } catch {
      setPinError(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    updateAppointmentStatus(id, newStatus);
    await loadData();
  };

  const handleDelete = async (id, patientName) => {
    if (window.confirm(`¿Estás segura de eliminar la cita de ${patientName}?`)) {
      await deleteAppointment(id);
      await loadData();
      showSuccess(`Cita de ${patientName} eliminada correctamente.`);
    }
  };

  const handlePurgeDemoAppointments = async () => {
    if (window.confirm('¿Deseas eliminar todas las citas de demostración (María Valeria, Carlos Ramírez, etc.) para dejar tu agenda limpia?')) {
      const demoIds = ['apt-1', 'apt-2', 'apt-3'];
      for (const id of demoIds) {
        await deleteAppointment(id);
      }
      await loadData();
      showSuccess('Todas las citas demo han sido eliminadas.');
    }
  };

  const handleAddBlockedDate = () => {
    if (!newBlockedDate) return;
    if (settings.blockedDates.includes(newBlockedDate)) return;
    const updated = updateSettings({
      blockedDates: [...settings.blockedDates, newBlockedDate]
    });
    if (updated) {
      setSettings(updated);
      setNewBlockedDate('');
      showSuccess('Fecha bloqueada guardada.');
    }
  };

  const handleToggleBlockDate = (dateToToggle) => {
    const isBlocked = settings.blockedDates.includes(dateToToggle);
    let updatedBlocked = [];
    if (isBlocked) {
      updatedBlocked = settings.blockedDates.filter((d) => d !== dateToToggle);
    } else {
      updatedBlocked = [...settings.blockedDates, dateToToggle];
    }
    const updated = updateSettings({ blockedDates: updatedBlocked });
    if (updated) {
      setSettings(updated);
      showSuccess(isBlocked ? 'Fecha desbloqueada.' : 'Fecha bloqueada para citas.');
    }
  };

  const handleRemoveBlockedDate = (dateToRemove) => {
    const updated = updateSettings({
      blockedDates: settings.blockedDates.filter((d) => d !== dateToRemove)
    });
    if (updated) {
      setSettings(updated);
      showSuccess('Fecha desbloqueada.');
    }
  };

  // Toggle horario de atención específico (de 8am a 8pm)
  const handleToggleHour = (hour) => {
    const currentHours = settings.defaultHours || ALL_HOURS;
    let newHours = [];
    if (currentHours.includes(hour)) {
      if (currentHours.length <= 1) {
        alert('Debes tener al menos 1 horario activo en tu agenda.');
        return;
      }
      newHours = currentHours.filter((h) => h !== hour);
    } else {
      newHours = [...currentHours, hour].sort();
    }
    const updated = updateSettings({ defaultHours: newHours });
    if (updated) {
      setSettings(updated);
      showSuccess('Horario de atención actualizado.');
    }
  };

  const handleSetAllHours = (type) => {
    let target = ALL_HOURS;
    if (type === 'standard') {
      target = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    }
    const updated = updateSettings({ defaultHours: target });
    if (updated) {
      setSettings(updated);
      showSuccess('Horarios configurados con éxito.');
    }
  };

  // Ajustar Percepción de Disponibilidad (Escasez)
  const handleScarcityChange = (pct) => {
    const updated = updateSettings({ scarcityPercent: pct });
    if (updated) {
      setSettings(updated);
      showSuccess(`Percepción de disponibilidad ajustada al ${pct}%.`);
    }
  };

  const handleUpdatePin = async () => {
    if (!newPin.trim() || newPin.trim().length < 4) {
      alert('La contraseña debe tener al menos 4 caracteres.');
      return;
    }
    const updated = await updatePinPassword(newPin.trim());
    if (updated) {
      setSettings(updated);
      setNewPin('');
      showSuccess('Contraseña de acceso actualizada con éxito (cifrado SHA-256).');
    }
  };

  // Guardar Cita Manual
  const handleSaveManualAppointment = (e) => {
    e.preventDefault();
    if (!manualForm.patientName.trim()) {
      alert('Por favor ingresa el nombre del paciente.');
      return;
    }
    if (!manualForm.phone.trim()) {
      alert('Por favor ingresa el WhatsApp o teléfono.');
      return;
    }

    let timeVal = manualForm.time ? manualForm.time.trim() : '10:00';
    if (timeVal.length === 4 && timeVal.indexOf(':') === 1) {
      timeVal = '0' + timeVal;
    }

    // Advertencia amigable si colisiona con el buffer de descanso clínico (1h antes o 2h después)
    const conflict = checkSlotConflict(manualForm.date, timeVal);
    if (conflict.conflicted) {
      const proceed = window.confirm(
        `Aviso Clínico:\n${conflict.message}.\n\n¿Deseas agendar esta cita de todos modos?`
      );
      if (!proceed) return;
    }

    const saved = saveAppointment({
      ...manualForm,
      time: timeVal,
      patientName: manualForm.patientName.trim(),
      phone: manualForm.phone.trim(),
      notes: manualForm.notes.trim()
    });

    if (saved) {
      loadData();
      setIsManualModalOpen(false);
      showSuccess(`✓ Cita de ${saved.patientName} registrada exitosamente.`);
      setManualForm({
        patientName: '',
        phone: '',
        email: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        country: 'Venezuela (UTC-4)',
        motive: 'Ansiedad y gestión emocional',
        status: 'confirmada',
        notes: ''
      });
    }
  };

  const openManualModalForDate = (dateStr) => {
    setManualForm((prev) => ({
      ...prev,
      date: dateStr || new Date().toISOString().split('T')[0]
    }));
    setIsManualModalOpen(true);
  };

  // Export CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Paciente', 'Telefono', 'Pais_Zona', 'Fecha', 'Hora', 'Motivo', 'Estado', 'Nota', 'Creado'];
    const rows = appointments.map((a) => [
      a.id,
      `"${a.patientName}"`,
      `"${a.phone}"`,
      `"${a.country || ''}"`,
      a.date,
      a.time,
      `"${a.motive || ''}"`,
      a.status,
      `"${(a.notes || '').replace(/"/g, '""')}"`,
      a.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `citas_psicobienestarp_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open direct WhatsApp to patient
  const openPatientWhatsApp = (apt) => {
    const cleanPhone = (apt.phone || '').replace(/[^0-9]/g, '');
    const message = `¡Hola ${apt.patientName}! 👋 Te saluda la Lic. Adriannis Rodríguez de PsicobienestarP. Te escribo para coordinar los detalles de tu cita agendada para el ${apt.date} a las ${formatHour12(apt.time) || apt.time}. ¿Cómo te encuentras?`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleReturnToSite = () => {
    if (isStandalonePage) {
      window.location.href = window.location.hostname.includes('psicobienestarp.com')
        ? 'https://psicobienestarp.com/'
        : '/';
    } else if (onClose) {
      onClose();
    }
  };

  // Calendar navigation helpers
  const prevCalMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((prev) => prev - 1);
    } else {
      setCalMonth((prev) => prev - 1);
    }
  };

  const nextCalMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((prev) => prev + 1);
    } else {
      setCalMonth((prev) => prev + 1);
    }
  };

  const goToTodayCal = () => {
    const today = new Date();
    setCalMonth(today.getMonth());
    setCalYear(today.getFullYear());
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setSelectedCalDate(todayStr);
  };

  if (!isOpen) return null;

  // Render Login Gate
  if (!isAuthenticated) {
    return (
      <div className={isStandalonePage ? "admin-standalone-wrapper" : "modal-overlay"} onClick={isStandalonePage ? undefined : onClose}>
        <div className="modal-content admin-login-modal" onClick={(e) => e.stopPropagation()}>
          {!isStandalonePage && (
            <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
              <X size={20} />
            </button>
          )}

          <div className="admin-login-body">
            <div className="admin-lock-icon">
              <Lock size={36} />
            </div>

            <h3 className="admin-title">Panel Clínico & Agenda</h3>
            <p className="admin-subtitle">
              Exclusivo para la Lic. Adriannis Rodríguez. Ingresa tu contraseña de acceso para gestionar citas y disponibilidad.
            </p>

            <form onSubmit={handlePinSubmit} className="admin-pin-form">
              <div className="pin-input-group">
                <input
                  type="password"
                  maxLength={64}
                  autoFocus
                  placeholder="Contraseña de acceso"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  className={`pin-input ${pinError ? 'input-error' : ''}`}
                />
              </div>

              {pinError && (
                <div className="pin-error-text">
                  <AlertCircle size={15} /> Contraseña incorrecta. Intenta nuevamente.
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-login-submit" disabled={isVerifying}>
                <span>{isVerifying ? 'Verificando...' : 'Ingresar al Panel'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Filtered Appointments for List View
  const filteredAppointments = appointments.filter((apt) => {
    const matchesStatus = statusFilter === 'todas' || apt.status === statusFilter;
    const matchesSearch = 
      (apt.patientName && apt.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (apt.phone && apt.phone.includes(searchQuery)) ||
      (apt.motive && apt.motive.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const totalCitas = appointments.length;
  const pendientes = appointments.filter((a) => a.status === 'pendiente').length;
  const confirmadas = appointments.filter((a) => a.status === 'confirmada').length;
  const completadas = appointments.filter((a) => a.status === 'completada').length;

  // Calendar calculations
  const todayObj = new Date();
  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(calYear, calMonth, 1).getDay() + 6) % 7; // Lun=0 .. Dom=6

  const calDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calDays.push({
      day: d,
      dateStr,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedCalDate,
      isBlocked: settings.blockedDates && settings.blockedDates.includes(dateStr),
      apts: appointments.filter((a) => a.date === dateStr)
    });
  }

  const selectedDayAppointments = appointments.filter((a) => a.date === selectedCalDate);
  const selectedDayIsBlocked = settings.blockedDates && settings.blockedDates.includes(selectedCalDate);

  const currentViewPrefix = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;
  const currentMonthAppointments = appointments.filter((a) => a.date && a.date.startsWith(currentViewPrefix));
  
  const otherMonthsWithApts = [];
  appointments.forEach((apt) => {
    if (apt.date) {
      const ym = apt.date.substring(0, 7);
      if (ym !== currentViewPrefix && !otherMonthsWithApts.includes(ym)) {
        otherMonthsWithApts.push(ym);
      }
    }
  });

  const formatFriendlyDate = (dStr) => {
    try {
      const d = new Date(dStr + 'T00:00:00');
      return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dStr;
    }
  };

  const activeHoursCount = (settings.defaultHours || ALL_HOURS).length;

  return (
    <div className="dashboard-fullscreen-overlay">
      <div className="dashboard-wrapper">
        {/* Top Navbar */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <img src="/logo.png" alt="PsicobienestarP" className="dashboard-logo" />
            <div>
              <h2 className="topbar-title">Panel Clínico & Citas</h2>
              <span className="topbar-doc">Lic. Adriannis Rodríguez • Psicóloga Clínica</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="dashboard-nav-tabs">
            <button
              onClick={() => setActiveTab('calendario')}
              className={`dash-tab-btn ${activeTab === 'calendario' ? 'active' : ''}`}
            >
              <CalendarDays size={18} />
              <span>Vista de Calendario</span>
            </button>

            <button
              onClick={() => setActiveTab('citas')}
              className={`dash-tab-btn ${activeTab === 'citas' ? 'active' : ''}`}
            >
              <List size={18} />
              <span>Lista de Citas ({totalCitas})</span>
            </button>

            <button
              onClick={() => setActiveTab('horarios')}
              className={`dash-tab-btn ${activeTab === 'horarios' ? 'active' : ''}`}
            >
              <Settings size={18} />
              <span>Horarios, Estrategia & Clave</span>
            </button>
          </div>

          <div className="topbar-actions">
            {/* Botón de Nueva Cita Manual */}
            <button
              onClick={() => openManualModalForDate(selectedCalDate)}
              className="btn btn-primary btn-new-manual-apt"
              title="Registrar cita manual recibida por WhatsApp o teléfono"
            >
              <Plus size={18} />
              <span>+ Nueva Cita Manual</span>
            </button>

            <button
              onClick={() => loadData(true)}
              className={`btn-refresh-data ${isSyncing ? 'syncing' : ''}`}
              title="Sincronizar datos con servidor SiteGround"
            >
              <RefreshCw size={17} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
            </button>

            <button onClick={exportToCSV} className="btn-export-csv" title="Descargar citas en Excel/CSV">
              <Download size={18} />
              <span>CSV</span>
            </button>

            <button onClick={handleReturnToSite} className="btn-back-site">
              <ArrowLeft size={18} />
              <span>Volver a la Web</span>
            </button>

            <button
              onClick={() => {
                setIsAuthenticated(false);
                setPinInput('');
              }}
              className="btn-logout"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {saveSuccessMsg && (
          <div className="dashboard-toast-success">
            <CheckCircle size={18} />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Content Body */}
        <main className="dashboard-content container">
          {/* TAB 1: CALENDAR VIEW */}
          {activeTab === 'calendario' && (
            <div className="dashboard-calendar-view-section">
              {/* KPIs Bar */}
              <div className="metrics-cards-grid">
                <div className="metric-box glass-card">
                  <div className="metric-label">Total Citas Registradas</div>
                  <div className="metric-number">{totalCitas}</div>
                  <span className="metric-sub">Histórico en plataforma</span>
                </div>
                <div className="metric-box glass-card metric-pending">
                  <div className="metric-label">Pendientes por Validar</div>
                  <div className="metric-number">{pendientes}</div>
                  <span className="metric-sub">Requieren confirmación WhatsApp</span>
                </div>
                <div className="metric-box glass-card metric-confirmed">
                  <div className="metric-label">Citas Confirmadas</div>
                  <div className="metric-number">{confirmadas}</div>
                  <span className="metric-sub">Listas para sesión</span>
                </div>
                <div className="metric-box glass-card metric-completed">
                  <div className="metric-label">Sesiones Realizadas</div>
                  <div className="metric-number">{completadas}</div>
                  <span className="metric-sub">Pacientes atendidos con éxito</span>
                </div>
              </div>

              {/* Main Calendar Layout (Grid + Day Drawer) */}
              <div className="cal-main-layout">
                {/* Left: Full Interactive Calendar */}
                <div className="cal-grid-card glass-card">
                  {/* Calendar Top Controls */}
                  <div className="cal-top-bar">
                    <div className="cal-month-title-wrap">
                      <h3 className="cal-month-heading">
                        {monthNamesEs[calMonth]} {calYear}
                      </h3>
                      <button onClick={goToTodayCal} className="btn-cal-today">
                        Ir a Hoy
                      </button>
                    </div>

                    <div className="cal-legend-pills">
                      <span className="legend-chip legend-confirmed">● Confirmada</span>
                      <span className="legend-chip legend-pending">● Pendiente</span>
                      <span className="legend-chip legend-completed">● Completada</span>
                      <span className="legend-chip legend-blocked">⛔ Bloqueado</span>
                    </div>

                    <div className="cal-nav-buttons">
                      <button onClick={prevCalMonth} className="btn-cal-arrow" title="Mes anterior">
                        <ChevronLeft size={20} />
                      </button>
                      <button onClick={nextCalMonth} className="btn-cal-arrow" title="Mes siguiente">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>

                  {otherMonthsWithApts.length > 0 && currentMonthAppointments.length === 0 && (
                    <div className="cal-other-months-notice">
                      <Sparkles size={16} className="text-primary" />
                      <span>Tienes citas agendadas en otros meses:</span>
                      <div className="jump-months-btns-wrap">
                        {otherMonthsWithApts.map((ym) => {
                          const [y, m] = ym.split('-');
                          const mIdx = parseInt(m, 10) - 1;
                          const count = appointments.filter((a) => a.date && a.date.startsWith(ym)).length;
                          return (
                            <button
                              key={ym}
                              onClick={() => {
                                setCalYear(parseInt(y, 10));
                                setCalMonth(mIdx);
                                const firstAptInMonth = appointments.find((a) => a.date && a.date.startsWith(ym));
                                if (firstAptInMonth) setSelectedCalDate(firstAptInMonth.date);
                              }}
                              className="btn-jump-month"
                            >
                              📅 Ver {monthNamesEs[mIdx]} {y} ({count} {count === 1 ? 'cita' : 'citas'}) ➜
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Weekday headers */}
                  <div className="cal-weekdays-row">
                    <span>Lunes</span>
                    <span>Martes</span>
                    <span>Miércoles</span>
                    <span>Jueves</span>
                    <span>Viernes</span>
                    <span>Sábado</span>
                    <span>Domingo</span>
                  </div>

                  {/* Days Matrix */}
                  <div className="cal-month-matrix">
                    {calDays.map((item, idx) => {
                      if (!item) {
                        return <div key={`empty-${idx}`} className="cal-day-cell cal-day-empty"></div>;
                      }

                      return (
                        <div
                          key={item.dateStr}
                          onClick={() => setSelectedCalDate(item.dateStr)}
                          className={`cal-day-cell ${item.isToday ? 'is-today' : ''} ${item.isSelected ? 'is-selected' : ''} ${item.isBlocked ? 'is-blocked' : ''}`}
                        >
                          <div className="cal-day-cell-top">
                            <span className="cal-day-number">{item.day}</span>
                            {item.isToday && <span className="cal-today-badge">Hoy</span>}
                            {item.isBlocked && <span className="cal-blocked-tag">Bloqueado</span>}
                          </div>

                          <div className="cal-day-apts-container">
                            {item.apts.slice(0, 3).map((apt) => (
                              <div
                                key={apt.id}
                                className={`cal-apt-chip status-chip-${apt.status}`}
                                title={`${formatHour12(apt.time) || apt.time} - ${apt.patientName} (${apt.status})`}
                              >
                                <span className="chip-time">{formatHour12(apt.time) || apt.time}</span>
                                <span className="chip-name">{apt.patientName ? apt.patientName.split(' ')[0] : 'Cita'}</span>
                              </div>
                            ))}
                            {item.apts.length > 3 && (
                              <div className="cal-apt-chip-more">
                                +{item.apts.length - 3} más
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Selected Day Details Drawer */}
                <div className="cal-day-details-panel glass-card">
                  <div className="day-details-header">
                    <div>
                      <span className="details-pretitle">Detalle del Día</span>
                      <h4 className="details-date-title">{formatFriendlyDate(selectedCalDate)}</h4>
                    </div>
                    <div className="day-header-actions">
                      <button
                        onClick={() => openManualModalForDate(selectedCalDate)}
                        className="btn-day-add-apt"
                        title="Agregar cita en esta fecha"
                      >
                        <Plus size={15} />
                        <span>Agendar Aquí</span>
                      </button>
                      <button
                        onClick={() => handleToggleBlockDate(selectedCalDate)}
                        className={`btn-toggle-block-date ${selectedDayIsBlocked ? 'unblock' : 'block'}`}
                        title={selectedDayIsBlocked ? 'Desbloquear este día' : 'Bloquear este día para citas'}
                      >
                        <Ban size={15} />
                        <span>{selectedDayIsBlocked ? 'Desbloquear' : 'Bloquear Día'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="day-details-body">
                    {selectedDayAppointments.length === 0 ? (
                      <div className="empty-day-state">
                        <CalendarIcon size={36} className="text-light" />
                        <h5>Sin citas en esta fecha</h5>
                        <p>No hay pacientes agendados para {formatFriendlyDate(selectedCalDate)}.</p>
                        <button
                          onClick={() => openManualModalForDate(selectedCalDate)}
                          className="btn btn-secondary btn-sm mt-3"
                        >
                          <Plus size={15} />
                          <span>+ Registrar Cita Manual</span>
                        </button>
                      </div>
                    ) : (
                      <div className="selected-day-apts-list">
                        {selectedDayAppointments.map((apt) => (
                          <div key={apt.id} className={`cal-detail-card status-${apt.status}`}>
                            <div className="cal-detail-card-top">
                              <div className="cal-detail-time">
                                <Clock size={15} />
                                <strong>{formatHour12(apt.time) || apt.time}</strong>
                                <span className="text-muted text-xs">({apt.time})</span>
                              </div>
                              <select
                                value={apt.status}
                                onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                                className={`status-select status-badge-${apt.status}`}
                              >
                                <option value="pendiente">⏳ Pendiente</option>
                                <option value="confirmada">✅ Confirmada</option>
                                <option value="completada">🎉 Completada</option>
                                <option value="cancelada">❌ Cancelada</option>
                              </select>
                            </div>

                            <div className="cal-detail-patient">
                              <h5 className="patient-name">{apt.patientName}</h5>
                              <div className="patient-submeta">
                                <span>📱 {apt.phone}</span>
                                <span>🌏 {apt.country || 'Online'}</span>
                              </div>
                              <p className="patient-motive"><strong>Motivo:</strong> {apt.motive}</p>
                              {apt.notes && <p className="patient-note"><em>"{apt.notes}"</em></p>}
                            </div>

                            <div className="cal-detail-actions">
                              <button
                                onClick={() => openPatientWhatsApp(apt)}
                                className="btn-chat-patient"
                                title="Abrir WhatsApp del paciente"
                              >
                                <span>WhatsApp</span>
                                <ExternalLink size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(apt.id, apt.patientName)}
                                className="btn-delete-apt"
                                title="Eliminar cita"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIST VIEW */}
          {activeTab === 'citas' && (
            <>
              {/* Metric KPIs */}
              <div className="metrics-cards-grid">
                <div className="metric-box glass-card">
                  <div className="metric-label">Total Citas Registradas</div>
                  <div className="metric-number">{totalCitas}</div>
                  <span className="metric-sub">Histórico en plataforma</span>
                </div>
                <div className="metric-box glass-card metric-pending">
                  <div className="metric-label">Pendientes por Validar</div>
                  <div className="metric-number">{pendientes}</div>
                  <span className="metric-sub">Requieren confirmación WhatsApp</span>
                </div>
                <div className="metric-box glass-card metric-confirmed">
                  <div className="metric-label">Citas Confirmadas</div>
                  <div className="metric-number">{confirmadas}</div>
                  <span className="metric-sub">Listas para sesión</span>
                </div>
                <div className="metric-box glass-card metric-completed">
                  <div className="metric-label">Sesiones Realizadas</div>
                  <div className="metric-number">{completadas}</div>
                  <span className="metric-sub">Pacientes atendidos con éxito</span>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="dashboard-filters-card glass-card">
                <div className="search-box">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar por paciente, teléfono o motivo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="clear-search-btn">
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="status-filter-pills">
                  <button
                    className={`filter-pill ${statusFilter === 'todas' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('todas')}
                  >
                    Todas ({totalCitas})
                  </button>
                  <button
                    className={`filter-pill pill-pending ${statusFilter === 'pendiente' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('pendiente')}
                  >
                    Pendientes ({pendientes})
                  </button>
                  <button
                    className={`filter-pill pill-confirmed ${statusFilter === 'confirmada' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('confirmada')}
                  >
                    Confirmadas ({confirmadas})
                  </button>
                  <button
                    className={`filter-pill pill-completed ${statusFilter === 'completada' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('completada')}
                  >
                    Completadas ({completadas})
                  </button>
                  <button
                    className={`filter-pill pill-cancelled ${statusFilter === 'cancelada' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('cancelada')}
                  >
                    Canceladas
                  </button>

                  {appointments.some(a => ['apt-1', 'apt-2', 'apt-3'].includes(a.id)) && (
                    <button
                      onClick={handlePurgeDemoAppointments}
                      className="btn-purge-demo"
                      title="Eliminar citas de prueba iniciales"
                    >
                      <Trash2 size={14} />
                      <span>Limpiar Citas Demo</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Appointments List */}
              <div className="appointments-list-container">
                {filteredAppointments.length === 0 ? (
                  <div className="no-appointments-card glass-card">
                    <CalendarIcon size={40} className="text-light" />
                    <h4>No se encontraron citas</h4>
                    <p>No hay solicitudes que coincidan con los filtros actuales.</p>
                  </div>
                ) : (
                  <div className="appointments-cards-grid">
                    {filteredAppointments.map((apt) => (
                      <div key={apt.id} className={`appointment-manage-card glass-card status-${apt.status}`}>
                        {/* Header with status selector */}
                        <div className="apt-card-top">
                          <div className="apt-datetime">
                            <CalendarIcon size={16} className="text-teal" />
                            <strong>{apt.date}</strong>
                            <Clock size={16} className="text-teal ml-2" />
                            <span>{formatHour12(apt.time) || apt.time} ({apt.time})</span>
                          </div>

                          <div className="status-dropdown-wrapper">
                            <select
                              value={apt.status}
                              onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                              className={`status-select status-badge-${apt.status}`}
                            >
                              <option value="pendiente">⏳ Pendiente</option>
                              <option value="confirmada">✅ Confirmada</option>
                              <option value="completada">🎉 Completada</option>
                              <option value="cancelada">❌ Cancelada</option>
                            </select>
                          </div>
                        </div>

                        {/* Patient info */}
                        <div className="apt-patient-info">
                          <h4 className="patient-name-title">{apt.patientName}</h4>
                          <div className="patient-meta-row">
                            <span className="patient-phone">📱 {apt.phone}</span>
                            <span className="patient-country">🌏 {apt.country || 'Online'}</span>
                          </div>
                          <div className="patient-motive">
                            <strong>Motivo:</strong> {apt.motive}
                          </div>
                          {apt.notes && (
                            <div className="patient-note-box">
                              <em>"{apt.notes}"</em>
                            </div>
                          )}
                        </div>

                        {/* Bottom Action buttons */}
                        <div className="apt-card-actions">
                          <button
                            onClick={() => openPatientWhatsApp(apt)}
                            className="btn-chat-patient"
                            title="Escribir al WhatsApp del paciente"
                          >
                            <span>Escribir por WhatsApp</span>
                            <ExternalLink size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(apt.id, apt.patientName)}
                            className="btn-delete-apt"
                            title="Eliminar registro"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 3: SETTINGS, SCARCITY & SCHEDULE */}
          {activeTab === 'horarios' && (
            <div className="settings-tab-container">
              <div className="settings-grid">
                {/* 1. Personalización de Horarios (8:00 AM a 8:00 PM) */}
                <div className="settings-card glass-card">
                  <div className="settings-card-header-row">
                    <div>
                      <h3 className="settings-card-title">
                        <Clock size={20} />
                        <span>Horarios de Atención (8:00 AM – 8:00 PM)</span>
                      </h3>
                      <p className="settings-card-desc">
                        Activa o desactiva horas de consulta. Haz clic sobre cada horario para habilitarlo o suspenderlo.
                      </p>
                    </div>
                    <span className="badge-active-hours">
                      {activeHoursCount} de {ALL_HOURS.length} horarios activos
                    </span>
                  </div>

                  <div className="hours-quick-presets">
                    <button
                      onClick={() => handleSetAllHours('all')}
                      className="btn-preset-chip"
                    >
                      ✓ Activar Todos (8:00 AM a 8:00 PM)
                    </button>
                    <button
                      onClick={() => handleSetAllHours('standard')}
                      className="btn-preset-chip"
                    >
                      🕒 Jornada Estándar (9:00 AM – 6:00 PM)
                    </button>
                  </div>

                  <div className="hours-selector-grid">
                    {ALL_HOURS.map((hour) => {
                      const isActive = (settings.defaultHours || ALL_HOURS).includes(hour);
                      return (
                        <button
                          key={hour}
                          type="button"
                          onClick={() => handleToggleHour(hour)}
                          className={`hour-toggle-btn ${isActive ? 'is-active' : 'is-inactive'}`}
                          title={isActive ? 'Horario habilitado (haz clic para deshabilitar)' : 'Horario deshabilitado (haz clic para habilitar)'}
                        >
                          <span className="hour-label-12">{formatHour12(hour)}</span>
                          <span className="hour-label-24">({hour})</span>
                          <span className="hour-status-icon">
                            {isActive ? <Check size={14} /> : <X size={14} />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Estrategia: Percepción de Disponibilidad (Escasez) */}
                <div className="settings-card glass-card">
                  <h3 className="settings-card-title">
                    <Sliders size={20} />
                    <span>Percepción de Disponibilidad (Alta Demanda)</span>
                  </h3>
                  <p className="settings-card-desc">
                    Genera exclusividad y percepción de alta demanda haciendo que un porcentaje de los horarios aparezcan automáticamente como <strong>"Ocupados"</strong> en la web pública.
                  </p>

                  <div className="scarcity-selector-wrap">
                    <div className="scarcity-current-indicator">
                      <span>Porcentaje simulado actual:</span>
                      <strong className="scarcity-tag">{settings.scarcityPercent || 0}% de cupos ocupados</strong>
                    </div>

                    <div className="scarcity-presets-grid">
                      {[
                        { pct: 0, label: '0% (100% Real)' },
                        { pct: 15, label: '15% (Demanda Leve)' },
                        { pct: 20, label: '20% (Recomendado)' },
                        { pct: 30, label: '30% (Alta Demanda)' },
                        { pct: 40, label: '40% (Exclusividad)' },
                        { pct: 50, label: '50% (Agenda Copada)' }
                      ].map((item) => (
                        <button
                          key={item.pct}
                          onClick={() => handleScarcityChange(item.pct)}
                          className={`scarcity-btn ${(settings.scarcityPercent || 0) === item.pct ? 'active' : ''}`}
                        >
                          <strong>{item.label}</strong>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="security-notice-box scarcity-notice">
                    <Sparkles size={16} className="text-teal" />
                    <span>
                      <strong>Importante:</strong> Esta función solo altera la visualización para los visitantes en la web. En tu panel administrativo <strong>nunca</strong> se crean citas falsas; siempre ves exclusivamente a tus pacientes reales.
                    </span>
                  </div>
                </div>

                {/* 3. Bloqueo de Fechas Específicas */}
                <div className="settings-card glass-card">
                  <h3 className="settings-card-title">
                    <CalendarIcon size={20} />
                    <span>Bloqueo de Días y Vacaciones</span>
                  </h3>
                  <p className="settings-card-desc">
                    Las fechas agregadas aquí se deshabilitarán completamente en la agenda pública.
                  </p>

                  <div className="add-blocked-date-form">
                    <input
                      type="date"
                      value={newBlockedDate}
                      onChange={(e) => setNewBlockedDate(e.target.value)}
                      className="date-input"
                    />
                    <button onClick={handleAddBlockedDate} className="btn btn-primary btn-add-date">
                      Bloquear Fecha
                    </button>
                  </div>

                  <div className="blocked-dates-list">
                    <span className="blocked-list-title">Fechas actualmente bloqueadas:</span>
                    {settings.blockedDates.length === 0 ? (
                      <p className="no-blocked-dates">No tienes fechas bloqueadas en este momento.</p>
                    ) : (
                      <div className="blocked-chips-wrap">
                        {settings.blockedDates.map((dateStr) => (
                          <span key={dateStr} className="blocked-date-chip">
                            <span>{dateStr}</span>
                            <button
                              onClick={() => handleRemoveBlockedDate(dateStr)}
                              title="Desbloquear fecha"
                              className="chip-remove-btn"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Configuración de Seguridad y Contraseña */}
                <div className="settings-card glass-card">
                  <h3 className="settings-card-title">
                    <ShieldCheck size={20} />
                    <span>Seguridad & Contraseña Maestra</span>
                  </h3>
                  <p className="settings-card-desc">
                    Cambia tu contraseña de acceso clínico. Se encripta con algoritmo criptográfico <strong>SHA-256</strong> en tu navegador, sin almacenar texto plano.
                  </p>

                  <div className="pin-update-form">
                    <label className="pin-label">Nueva Contraseña:</label>
                    <div className="pin-input-action-row">
                      <input
                        type="password"
                        placeholder="Ingresa nueva contraseña..."
                        maxLength={64}
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        className="pin-change-input"
                      />
                      <button onClick={handleUpdatePin} className="btn btn-secondary btn-update-pin">
                        Actualizar
                      </button>
                    </div>
                  </div>

                  <div className="security-notice-box">
                    <Sparkles size={16} className="text-teal" />
                    <span>La contraseña se procesa mediante Web Crypto API y se valida contra hash seguro.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* MODAL: REGISTRAR CITA MANUAL */}
        {isManualModalOpen && (
          <div className="modal-overlay" onClick={() => setIsManualModalOpen(false)}>
            <div className="modal-content manual-appointment-modal" onClick={(e) => e.stopPropagation()}>
              <button
                className="modal-close-btn"
                onClick={() => setIsManualModalOpen(false)}
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>

              <div className="manual-modal-header">
                <div className="manual-modal-icon">
                  <CalendarDays size={26} />
                </div>
                <div>
                  <h3 className="manual-modal-title">Registrar Cita Manual</h3>
                  <p className="manual-modal-sub">
                    Agrega directamente a la agenda una cita acordada por WhatsApp, llamada o consulta presencial.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveManualAppointment} className="manual-appointment-form">
                <div className="manual-form-grid">
                  <div className="form-group">
                    <label className="form-label">Nombre y Apellido del Paciente *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Valeria Mendoza"
                      value={manualForm.patientName}
                      onChange={(e) => setManualForm({ ...manualForm, patientName: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Teléfono / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. +58 412 123 4567"
                      value={manualForm.phone}
                      onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fecha de la Cita *</label>
                    <input
                      type="date"
                      required
                      value={manualForm.date}
                      onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Horario de Consulta (Escribe o selecciona, ej. 7:30 o 14:00) *
                    </label>
                    <input
                      type="time"
                      list="dashboard-manual-hours-list"
                      required
                      value={manualForm.time}
                      onChange={(e) => setManualForm({ ...manualForm, time: e.target.value })}
                      className="form-input"
                      placeholder="HH:MM (ej. 07:30)"
                    />
                    <datalist id="dashboard-manual-hours-list">
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
                    <span className="field-hint-text" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                      {manualForm.time ? `Formato 12h: ${formatHour12(manualForm.time)} (Hora Venezuela)` : 'Puedes escribir 7:30, 8:45, etc.'}
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">País / Zona Horaria</label>
                    <select
                      value={manualForm.country}
                      onChange={(e) => setManualForm({ ...manualForm, country: e.target.value })}
                      className="form-select"
                    >
                      {TIMEZONES_LIST.map((tz) => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Motivo de Consulta</label>
                    <select
                      value={manualForm.motive}
                      onChange={(e) => setManualForm({ ...manualForm, motive: e.target.value })}
                      className="form-select"
                    >
                      {MOTIVES_LIST.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Estado Inicial</label>
                    <select
                      value={manualForm.status}
                      onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
                      className="form-select"
                    >
                      <option value="confirmada">✅ Confirmada (Lista para sesión)</option>
                      <option value="pendiente">⏳ Pendiente por validar</option>
                      <option value="completada">🎉 Ya Realizada</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Correo Electrónico (Opcional)</label>
                    <input
                      type="email"
                      placeholder="paciente@correo.com"
                      value={manualForm.email}
                      onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group mt-3">
                  <label className="form-label">Notas Clínicas Privadas (Solo visibles para ti)</label>
                  <textarea
                    rows={3}
                    placeholder="Detalles acordados, antecedentes, método de pago, etc."
                    value={manualForm.notes}
                    onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                    className="form-textarea"
                  ></textarea>
                </div>

                <div className="manual-modal-actions">
                  <button
                    type="button"
                    onClick={() => setIsManualModalOpen(false)}
                    className="btn btn-outline"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Check size={18} />
                    <span>Guardar Cita en Agenda</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
