import React, { useState } from 'react';
import { Lock, ShieldCheck, Phone, Globe, Mail } from 'lucide-react';
import { WHATSAPP_PHONE } from '../services/appointmentService';
import LegalModals from './LegalModals';
import InstagramIcon from './InstagramIcon';
import './Footer.css';

export default function Footer({ onOpenAdminModal }) {
  const [legalModal, setLegalModal] = useState(null);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-top-grid fade-in-on-scroll">
          {/* Brand Info */}
          <div className="footer-brand-col">
            <div className="footer-logo-row">
              <img src="/logo.png" alt="Psicobienestarp Logo" className="footer-logo-img" />
              <div className="footer-brand-title-box">
                <span className="footer-brand-title">Psicobienestarp</span>
                <span className="footer-brand-subtitle">Atención Psicológica Online</span>
              </div>
            </div>
            <p className="footer-desc">
              Espacio terapéutico seguro, empático y confidencial dirigido por la <strong>Lic. Adriannis Rodríguez</strong>.
              Más de 7 años acompañando procesos de transformación y bienestar mental sin barreras geográficas.
            </p>
            <div className="footer-meta-pill">
              <ShieldCheck size={16} />
              <span>Práctica Clínica Ética y Confidencial</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-nav-col">
            <h4 className="footer-col-title">Navegación</h4>
            <ul className="footer-nav-list">
              <li><button onClick={() => scrollTo('inicio')}>Inicio</button></li>
              <li><button onClick={() => scrollTo('sobre')}>Sobre Mí</button></li>
              <li><button onClick={() => scrollTo('servicios')}>Áreas de Consulta</button></li>
              <li><button onClick={() => scrollTo('proceso')}>Cómo Funciona</button></li>
              <li><button onClick={() => scrollTo('agendar')}>Agendar Cita</button></li>
              <li><button onClick={() => scrollTo('faq')}>Preguntas Frecuentes</button></li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div className="footer-contact-col">
            <h4 className="footer-col-title">Contacto Directo</h4>
            <div className="footer-contact-items">
              <a
                href={`https://wa.me/${WHATSAPP_PHONE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-item"
              >
                <Phone size={18} className="text-primary-pink" />
                <span>+58 412-4335625 (WhatsApp)</span>
              </a>

              <a
                href="https://www.instagram.com/psicobienestarp/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-item"
              >
                <InstagramIcon size={18} className="text-primary-pink" />
                <span>Instagram: @psicobienestarp</span>
              </a>

              <div className="footer-contact-item">
                <Mail size={18} className="text-primary-pink" />
                <span>Psic.adriannispsicobienestarp@gmail.com</span>
              </div>

              <div className="footer-contact-item">
                <Globe size={18} className="text-primary-pink" />
                <span>Atención Online Internacional</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Disclaimer */}
        <div className="footer-disclaimer-box fade-in-on-scroll delay-1">
          <p>
            <strong>Aviso Clínico Importante:</strong> El servicio de atención psicológica online está orientado al crecimiento personal, terapia individual y de pareja, gestión de la ansiedad, el estrés y el duelo. No sustituye un servicio de urgencias o emergencias médicas ni hospitalización psiquiátrica. En caso de riesgo inmediato o crisis aguda, acude al centro de salud más cercano en tu país.
          </p>
        </div>

        {/* Legal Links */}
        <div className="footer-legal-links-row fade-in-on-scroll delay-2">
          <button onClick={() => setLegalModal('terminos')} className="legal-text-link">
            Términos y Condiciones
          </button>
          <span className="legal-dot-sep">•</span>
          <button onClick={() => setLegalModal('privacidad')} className="legal-text-link">
            Políticas de Privacidad & Secreto Profesional
          </button>
        </div>

        {/* Copyright & Créditos */}
        <div className="footer-bottom-row fade-in-on-scroll delay-2">
          <p>© {new Date().getFullYear()} Psicobienestarp – Todos los derechos reservados.</p>
          <p className="made-with-care">
            🌸 Tu bienestar comienza en tu espacio seguro
          </p>
          <p className="footer-developer-credit">
            Apasionadamente desarrollado por{' '}
            <a
              href="https://vissionsolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="dev-credit-link"
            >
              vissionsolutions.com
            </a>
          </p>
        </div>
      </div>

      {/* Modal interactivo de Términos y Privacidad */}
      <LegalModals activeModal={legalModal} onClose={() => setLegalModal(null)} />
    </footer>
  );
}
