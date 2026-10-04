import React from 'react';
import { Award, Globe2, ShieldCheck, HeartHandshake } from 'lucide-react';
import './StatsSection.css';

export default function StatsSection() {
  const stats = [
    {
      icon: <Award size={28} className="stat-icon" />,
      number: '7+',
      label: 'Años de Experiencia',
      description: 'Práctica clínica continua acompañando procesos individuales y de pareja.'
    },
    {
      icon: <Globe2 size={28} className="stat-icon" />,
      number: '5+',
      label: 'Países Atendidos',
      description: 'Pacientes en España, Venezuela, EE.UU., Chile, Colombia y más.'
    },
    {
      icon: <ShieldCheck size={28} className="stat-icon" />,
      number: '100%',
      label: 'Confidencialidad',
      description: 'Espacio seguro con estricto apego al secreto profesional y la ética.'
    },
    {
      icon: <HeartHandshake size={28} className="stat-icon" />,
      number: '300+',
      label: 'Sesiones Online',
      description: 'Encuentros virtuales con la misma calidez y efectividad presencial.'
    }
  ];

  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-grid">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card glass-card reveal active">
              <div className="stat-icon-wrapper">{stat.icon}</div>
              <div className="stat-number">{stat.number}</div>
              <h3 className="stat-label">{stat.label}</h3>
              <p className="stat-desc">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
