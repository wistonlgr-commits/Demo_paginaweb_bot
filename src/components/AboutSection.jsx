import React from 'react';
import { Award, Globe2, ShieldCheck, HeartHandshake } from 'lucide-react';
import './AboutSection.css';

export default function AboutSection({ onBookClick }) {
  const stats = [
    { number: '7+', label: 'Años de experiencia', icon: <Award size={20} /> },
    { number: '5+', label: 'Atención en más de 5 países', icon: <Globe2 size={20} /> },
    { number: '100%', label: 'Confidencialidad', icon: <ShieldCheck size={20} /> },
    { number: '300+', label: 'Sesiones realizadas', icon: <HeartHandshake size={20} /> }
  ];

  return (
    <section id="sobre" className="about-section">
      <div className="container">
        <div className="about-grid">
          {/* Left: Foto de Adriannis y caja de métricas debajo */}
          <div className="about-photo-column fade-in-left">
            <div className="about-photo-wrap">
              {/* Elementos gráficos decorativos nítidos y elegantes con flotación continua de fondo */}
              <div className="about-photo-backdrop-aura" aria-hidden="true">
                <div className="aura-ambient-glow"></div>

                {/* Flor de Sakura principal nítida */}
                <div className="floating-flower-element flower-main">
                  <svg viewBox="0 0 100 100" className="sakura-svg">
                    <defs>
                      <linearGradient id="sakuraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFE0E6" />
                        <stop offset="50%" stopColor="#F59BAA" />
                        <stop offset="100%" stopColor="#DE6B7C" />
                      </linearGradient>
                      <filter id="sakuraGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#DE6B7C" floodOpacity="0.25" />
                      </filter>
                    </defs>
                    <g filter="url(#sakuraGlow)">
                      <path d="M 50 50 C 40 30, 36 15, 45 8 C 47.5 5, 50 11, 50 11 C 50 11, 52.5 5, 55 8 C 64 15, 60 30, 50 50 Z" fill="url(#sakuraGrad)" />
                      <path d="M 50 50 C 40 30, 36 15, 45 8 C 47.5 5, 50 11, 50 11 C 50 11, 52.5 5, 55 8 C 64 15, 60 30, 50 50 Z" fill="url(#sakuraGrad)" transform="rotate(72 50 50)" />
                      <path d="M 50 50 C 40 30, 36 15, 45 8 C 47.5 5, 50 11, 50 11 C 50 11, 52.5 5, 55 8 C 64 15, 60 30, 50 50 Z" fill="url(#sakuraGrad)" transform="rotate(144 50 50)" />
                      <path d="M 50 50 C 40 30, 36 15, 45 8 C 47.5 5, 50 11, 50 11 C 50 11, 52.5 5, 55 8 C 64 15, 60 30, 50 50 Z" fill="url(#sakuraGrad)" transform="rotate(216 50 50)" />
                      <path d="M 50 50 C 40 30, 36 15, 45 8 C 47.5 5, 50 11, 50 11 C 50 11, 52.5 5, 55 8 C 64 15, 60 30, 50 50 Z" fill="url(#sakuraGrad)" transform="rotate(288 50 50)" />
                      <circle cx="50" cy="50" r="7.5" fill="#E86175" />
                      <circle cx="50" cy="50" r="4" fill="#FFF2F4" />
                      {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => (
                        <circle
                          key={`s-${i}`}
                          cx={50 + 9.5 * Math.cos((ang * Math.PI) / 180)}
                          cy={50 + 9.5 * Math.sin((ang * Math.PI) / 180)}
                          r="1.4"
                          fill="#FFE5EC"
                        />
                      ))}
                    </g>
                  </svg>
                </div>

                {/* Logo oficial PsicobienestarP nítido flotando con suavidad */}
                <div className="floating-flower-element logo-brand-element">
                  <img src="/cerebro.png" alt="PsicobienestarP" className="aura-logo-img" />
                </div>

                {/* Flor de Sakura secundaria flotando al otro lado */}
                <div className="floating-flower-element flower-secondary">
                  <svg viewBox="0 0 100 100" className="sakura-svg-small">
                    <g filter="url(#sakuraGlow)">
                      <path d="M 50 50 C 40 30, 36 15, 45 8 C 47.5 5, 50 11, 50 11 C 50 11, 52.5 5, 55 8 C 64 15, 60 30, 50 50 Z" fill="url(#sakuraGrad)" />
                      <path d="M 50 50 C 40 30, 36 15, 45 8 C 47.5 5, 50 11, 50 11 C 50 11, 52.5 5, 55 8 C 64 15, 60 30, 50 50 Z" fill="url(#sakuraGrad)" transform="rotate(72 50 50)" />
                      <path d="M 50 50 C 40 30, 36 15, 45 8 C 47.5 5, 50 11, 50 11 C 50 11, 52.5 5, 55 8 C 64 15, 60 30, 50 50 Z" fill="url(#sakuraGrad)" transform="rotate(144 50 50)" />
                      <path d="M 50 50 C 40 30, 36 15, 45 8 C 47.5 5, 50 11, 50 11 C 50 11, 52.5 5, 55 8 C 64 15, 60 30, 50 50 Z" fill="url(#sakuraGrad)" transform="rotate(216 50 50)" />
                      <path d="M 50 50 C 40 30, 36 15, 45 8 C 47.5 5, 50 11, 50 11 C 50 11, 52.5 5, 55 8 C 64 15, 60 30, 50 50 Z" fill="url(#sakuraGrad)" transform="rotate(288 50 50)" />
                      <circle cx="50" cy="50" r="6" fill="#E86175" />
                    </g>
                  </svg>
                </div>
              </div>

              <img
                src="/adriannis.png"
                alt="Psicóloga Adriannis Rodríguez"
                className="specialist-natural-img"
              />
            </div>

            {/* Caja de estadísticas debajo de la foto */}
            <div className="about-stats-grid">
              {stats.map((s, idx) => (
                <div key={idx} className={`about-stat-item fade-in-scale delay-${idx + 1}`}>
                  <div className="about-stat-num">{s.number}</div>
                  <div className="about-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Authentic Text and Beliefs */}
          <div className="about-text-column">
            <h2 className="about-section-heading fade-in-right">
              Ciencia y Empatía: <br />
              <span className="heading-sub-pink">Un enfoque integral para tu salud mental.</span>
            </h2>

            {/* Experience Block */}
            <div className="authentic-content-card fade-in-right delay-1">
              <h3 className="content-card-subtitle">Mi experiencia</h3>
              <p className="content-card-text">
                Soy Adriannis Rodríguez, psicóloga clínica con más de 7 años
                de experiencia ayudando a personas a reconectarse consigo mismas y recuperar su bienestar.
              </p>
            </div>

            {/* Beliefs Block */}
            <div className="authentic-content-card fade-in-right delay-2">
              <h3 className="content-card-subtitle">Mis creencias</h3>
              <p className="content-card-text">
                Creo que cada persona tiene dentro de sí los recursos para sanar, solo necesita
                un espacio seguro para descubrirlos. Durante mi trayectoria he acompañado a más de
                1,000 personas en procesos de gestión de la ansiedad, fortalecimiento
                de la autoestima, terapia de pareja, duelos, depresión y autosabotaje.
              </p>
              <p className="content-card-text mt-2">
                Mi misión es ayudarte a comprenderte, liberarte de lo que te limita y reconectar con tu bienestar.
              </p>
            </div>

            <div className="about-action-row fade-in-right delay-3">
              <button onClick={onBookClick} className="btn btn-primary">
                Agendar Consulta con Adriannis
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
