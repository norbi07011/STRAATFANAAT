/**
 * Canvas confetti / particle burst — romby i paski w barwach Hagi.
 * burst(x, y) w pikselach ekranu; zwraca Promise po zakończeniu.
 */
const COLORS = ['#ffd21f', '#22b35e', '#0b8a44', '#ffffff', '#ffd21f'];

export const confetti = (x = window.innerWidth / 2, y = window.innerHeight / 2, count = 160, spread = 1): Promise<void> =>
  new Promise((resolve) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return resolve();
    const canvas = document.createElement('canvas');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '500' });
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const parts = Array.from({ length: count }, () => {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1 * spread;
      const v = 8 + Math.random() * 14;
      return {
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        s: 6 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.35,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        shape: Math.random() < 0.6 ? 'diamond' : 'strip',
        life: 1,
      };
    });

    const t0 = performance.now();
    const frame = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      let alive = 0;
      for (const p of parts) {
        p.vy += 0.38;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life = Math.max(0, 1 - (now - t0) / 2600);
        if (p.y < h + 40 && p.life > 0) alive++;
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.abs(Math.cos(p.rot * 2)) * 0.8 + 0.2); // „trzepotanie”
        ctx.fillStyle = p.c;
        if (p.shape === 'diamond') {
          ctx.beginPath();
          ctx.moveTo(0, -p.s / 2);
          ctx.lineTo(p.s / 2, 0);
          ctx.lineTo(0, p.s / 2);
          ctx.lineTo(-p.s / 2, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(-p.s / 2, -p.s / 6, p.s, p.s / 3);
        }
        ctx.restore();
      }
      if (alive > 0) requestAnimationFrame(frame);
      else {
        canvas.remove();
        resolve();
      }
    };
    requestAnimationFrame(frame);
  });

/** Screen shake — krótkie drżenie całej strony */
export const screenShake = (strength: 'soft' | 'hard' = 'hard') => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const root = document.getElementById('root');
  if (!root) return;
  const cls = strength === 'hard' ? 'sf-shake-hard' : 'sf-shake-soft';
  root.classList.remove(cls);
  void root.offsetWidth;
  root.classList.add(cls);
  setTimeout(() => root.classList.remove(cls), 700);
};
