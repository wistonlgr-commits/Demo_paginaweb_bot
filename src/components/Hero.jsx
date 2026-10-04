import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MessageCircle, ArrowRight, Sun, Wind, Heart, CheckCircle2 } from 'lucide-react';
import { WHATSAPP_PHONE } from '../services/appointmentService';
import './Hero.css';

export default function Hero({ onBookClick }) {
  const [activePhrase, setActivePhrase] = useState(null);
  const vantaRef = useRef(null);

  // Inicializar Vanta.FOG con los colores de la página
  useEffect(() => {
    let effect = null;
    let timer = null;

    const initVanta = () => {
      if (window.VANTA && window.VANTA.FOG && vantaRef.current) {
        try {
          effect = window.VANTA.FOG({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            highlightColor: 0xf8bcc7, // Tonos claros más rosados
            midtoneColor: 0xeaa5ac,   // Rosa oficial de cabecera (#EAA5AC)
            lowlightColor: 0xf4b4be,  // Rosa suave complementario
            baseColor: 0xf7d5db,      // Fondo rosado definido
            blurFactor: 0.55,         // Menos desenfoque para que las ondas y remolinos se distingan claramente
            zoom: 1.1,
            speed: 3.60               // Velocidad sustancialmente mayor para movimiento continuo evidente
          });
        } catch (e) {
          console.warn('Vanta initialization fallback:', e);
        }
      }
    };

    if (window.VANTA && window.VANTA.FOG) {
      initVanta();
    } else {
      timer = setInterval(() => {
        if (window.VANTA && window.VANTA.FOG) {
          initVanta();
          clearInterval(timer);
        }
      }, 150);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (effect && typeof effect.destroy === 'function') {
        effect.destroy();
      }
    };
  }, []);

  const directWhatsAppUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
    '¡Hola Lic. Adriannis! Quisiera consultar información sobre sus sesiones de terapia psicológica online.'
  )}`;

  const pilares = [
    {
      id: 0,
      icon: <Sun size={22} className="pilar-icon text-claridad" />,
      pretitle: 'Recupera tu',
      title: 'Claridad',
      desc: 'Despeja la saturación mental, comprende tus patrones y toma decisiones desde la certeza.',
      tag: 'Enfoque & Consciencia',
      accentColor: '#DE6B7C',
      bgColor: 'rgba(250, 216, 220, 0.65)'
    },
    {
      id: 1,
      icon: <Wind size={22} className="pilar-icon text-calma" />,
      pretitle: 'Siente la',
      title: 'Calma',
      desc: 'Regula tu sistema nervioso, aprende a gestionar la ansiedad y habita tu presente en paz.',
      tag: 'Paz Interior & Serenidad',
      accentColor: '#D97706',
      bgColor: 'rgba(252, 235, 208, 0.75)'
    },
    {
      id: 2,
      icon: <Heart size={22} className="pilar-icon text-bienestar" />,
      pretitle: 'Vive en',
      title: 'Bienestar',
      desc: 'Sana tu relación contigo misma(o), fortalece tu autoestima y construye tu mejor versión.',
      tag: 'Amor Propio & Plenitud',
      accentColor: '#E07A5F',
      bgColor: 'rgba(252, 216, 191, 0.7)'
    }
  ];

  return (
    <section id="inicio" className="hero-section">
      {/* Vanta.js 3D Fog Background Interactivo con colores de la marca */}
      <div ref={vantaRef} className="hero-vanta-canvas"></div>

      <div className="container hero-container">
        {/* Left Column: Authentic Brand Presentation */}
        <div className="hero-left-content">
          <div className="safe-space-badge-row">
            <img src="/cerebro.png" alt="Cerebro floral" className="hero-mini-brain" />
            <span className="safe-space-label">
              Tu bienestar comienza en tu espacio seguro.
            </span>
          </div>

          <h1 className="hero-main-title">
            Atención Psicológica <br />
            <span className="hero-highlight-brand">Online & Empática</span>
          </h1>

          <p className="hero-lead-text">
            Soy Adriannis Rodríguez, Psicóloga Clínica. Te acompaño a sanar,
            comprenderte y recuperar el equilibrio emocional a través de un espacio
            seguro, confidencial y adaptado a tu ritmo.
          </p>

          {/* Authentic Signature Pill */}
          <div className="original-signature-pill">
            <img src="/logo.png" alt="Psicobienestarp" className="signature-mini-logo" />
            <div className="signature-details">
              <span className="signature-doc-name">Adriannis Rodríguez</span>
              <span className="signature-doc-role">Psicóloga Clínica • +7 Años de Experiencia</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="hero-btn-row">
            <button onClick={onBookClick} className="btn btn-primary btn-hero-action">
              <Calendar size={18} />
              <span>Agendar Mi Cita</span>
              <ArrowRight size={16} />
            </button>

            <a
              href={directWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-hero-whatsapp"
            >
              <MessageCircle size={18} />
              <span>WhatsApp Directo</span>
            </a>
          </div>
        </div>

        {/* Right Column: Fluid, organic flow of Claridad, Calma y Bienestar (NO CARDS) */}
        <div className="hero-fluid-pillars-flow">
          <div className="pillars-flow-header">
            <span className="flow-eyebrow">El Camino hacia tu Sanación</span>
            <h2 className="flow-title">Tu Transformación Terapéutica</h2>
          </div>

          <div className="pillars-ribbons-list">
            {pilares.map((p, idx) => (
              <div
                key={p.id}
                onMouseEnter={() => setActivePhrase(idx)}
                className={`pillar-ribbon-item ${activePhrase === idx ? 'ribbon-active' : ''}`}
                style={{
                  '--ribbon-bg': p.bgColor,
                  '--ribbon-accent': p.accentColor
                }}
              >
                <div className="ribbon-icon-sphere" style={{ backgroundColor: p.bgColor }}>
                  {p.icon}
                </div>

                <div className="ribbon-body">
                  <div className="ribbon-title-line">
                    <div className="ribbon-title-heading-wrap">
                      <span className="ribbon-pretitle">{p.pretitle}</span>
                      <span className="ribbon-main-title">{p.title}</span>
                    </div>
                    <span className="ribbon-tag-pill">{p.tag}</span>
                  </div>
                  <p className="ribbon-desc-text">{p.desc}</p>
                </div>

                <div className="ribbon-arrow-indicator">
                  <CheckCircle2 size={18} className="indicator-check" />
                </div>
              </div>
            ))}
          </div>

          <div className="pillars-trust-footnote">
            <span>Sesiones virtuales de 60 minutos con el mismo rigor y calidez que en consultorio 🌸</span>
          </div>
        </div>
      </div>
    </section>
  );
}
