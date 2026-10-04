import React, { useEffect } from 'react';
import Header from '../components/Header';
import BookingCalendar from '../components/BookingCalendar';
import Footer from '../components/Footer';
import StarRainCanvas from '../components/StarRainCanvas';
import WhiteStarsFallingCanvas from '../components/WhiteStarsFallingCanvas';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import { ShieldCheck, Heart, Sparkles, ArrowLeft, Calendar } from 'lucide-react';
import './AgendaPage.css';

export default function AgendaPage() {
  useEffect(() => {
    document.title = 'Agendar Cita Psicológica Online | PsicobienestarP – Lic. Adriannis Rodríguez';
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Revelar todos los elementos animados de inmediato para evitar opacidad 0
    const revealAll = () => {
      const elementsToReveal = document.querySelectorAll(
        '.fade-in-on-scroll, .fade-in-scale, .fade-in-left, .fade-in-right, .reveal'
      );
      elementsToReveal.forEach((el) => {
        el.classList.add('is-visible');
        el.classList.add('active');
        el.setAttribute('data-revealed', 'true');
      });
    };

    revealAll();
    const t = setTimeout(revealAll, 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="agenda-page-root">
      {/* Fondos estelares dinámicos */}
      <StarRainCanvas />
      <WhiteStarsFallingCanvas />

      {/* Header oficial */}
      <Header />

      <main className="agenda-main-content">
        <div className="container agenda-container">
          {/* Navegación rápida hacia la web principal */}
          <div className="agenda-top-nav-bar">
            <a href="/" className="agenda-back-home-link">
              <ArrowLeft size={16} />
              <span>Volver a la página principal</span>
            </a>
            <div className="agenda-psych-badge">
              <img src="/cerebro.png" alt="Logo" className="agenda-badge-logo" />
              <span>Lic. Adriannis Rodríguez • Psicóloga Clínica</span>
            </div>
          </div>

          {/* Encabezado destacado */}
          <div className="agenda-hero-intro text-center">
            <div className="agenda-pill-badge">
              <Calendar size={15} />
              <span>Agenda Clínica Oficial</span>
            </div>
            <h1 className="agenda-main-heading">
              Reserva Tu Espacio de <br />
              <span className="text-gradient">Bienestar & Sanación Emocional 🌸</span>
            </h1>
            <p className="agenda-main-description">
              Elige el día y la hora que mejor se adapte a tu rutina (disponible entre <strong>7:00 AM y 8:00 PM</strong>).
              Una vez completado el formulario, confirmaremos los detalles directamente a través de WhatsApp.
            </p>

            {/* Micro-beneficios clínicos */}
            <div className="agenda-trust-pills">
              <div className="trust-pill-item">
                <Sparkles size={16} className="text-primary-pink" />
                <span>Sesiones de 60 minutos</span>
              </div>
              <div className="trust-pill-item">
                <ShieldCheck size={16} className="text-primary-pink" />
                <span>100% Confidencial y Seguro</span>
              </div>
              <div className="trust-pill-item">
                <Heart size={16} className="text-primary-pink" />
                <span>Atención Empática y Personalizada</span>
              </div>
            </div>
          </div>

          {/* Calendario con selector interactivo y escritura de hora libre */}
          <div className="agenda-calendar-wrapper">
            <BookingCalendar />
          </div>
        </div>
      </main>

      {/* Botón flotante de WhatsApp directo */}
      <FloatingWhatsApp />

      {/* Footer con información ética y legal */}
      <Footer />
    </div>
  );
}
