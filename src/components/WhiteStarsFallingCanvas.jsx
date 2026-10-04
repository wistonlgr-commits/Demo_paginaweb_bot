import React, { useEffect, useRef } from 'react';

/**
 * WhiteStarsFallingCanvas
 * Efecto de estrellas blancas cayendo en toda la web.
 * Se sobrepone a todo el contenido (z-index: 850) pero NO al footer (footer z-index: 9999).
 * pointer-events: none para no interferir con la navegación ni clics.
 */
export default function WhiteStarsFallingCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Cantidad de estrellas blancas cayendo
    const starCount = Math.floor(width / 22); // ~80 estrellas en desktop
    const stars = [];

    // Función para dibujar una estrella de 4 puntas
    const drawFourPointStar = (x, y, radius, alpha) => {
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';

      // Núcleo brillante
      ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Puntas de cruz
      ctx.beginPath();
      ctx.moveTo(x - radius * 1.8, y);
      ctx.lineTo(x + radius * 1.8, y);
      ctx.moveTo(x, y - radius * 1.8);
      ctx.lineTo(x, y + radius * 1.8);
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
      ctx.lineWidth = radius * 0.4;
      ctx.stroke();

      ctx.restore();
    };

    // Inicializar estrellas
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1.2,
        speedY: Math.random() * 1.2 + 0.6,
        driftSpeed: Math.random() * 0.02 + 0.01,
        driftAmp: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        isCross: Math.random() > 0.45,
        offset: Math.random() * Math.PI * 2
      });
    }

    let tick = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      tick++;

      // Obtener el rectángulo de la foto y stats de la psicóloga para que las estrellas NUNCA le pasen por el frente
      const photoEl = document.querySelector('.about-photo-column');
      const photoRect = photoEl ? photoEl.getBoundingClientRect() : null;

      for (let s of stars) {
        // Movimiento vertical descendente
        s.y += s.speedY;
        // Oscilación horizontal suave (viento sutil)
        s.x += Math.sin(tick * s.driftSpeed + s.offset) * s.driftAmp * 0.3;

        // Si sale por la parte inferior, reaparece arriba
        if (s.y > height + 20) {
          s.y = -20;
          s.x = Math.random() * width;
        }
        if (s.x > width + 20) s.x = -20;
        if (s.x < -20) s.x = width + 20;

        // Si la estrella cae dentro del área de la foto de Adriannis, NO dibujarla (pasa por detrás)
        if (
          photoRect &&
          s.x >= photoRect.left &&
          s.x <= photoRect.right &&
          s.y >= photoRect.top &&
          s.y <= photoRect.bottom
        ) {
          continue;
        }

        // Titileo suave
        const dynamicAlpha = s.alpha + Math.sin(tick * s.twinkleSpeed) * 0.2;
        const clampedAlpha = Math.max(0.15, Math.min(1, dynamicAlpha));

        // Dibujar estrella
        if (s.isCross) {
          drawFourPointStar(s.x, s.y, s.radius, clampedAlpha);
        } else {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${clampedAlpha})`;
          ctx.shadowBlur = 6;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 850, // Se sobrepone a todo el contenido, pero NO al footer (footer z-index: 1000)
        opacity: 0.95
      }}
    />
  );
}
