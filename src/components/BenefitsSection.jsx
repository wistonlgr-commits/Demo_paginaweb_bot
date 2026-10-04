import React from 'react';
import { Home, Sparkles, Globe, Shield } from 'lucide-react';
import './BenefitsSection.css';

export default function BenefitsSection() {
  const benefits = [
    {
      icon: <Home size={26} />,
      title: 'Comodidad y Privacidad Total',
      desc: 'Evita traslados, tráfico y salas de espera. Conéctate desde la calidez de tu propio espacio con total libertad y discreción.',
      img: '/carrusel1.png'
    },
    {
      icon: <Sparkles size={26} />,
      title: 'Misma Calidez y Rigor Clínico',
      desc: 'La evidencia científica demuestra que la alianza terapéutica online logra los mismos resultados profundos que la modalidad presencial.',
      img: '/carrusel2.png'
    },
    {
      icon: <Globe size={26} />,
      title: 'Atención Sin Fronteras',
      desc: 'Tu ubicación geográfica no es un límite. Ajustamos los horarios de forma personalizada según tu país y zona horaria.',
      img: '/carrusel3.png'
    }
  ];

  return (
    <section className="benefits-section section-padding">
      <div className="container">
        <div className="benefits-header text-center fade-in-on-scroll">
          <div className="section-badge">
            <Shield size={16} />
            <span>Ventajas de la Modalidad Virtual</span>
          </div>
          <h2 className="section-title">
            Tu proceso terapéutico, <br />
            <span className="text-gradient">sin barreras ni distancias</span>
          </h2>
          <p className="section-subtitle">
            Cuidar tu salud mental nunca fue tan accesible. Diseñado para personas con ritmos
            de vida activos, que viajan con frecuencia o valoran la intimidad de su hogar.
          </p>
        </div>

        <div className="benefits-grid">
          {benefits.map((b, i) => (
            <div key={i} className={`benefit-card glass-card fade-in-scale delay-${i + 1}`}>
              <div className="benefit-img-wrapper">
                <img src={b.img} alt={b.title} className="benefit-img" loading="lazy" />
              </div>
              <div className="benefit-content">
                <div className="benefit-icon-badge">{b.icon}</div>
                <h3 className="benefit-title">{b.title}</h3>
                <p className="benefit-desc">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
