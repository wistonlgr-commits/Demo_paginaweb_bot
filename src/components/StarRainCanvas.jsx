import React, { useEffect, useRef } from 'react';

export default function StarRainCanvas() {
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

    // 1. Static/Twinkling Stars
    const starCount = Math.floor((width * height) / 9000);
    const stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random(),
        speed: Math.random() * 0.02 + 0.005,
        color: Math.random() > 0.4 ? 'rgba(255, 235, 200, ' : 'rgba(255, 215, 225, '
      });
    }

    // 2. Falling Shooting Stars (Lluvia de Estrellas)
    const shootingStars = [];
    const maxShootingStars = 4;

    const createShootingStar = () => {
      const startX = Math.random() * (width + 300);
      const startY = Math.random() * -100;
      const length = Math.random() * 80 + 60;
      const speed = Math.random() * 5 + 4;
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.2; // approx 45 degrees

      return {
        x: startX,
        y: startY,
        length,
        speed,
        vx: -Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2 + 1.2,
        alpha: 1,
        fadeSpeed: Math.random() * 0.01 + 0.008,
        color: Math.random() > 0.5 ? '#FCEBD0' : '#FFFFFF'
      };
    };

    let tick = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw & Twinkle background stars
      for (let s of stars) {
        s.alpha += s.speed;
        if (s.alpha > 1 || s.alpha < 0.15) {
          s.speed = -s.speed;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.color + Math.abs(s.alpha) + ')';
        ctx.fill();
      }

      // Periodically spawn shooting stars
      tick++;
      if (tick % 60 === 0 && shootingStars.length < maxShootingStars && Math.random() > 0.3) {
        shootingStars.push(createShootingStar());
      }

      // Update & Draw shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        star.x += star.vx;
        star.y += star.vy;
        star.alpha -= star.fadeSpeed;

        if (star.alpha <= 0 || star.x < -100 || star.y > height + 100) {
          shootingStars.splice(i, 1);
          continue;
        }

        // Draw shooting star tail
        const tailX = star.x - star.vx * (star.length / star.speed);
        const tailY = star.y - star.vy * (star.length / star.speed);

        const gradient = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.alpha})`);
        gradient.addColorStop(0.3, `rgba(234, 165, 172, ${star.alpha * 0.7})`);
        gradient.addColorStop(1, 'rgba(252, 235, 208, 0)');

        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = star.size;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Draw glowing head
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size + 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#DE6B7C';
        ctx.fill();
        ctx.shadowBlur = 0; // reset
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
        zIndex: 50,
        opacity: 0.85
      }}
    />
  );
}
