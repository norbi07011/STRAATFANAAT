/**
 * Fly-to-cart: kopia zdjęcia produktu leci łukiem do ikony koszyka w nagłówku,
 * a ikona „podskakuje” (zdarzenie 'sf:cart-bump').
 */
export const flyToCart = (src: string, from: DOMRect | null): Promise<void> =>
  new Promise((resolve) => {
    const target = document.querySelector('[data-cart-icon]') as HTMLElement | null;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!target || !from || reduce) {
      window.dispatchEvent(new Event('sf:cart-bump'));
      return resolve();
    }
    // nagłówek mógł się schować przy scrollu — pokaż go
    window.dispatchEvent(new Event('sf:show-header'));
    const to = target.getBoundingClientRect();
    const size = Math.min(from.width, 220);
    const el = document.createElement('img');
    el.src = src;
    el.alt = '';
    Object.assign(el.style, {
      position: 'fixed',
      left: `${from.left + from.width / 2 - size / 2}px`,
      top: `${from.top + from.height / 2 - (size * 1.5) / 2}px`,
      width: `${size}px`,
      height: `${size * 1.5}px`,
      objectFit: 'cover',
      zIndex: '600',
      pointerEvents: 'none',
      boxShadow: '0 20px 40px rgba(0,0,0,.35)',
      willChange: 'transform, opacity',
    });
    document.body.appendChild(el);
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const anim = el.animate(
      [
        { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 160}px) scale(0.55) rotate(-12deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.06) rotate(20deg)`, opacity: 0.4 },
      ],
      { duration: 850, easing: 'cubic-bezier(.5,0,.3,1)' }
    );
    anim.onfinish = () => {
      el.remove();
      window.dispatchEvent(new Event('sf:cart-bump'));
      resolve();
    };
  });
