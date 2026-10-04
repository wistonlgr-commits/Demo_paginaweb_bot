import React from 'react';
import { X, ShieldCheck, FileText, Lock, HeartHandshake } from 'lucide-react';
import './LegalModals.css';

export default function LegalModals({ activeModal, onClose }) {
  if (!activeModal) return null;

  return (
    <div className="legal-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="legal-modal-card glass-card" onClick={(e) => e.stopPropagation()}>
        <button className="legal-close-btn" onClick={onClose} aria-label="Cerrar ventana">
          <X size={22} />
        </button>

        {activeModal === 'terminos' && (
          <div className="legal-content-wrap">
            <div className="legal-header">
              <div className="legal-icon-wrap">
                <FileText size={26} className="text-primary-pink" />
              </div>
              <div>
                <h2 className="legal-title">Términos y Condiciones de Servicio</h2>
                <p className="legal-sub">PsicobienestarP • Lic. Adriannis Rodríguez</p>
              </div>
            </div>

            <div className="legal-body-scroll">
              <section className="legal-section">
                <h3>1. Naturaleza del Servicio</h3>
                <p>
                  <strong>PsicobienestarP</strong> ofrece servicios profesionales de orientación psicológica y psicoterapia clínica online, dirigidos por la <strong>Lic. Adriannis Rodríguez</strong>, profesional universitaria en Psicología Clínica.
                </p>
                <p>
                  Las sesiones tienen una duración de <strong>60 minutos</strong> por consulta y se llevan a cabo mediante plataformas digitales seguras (Google Meet, WhatsApp u otra plataforma acordada).
                </p>
              </section>

              <section className="legal-section">
                <h3>2. No Sustitución de Urgencias Médicas</h3>
                <p className="legal-alert-note">
                  ⚠️ <strong>Aviso Vital:</strong> La atención psicológica virtual NO constituye un servicio de urgencias médicas o emergencias psiquiátricas agudas. Si experimentas ideación autolítica inminente, descompensación psicótica grave o una crisis que amenace tu integridad física o la de otros, debes acudir de inmediato al centro de salud o servicio de urgencias más cercano en tu país de residencia.
                </p>
              </section>

              <section className="legal-section">
                <h3>3. Coordinación y Confirmación de Citas</h3>
                <p>
                  El registro realizado a través de este sitio web o la página de agenda constituye una solicitud de reserva. La confirmación formal de la fecha y hora se realiza a través de WhatsApp directo para coordinar el enlace de conexión y verificar la disponibilidad clínica.
                </p>
              </section>

              <section className="legal-section">
                <h3>4. Política de Cancelaciones y Reprogramaciones</h3>
                <p>
                  Entendemos que pueden surgir imprevistos. Te solicitamos avisar con al menos <strong>24 horas de anticipación</strong> en caso de requerir reprogramar tu sesión, respetando así el tiempo clínico reservado para tu proceso y el de otros pacientes.
                </p>
              </section>

              <section className="legal-section">
                <h3>5. Requisitos Técnicos y Entorno</h3>
                <p>
                  Para garantizar la efectividad del proceso psicoterapéutico, el paciente se compromete a conectarse desde un espacio privado, libre de distracciones y con conexión estable a internet, asegurando la confidencialidad de lo conversado en sesión.
                </p>
              </section>
            </div>

            <div className="legal-footer-actions">
              <button onClick={onClose} className="btn btn-primary legal-btn-understood">
                Entendido y de Acuerdo
              </button>
            </div>
          </div>
        )}

        {activeModal === 'privacidad' && (
          <div className="legal-content-wrap">
            <div className="legal-header">
              <div className="legal-icon-wrap">
                <ShieldCheck size={26} className="text-primary-pink" />
              </div>
              <div>
                <h2 className="legal-title">Política de Privacidad & Secreto Profesional</h2>
                <p className="legal-sub">Protección de Datos Clínicos y Confidencialidad</p>
              </div>
            </div>

            <div className="legal-body-scroll">
              <section className="legal-section">
                <h3>1. Compromiso Ético y Deontológico</h3>
                <p>
                  En <strong>PsicobienestarP</strong>, la confidencialidad es el pilar fundamental de la relación terapéutica. Toda la información compartida durante las sesiones y en los formularios de contacto está estrictamente amparada por el <strong>Secreto Profesional del Psicólogo</strong>, conforme a los principios deontológicos de la práctica clínica internacional.
                </p>
              </section>

              <section className="legal-section">
                <h3>2. Datos Recopilados</h3>
                <p>
                  Únicamente recopilamos los datos estrictamente necesarios para la gestión del servicio terapéutico:
                </p>
                <ul>
                  <li>Nombre y Apellido del paciente o consultante.</li>
                  <li>Número de teléfono / WhatsApp para coordinación directa.</li>
                  <li>País y zona horaria para sincronización precisa de las sesiones.</li>
                  <li>Motivo inicial de consulta y notas clínicas provistas voluntariamente.</li>
                </ul>
              </section>

              <section className="legal-section">
                <h3>3. No Divulgación a Terceros</h3>
                <p>
                  Tus datos personales y motivos de consulta jamás serán vendidos, cedidos, comercializados ni compartidos con empresas publicitarias, aseguradoras ni terceros bajo ninguna circunstancia.
                </p>
              </section>

              <section className="legal-section">
                <h3>4. Excepciones Éticas y Legales del Secreto Profesional</h3>
                <p>
                  De acuerdo con la legislación sanitaria y los códigos deontológicos de la psicología, el secreto profesional solo podrá quebrantarse en situaciones extraordinarias donde exista riesgo grave e inminente para la vida del propio paciente o de terceras personas, o por mandato judicial expreso.
                </p>
              </section>

              <section className="legal-section">
                <h3>5. Derechos del Usuario (ARCO)</h3>
                <p>
                  En cualquier momento puedes ejercer tus derechos de acceso, rectificación, cancelación u oposición respecto a tus datos personales, comunicándote directamente a través del correo oficial: <strong>Psic.adriannispsicobienestarp@gmail.com</strong>.
                </p>
              </section>
            </div>

            <div className="legal-footer-actions">
              <button onClick={onClose} className="btn btn-primary legal-btn-understood">
                Acepto y Comprendo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
