import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAnimate, useReducedMotion } from 'motion/react';
import Lenis from 'lenis';
import { Page } from '../types';
import { parseRoute, Route, routeKey, routeToPath } from '../lib/router';

interface Nav {
  route: Route;
  navigate: (page: Page, id?: string) => void;
  lenis: React.MutableRefObject<Lenis | null>;
  /** true w trakcie zasłaniania ekranu przez przejście */
  transitioning: boolean;
}

const NavCtx = createContext<Nav | null>(null);

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];
const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

/**
 * Routing oparty o History API + przejście „szalikiem”:
 * pas w barwach Hagi zasłania ekran, podmieniamy stronę, pas odjeżdża w górę.
 */
export const NavProvider = ({ children }: { children: React.ReactNode }) => {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.pathname));
  const [transitioning, setTransitioning] = useState(false);
  const [label, setLabel] = useState('');
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const reduce = useReducedMotion();
  const busy = useRef(false);
  const lenis = useRef<Lenis | null>(null);
  const routeRef = useRef(route);
  routeRef.current = route;

  // Płynny scroll
  useEffect(() => {
    if (reduce) return;
    const l = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.current = l;
    let raf = 0;
    const loop = (t: number) => {
      l.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      l.destroy();
      lenis.current = null;
    };
  }, [reduce]);

  const toTop = () => {
    lenis.current?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  };

  const go = useCallback(
    async (next: Route, push: boolean) => {
      if (busy.current) return;
      if (routeKey(next) === routeKey(routeRef.current)) {
        lenis.current ? lenis.current.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (push) window.history.pushState(null, '', routeToPath(next));

      if (reduce || !scope.current) {
        setRoute(next);
        toTop();
        return;
      }

      busy.current = true;
      setTransitioning(true);
      setLabel(next.page === 'product' ? 'drop' : next.page === 'home' ? 'straatfanaat' : next.page);
      await animate(scope.current, { y: ['100%', '0%'] }, { duration: 0.5, ease: EASE });
      setRoute(next);
      toTop();
      await nextFrame();
      await animate(scope.current, { y: ['0%', '-100%'] }, { duration: 0.6, ease: EASE, delay: 0.05 });
      setTransitioning(false);
      busy.current = false;
    },
    [animate, reduce, scope]
  );

  const navigate = useCallback((page: Page, id?: string) => go({ page, id }, true), [go]);

  useEffect(() => {
    const onPop = () => go(parseRoute(window.location.pathname), false);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [go]);

  return (
    <NavCtx.Provider value={{ route, navigate, lenis, transitioning }}>
      {children}
      {/* Kurtyna przejścia */}
      <div
        ref={scope}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[200] flex flex-col"
        style={{ transform: 'translateY(100%)' }}
      >
        <div className="h-6 scarf-stripes" />
        <div className="flex flex-1 items-center justify-center overflow-hidden bg-black">
          <span className="font-banner select-none text-[22vw] text-haag-yellow md:text-[16vw]">{label}</span>
        </div>
        <div className="h-6 scarf-stripes" />
      </div>
    </NavCtx.Provider>
  );
};

export const useNav = () => {
  const ctx = useContext(NavCtx);
  if (!ctx) throw new Error('useNav must be used inside NavProvider');
  return ctx;
};

/** Link, który działa z routerem, ale zachowuje prawdziwy href (otwórz w nowej karcie, SEO). */
export const NavLink = ({
  page,
  id,
  className,
  children,
  onClick,
  ...rest
}: { page: Page; id?: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const { navigate } = useNav();
  return (
    <a
      href={routeToPath({ page, id })}
      className={className}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(page, id);
      }}
      {...rest}
    >
      {children}
    </a>
  );
};
