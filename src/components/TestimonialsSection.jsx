import React from 'react';
import { Star, Quote, CheckCircle } from 'lucide-react';
import './TestimonialsSection.css';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'María V.',
      role: 'Paciente desde España (Terapia Online)',
      quote: 'Un antes y un después en mi ansiedad. Llegué a consulta sintiéndome sobrepasada por las dudas y la rutina. Adriannis me brindó herramientas claras y prácticas desde la primera sesión. Hoy vivo con mucha más serenidad y confianza.',
      stars: 5
    },
    {
      name: 'Dra. Elena G.',
      role: 'Médico • Sector Salud',
      quote: 'Un espacio seguro para sanar. Por mi profesión médica, me costaba mucho pedir ayuda y reconocer el agotamiento. Su calidez humana y rigor clínico me permitieron reconstruir mi equilibrio sin sentirme juzgada.',
      stars: 5
    },
    {
      name: 'Carlos R.',
      role: 'Profesional independiente (Venezuela)',
      quote: 'Calidez humana y rigor profesional impecable. La terapia me ayudó a sanar patrones de pareja y a comunicarme con honestidad. Muy agradecido por la cercanía y la flexibilidad en los horarios.',
      stars: 5
    }
  ];

  return (
    <section id="testimonios" className="testimonials-section section-padding">
      <div className="container">
        <div className="testimonials-header text-center fade-in-on-scroll">
          <div className="section-badge">
            <Quote size={16} />
            <span>Testimonios Reales</span>
          </div>
          <h2 className="section-title">
            Lo que dicen quienes ya han <br />
            <span className="text-gradient">confiado en su propio proceso</span>
          </h2>
          <p className="section-subtitle">
            Cada historia es única. Conoce la experiencia de personas que decidieron
            priorizar su bienestar emocional y transformar su vida.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, idx) => (
            <div key={idx} className={`testimonial-card glass-card fade-in-scale delay-${(idx % 3) + 1}`}>
              <div className="stars-row">
                {[...Array(t.stars)].map((_, i) => (
                  <Star key={i} size={18} fill="#D4A373" color="#D4A373" />
                ))}
              </div>

              <p className="testimonial-quote">"{t.quote}"</p>

              <div className="testimonial-author-box">
                <div className="author-avatar">{t.name[0]}</div>
                <div>
                  <h4 className="author-name">
                    {t.name}
                    <CheckCircle size={14} className="verified-check" title="Paciente verificado" />
                  </h4>
                  <span className="author-role">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
