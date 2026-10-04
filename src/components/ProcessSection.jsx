import React from 'react';
import { MessageSquare, CalendarCheck, Video, ArrowRight } from 'lucide-react';
import './ProcessSection.css';

export default function ProcessSection({ onBookClick }) {
  const steps = [
    {
      number: '01',
      icon: <MessageSquare size={26} />,
      title: 'Contacto Directo',
      desc: 'Elige tu fecha en la agenda interactiva o escríbeme por WhatsApp. Cuéntame brevemente qué te motiva a iniciar este proceso.'
    },
    {
      number: '02',
      icon: <CalendarCheck size={26} />,
      title: 'Confirmación y Pago',
      desc: 'Validamos tu horario y coordinamos el método de pago más cómodo para ti (Zelle, PayPal o Transferencia Bancaria).'
    },
    {
      number: '03',
      icon: <Video size={26} />,
      title: 'Tu Primera Sesión Online',
      desc: 'Nos conectamos mediante videollamada cifrada y segura para comenzar a trabajar en tus metas con calma y total empatía.'
    }
  ];

  return (
    <section id="proceso" className="process-section section-padding">
      <div className="container">
        <div className="process-header text-center fade-in-on-scroll">
          <div className="section-badge">
            <span>Paso a Paso</span>
          </div>
          <h2 className="section-title">
            Iniciar tu proceso terapéutico <br />
            <span className="text-gradient">es simple y sin complicaciones</span>
          </h2>
          <p className="section-subtitle">
            La modalidad virtual mantiene el mismo nivel de conexión profunda y rigor clínico
            que una consulta presencial, adaptándonos con comodidad a tu ritmo y país de residencia.
          </p>
        </div>

        <div className="process-steps-grid">
          {steps.map((step, idx) => (
            <div key={idx} className={`process-step-card glass-card fade-in-scale delay-${idx + 1}`}>
              <div className="step-card-header">
                <div className="step-icon-box">{step.icon}</div>
                <span className="step-big-num">{step.number}</span>
              </div>
              <h3 className="step-card-title">{step.title}</h3>
              <p className="step-card-desc">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="process-cta-center fade-in-on-scroll delay-3">
          <button onClick={onBookClick} className="btn btn-primary">
            <span>Comenzar Mi Cambio Hoy</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
