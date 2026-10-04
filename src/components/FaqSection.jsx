import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import './FaqSection.css';

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: '¿La terapia online tiene la misma efectividad que la presencial?',
      a: 'Sí. Numerosas investigaciones científicas confirman que la terapia online tiene exactamente la misma efectividad que la consulta en consultorio físico. Es ideal para quienes buscan comodidad, viajan con frecuencia o se sienten más cómodos abriéndose desde la intimidad de su hogar. Si en la primera sesión considero que tu motivo requiere atención hospitalaria o presencial, te lo comunicaré con total honestidad y ética.'
    },
    {
      q: '¿Qué sucede si hay fallas de conexión a internet durante la sesión?',
      a: 'No te preocupes, es un imprevisto técnico normal. Si la conexión se interrumpe, intentamos reconectar de inmediato por la vía principal o alternativa (como videollamada de WhatsApp). Si la caída persiste, reprogramamos los minutos restantes sin ningún costo adicional para ti.'
    },
    {
      q: '¿Cómo garantizas la privacidad y confidencialidad de la información?',
      a: 'Tu privacidad es prioritaria. Nuestras sesiones se realizan mediante plataformas cifradas de punto a punto (Google Meet o Zoom profesional). Como psicóloga clínica matriculada, toda la información compartida está blindada bajo estricto secreto profesional y las normas éticas internacionales de la psicología.'
    },
    {
      q: '¿Cuáles son los métodos de pago aceptados para las sesiones?',
      a: 'Puedes abonar cómodamente según tu país de residencia a través de Zelle (EE.UU.), PayPal (tarjetas internacionales) o Transferencia Bancaria (Venezuela y cuentas autorizadas). El pago se realiza de manera previa a la sesión para bloquear definitivamente el espacio en la agenda.'
    },
    {
      q: '¿Cómo valido mi cita desde este sitio web?',
      a: 'Es muy fácil: eliges el día y la hora disponible en el calendario interactivo superior, completas tus datos de contacto básicos y haces clic en "Validar Cita". Aparecerá un botón para abrir WhatsApp con un mensaje pre-redactado; al enviármelo, coordinamos la confirmación oficial al instante.'
    }
  ];

  const toggleFaq = (index) => {
    setOpenIdx(openIdx === index ? -1 : index);
  };

  return (
    <section id="faq" className="faq-section section-padding">
      <div className="container">
        <div className="faq-header text-center fade-in-on-scroll">
          <div className="section-badge">
            <HelpCircle size={16} />
            <span>Resolviendo Inquietudes</span>
          </div>
          <h2 className="section-title">
            ¿Tienes dudas sobre el proceso? <br />
            <span className="text-gradient">Aquí respondo lo más habitual</span>
          </h2>
          <p className="section-subtitle">
            Iniciar un proceso de psicoterapia es un acto de valentía. Queremos que tengas
            toda la claridad posible antes de dar el primer paso.
          </p>
        </div>

        <div className="faq-accordion-wrapper fade-in-on-scroll">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`faq-item glass-card ${openIdx === idx ? 'expanded' : ''}`}
            >
              <button
                className="faq-question-btn"
                onClick={() => toggleFaq(idx)}
                aria-expanded={openIdx === idx}
              >
                <span className="faq-q-text">{faq.q}</span>
                <ChevronDown size={20} className="faq-chevron" />
              </button>

              <div className="faq-answer-collapse">
                <div className="faq-answer-content">
                  <p>{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
