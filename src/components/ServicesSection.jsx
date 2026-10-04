import React from 'react';
import { 
  Heart, 
  BrainCircuit, 
  Compass, 
  Users, 
  Sparkles, 
  Plane,
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';
import './ServicesSection.css';

export default function ServicesSection({ onSelectService }) {
  const services = [
    {
      id: 'ansiedad',
      icon: <BrainCircuit size={28} />,
      title: 'Ansiedad y Manejo del Estrés',
      description: 'Herramientas prácticas para gestionar el desbordamiento emocional, frenar la rumiación constante y regular tu sistema nervioso.',
      badge: 'Más solicitado',
      motiveTag: 'Ansiedad y gestión emocional'
    },
    {
      id: 'duelo',
      icon: <Heart size={28} />,
      title: 'Gestión de Duelos y Pérdidas',
      description: 'Acompañamiento compasivo para atravesar el dolor de una pérdida afectiva, duelo migratorio o cambio de ciclo de vida.',
      badge: 'Espacio cálido',
      motiveTag: 'Duelo y pérdidas'
    },
    {
      id: 'autoestima',
      icon: <Sparkles size={28} />,
      title: 'Autoestima y Amor Propio',
      description: 'Sanar la autocrítica destructiva, construir un autoconcepto seguro y aprender a poner límites saludables sin culpa.',
      badge: 'Desarrollo personal',
      motiveTag: 'Autoestima y límites'
    },
    {
      id: 'pareja',
      icon: <Users size={28} />,
      title: 'Terapia de Pareja y Vínculos',
      description: 'Mejora la comunicación asertiva, comprende los estilos de apego y recupera la complicidad o cierra ciclos con respeto.',
      badge: 'Relaciones sanas',
      motiveTag: 'Terapia de pareja'
    },
    {
      id: 'autosabotaje',
      icon: <Compass size={28} />,
      title: 'Autosabotaje y Hábitos',
      description: 'Desactiva los patrones inconscientes que frenan tus proyectos, vence la procrastinación y alinea tus metas con tus valores.',
      badge: 'Crecimiento',
      motiveTag: 'Autosabotaje y hábitos'
    },
    {
      id: 'migracion',
      icon: <Plane size={28} />,
      title: 'Apoyo Psicológico al Migrante',
      description: 'Acompañamiento a personas viviendo fuera de su país de origen, gestionando el choque cultural, la nostalgia y la adaptación.',
      badge: 'Sin fronteras',
      motiveTag: 'Duelo migratorio y adaptación'
    }
  ];

  return (
    <section id="servicios" className="services-section section-padding">
      <div className="container">
        <div className="services-header text-center fade-in-on-scroll">
          <div className="section-badge">
            <ShieldCheck size={16} />
            <span>Áreas de Intervención</span>
          </div>
          <h2 className="section-title">
            Un espacio seguro para abordar <br />
            <span className="text-gradient">lo que realmente te preocupa</span>
          </h2>
          <p className="section-subtitle">
            No necesitas tener un diagnóstico grave para pedir ayuda. La terapia es para ti
            si buscas conocerte mejor, sientes estrés recurrente o deseas sanar desde la raíz.
          </p>
        </div>

        <div className="services-grid">
          {services.map((s, idx) => (
            <div key={s.id} className={`service-card glass-card fade-in-scale delay-${(idx % 3) + 1}`}>
              <div className="card-top">
                <div className="service-icon-box">{s.icon}</div>
                <span className="service-pill">{s.badge}</span>
              </div>
              <h3 className="service-title">{s.title}</h3>
              <p className="service-description">{s.description}</p>
              
              <button
                onClick={() => onSelectService(s.motiveTag)}
                className="service-cta-btn"
              >
                <span>Agendar consulta para esto</span>
                <ArrowRight size={16} className="arrow-icon" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
