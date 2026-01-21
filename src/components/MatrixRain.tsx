import { useEffect, useRef } from 'react';

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>{}[]|\\/@#$%&*+=';
    const charArray = chars.split('');

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);

    const drops: number[] = new Array(columns).fill(1);
    const speeds: number[] = new Array(columns).fill(0).map(() => Math.random() * 0.5 + 0.3);

    const getThemeColor = () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      const terminalGlow = computedStyle.getPropertyValue('--terminal-glow').trim();
      
      if (terminalGlow) {
        const [h, s, l] = terminalGlow.split(' ').map(v => parseFloat(v));
        return { h, s, l };
      }
      return { h: 120, s: 100, l: 50 }; // Default matrix green
    };

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const { h, s, l } = getThemeColor();
      
      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = charArray[Math.floor(Math.random() * charArray.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Brighter head
        const brightness = Math.min(l + 20, 80);
        ctx.fillStyle = `hsla(${h}, ${s}%, ${brightness}%, 0.9)`;
        ctx.fillText(char, x, y);

        // Trailing effect with gradient
        if (drops[i] > 1) {
          for (let j = 1; j <= 8; j++) {
            const trailY = y - j * fontSize;
            if (trailY > 0) {
              const alpha = (1 - j / 10) * 0.4;
              const trailL = Math.max(l - j * 5, 15);
              ctx.fillStyle = `hsla(${h}, ${s}%, ${trailL}%, ${alpha})`;
              const trailChar = charArray[Math.floor(Math.random() * charArray.length)];
              ctx.fillText(trailChar, x, trailY);
            }
          }
        }

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i] += speeds[i];
      }
    };

    const interval = setInterval(draw, 33);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="matrix-rain"
      aria-hidden="true"
    />
  );
};

export default MatrixRain;
