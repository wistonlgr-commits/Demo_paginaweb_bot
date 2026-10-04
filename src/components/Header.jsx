import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Lock, Menu, X, Mail } from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import './Header.css';

export default function Header({ onOpenAdminModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Si el menú móvil está abierto, no ocultar la barra
      if (mobileMenuOpen) return;

      if (currentScrollY > 70) {
        if (currentScrollY > lastScrollY.current) {
          // Scroll hacia abajo -> ocultar menú superior
          setIsHeaderHidden(true);
        } else if (currentScrollY < lastScrollY.current) {
          // Scroll hacia arriba -> mostrar menú superior
          setIsHeaderHidden(false);
        }
      } else {
        // En el tope de la página -> siempre visible
        setIsHeaderHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen]);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/#${id}`;
    }
  };

  return (
    <div className={`header-wrapper-fixed ${isHeaderHidden ? 'header-hidden' : ''}`}>
      {/* 1. Barra Superior con Dirección de Correo y Acceso */}
      <div className="top-contact-bar">
        <div className="container top-contact-container">
          <a
            href="mailto:Psic.adriannispsicobienestarp@gmail.com"
            className="top-email-link"
          >
            <Mail size={14} />
            <span>Contacto: Psic.adriannispsicobienestarp@gmail.com</span>
          </a>

          <a
            href="https://www.instagram.com/psicobienestarp/"
            target="_blank"
            rel="noopener noreferrer"
            className="top-instagram-link"
            title="Instagram @psicobienestarp"
          >
            <InstagramIcon size={14} />
            <span>Instagram: @psicobienestarp</span>
          </a>
        </div>
      </div>

      {/* 2. Barra de Navegación Principal */}
      <nav className="main-navbar">
        <div className="container navbar-container">
          {/* Brand Logo & Name */}
          <a
            href="/"
            className="navbar-brand"
            onClick={(e) => {
              const el = document.getElementById('inicio');
              if (el) {
                e.preventDefault();
                scrollTo('inicio');
              }
            }}
          >
            <img src="/logo.png" alt="Psicobienestarp Logo" className="navbar-logo-img" />
            <span className="navbar-brand-name">Psicobienestarp</span>
          </a>

          {/* Clean Navigation Links */}
          <div className="navbar-nav-links">
            <button onClick={() => scrollTo('inicio')} className="nav-item-btn">INICIO</button>
            <button onClick={() => scrollTo('sobre')} className="nav-item-btn">SOBRE MI</button>
            <button onClick={() => scrollTo('servicios')} className="nav-item-btn">SERVICIOS</button>
            <button onClick={() => scrollTo('agendar')} className="nav-item-btn">AGENDAR CITA</button>
          </div>

          {/* Right Action CTA */}
          <div className="navbar-actions">
            <button
              onClick={() => scrollTo('agendar')}
              className="btn-nav-agendar"
            >
              <Calendar size={15} />
              <span>Agendar Cita</span>
            </button>

            {/* Mobile toggle */}
            <button
              className="navbar-burger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown drawer */}
        {mobileMenuOpen && (
          <div className="navbar-mobile-drawer">
            <button onClick={() => scrollTo('inicio')} className="drawer-link">INICIO</button>
            <button onClick={() => scrollTo('sobre')} className="drawer-link">SOBRE MI</button>
            <button onClick={() => scrollTo('servicios')} className="drawer-link">SERVICIOS</button>
            <button onClick={() => scrollTo('agendar')} className="drawer-link">AGENDAR CITA</button>
            <div className="drawer-footer-actions">
              <a
                href="https://www.instagram.com/psicobienestarp/"
                target="_blank"
                rel="noopener noreferrer"
                className="drawer-instagram-link"
              >
                <InstagramIcon size={16} />
                <span>Instagram @psicobienestarp</span>
              </a>
              <button onClick={() => scrollTo('agendar')} className="btn btn-primary" style={{ width: '100%' }}>
                <Calendar size={16} /> Agendar Cita
              </button>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
