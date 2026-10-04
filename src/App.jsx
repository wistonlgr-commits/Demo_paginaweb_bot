import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import BookingCalendar from './components/BookingCalendar';
import ProcessSection from './components/ProcessSection';
import BenefitsSection from './components/BenefitsSection';
import TestimonialsSection from './components/TestimonialsSection';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import PsychologistDashboard from './components/PsychologistDashboard';
import StarRainCanvas from './components/StarRainCanvas';
import WhiteStarsFallingCanvas from './components/WhiteStarsFallingCanvas';
import AgendaPage from './pages/AgendaPage';

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedMotive, setSelectedMotive] = useState('');
  const [isAgendaRoute, setIsAgendaRoute] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.pathname === '/agenda' ||
      window.location.pathname === '/agenda/' ||
      window.location.pathname.startsWith('/agenda') ||
      window.location.hash === '#agenda'
    );
  });

  // Scroll Down Reveal Animations with Intersection Observer
  useEffect(() => {
    const observerCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          entry.target.classList.add('active');
          entry.target.setAttribute('data-revealed', 'true');
          observer.unobserve(entry.target);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.12
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const elementsToReveal = document.querySelectorAll(
      '.fade-in-on-scroll, .fade-in-scale, .fade-in-left, .fade-in-right, .reveal'
    );
    elementsToReveal.forEach((el) => observer.observe(el));

    // Detección automática de acceso admin por URL o hash
    if (
      window.location.hash === '#admin' ||
      window.location.pathname.startsWith('/admin') ||
      window.location.hostname.startsWith('admin.')
    ) {
      setIsAdminOpen(true);
    }

    const handleKeyDown = (e) => {
      // Atajo para la psicóloga: Alt + P
      if (e.altKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      elementsToReveal.forEach((el) => observer.unobserve(el));
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleScrollToBooking = () => {
    const el = document.getElementById('agendar');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectService = (motive) => {
    setSelectedMotive(motive);
    handleScrollToBooking();
  };

  if (isAgendaRoute) {
    return <AgendaPage />;
  }

  return (
    <div className="app-root">
      {/* Lluvia de estrellas de fondo */}
      <StarRainCanvas />

      {/* Lluvia de estrellas blancas que se sobrepone a todo excepto el footer */}
      <WhiteStarsFallingCanvas />

      {/* Navigation Header con barra superior de correo */}
      <Header onOpenAdminModal={() => setIsAdminOpen(true)} />

      {/* Main Content con padding-top de 98px para evitar cualquier sobreposición */}
      <main className="main-site-content">
        <Hero onBookClick={handleScrollToBooking} />
        <AboutSection onBookClick={handleScrollToBooking} />
        <ServicesSection onSelectService={handleSelectService} />
        <BookingCalendar preselectedMotive={selectedMotive} />
        <ProcessSection onBookClick={handleScrollToBooking} />
        <BenefitsSection />
        <TestimonialsSection />
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer onOpenAdminModal={() => setIsAdminOpen(true)} />

      {/* Floating Interactive WhatsApp CTA */}
      <FloatingWhatsApp />

      {/* Psychologist Clinical Dashboard (Master PIN Protected) */}
      <PsychologistDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
}
