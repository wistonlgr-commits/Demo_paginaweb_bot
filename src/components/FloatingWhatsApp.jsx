import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { WHATSAPP_PHONE } from '../services/appointmentService';
import './FloatingWhatsApp.css';

export default function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 260 && !hasDismissed) {
        setShowTooltip(true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasDismissed]);

  const directWhatsAppUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(
    '¡Hola Lic. Adriannis! Quisiera consultar disponibilidad para agendar una sesión de psicología online.'
  )}`;

  return (
    <div className="floating-wa-wrapper">
      {showTooltip && (
        <div className="wa-tooltip-box glass-card animate-float">
          <button
            onClick={() => {
              setShowTooltip(false);
              setHasDismissed(true);
            }}
            className="wa-tooltip-close"
            aria-label="Cerrar tooltip"
          >
            <X size={14} />
          </button>
          <p className="wa-tooltip-title">¿Tienes alguna pregunta?</p>
          <p className="wa-tooltip-sub">Escríbeme directo al WhatsApp</p>
        </div>
      )}

      <a
        href={directWhatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-wa-btn animate-pulse-glow"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle size={28} />
      </a>
    </div>
  );
}
