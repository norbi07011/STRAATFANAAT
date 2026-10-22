import React, { lazy, Suspense, useEffect } from 'react';
import { PRODUCTS } from './constants';
import { StoreProvider, useStore } from './site/store';
import { NavProvider, useNav } from './site/nav';
import { Header } from './site/Header';
import { Footer } from './site/Footer';
import { CartDrawer } from './site/CartDrawer';
import { WaitlistModal } from './site/WaitlistModal';
import { ScrollProgress } from './site/fx/scroll';
import { ParticleIntro } from './site/fx/ParticleIntro';
import { VictoryScene } from './site/fx/VictoryScene';
import { Cursor } from './site/fx/Cursor';
import { Toasts } from './site/Toasts';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductPage } from './pages/ProductPage';
import { Lookbook } from './pages/Lookbook';
import { About, NotFound } from './pages/About';

// Kasa i panel admina ładowane dopiero gdy są potrzebne (mniejszy bundle startowy)
const Checkout = lazy(() => import('./components/Checkout').then((m) => ({ default: m.Checkout })));
const AdminPanel = lazy(() => import('./components/AdminPanel').then((m) => ({ default: m.AdminPanel })));

const products = PRODUCTS;

const Loading = () => (
  <div className="flex min-h-screen items-center justify-center bg-black">
    <span className="h-8 w-8 animate-spin rounded-full border-4 border-haag-yellow border-t-transparent" />
  </div>
);

const Pages = () => {
  const { route, navigate } = useNav();
  const { lang, cart, clearCart } = useStore();

  useEffect(() => {
    const product = route.page === 'product' ? products.find((p) => p.id === route.id) : undefined;
    const names: Record<string, string> = { shop: 'Shop', lookbook: 'Lookbook', about: 'About', checkout: 'Checkout', admin: 'Admin', notfound: '404' };
    const title = product ? product.name : names[route.page];
    document.title = title ? `${title} — STRAATFANAAT` : 'STRAATFANAAT — streetwear uit Den Haag';
  }, [route]);

  switch (route.page) {
    case 'home':
      return <Home products={products} />;
    case 'shop':
      return <Shop products={products} />;
    case 'product':
      return <ProductPage productId={route.id} products={products} />;
    case 'lookbook':
      return <Lookbook />;
    case 'about':
      return <About />;
    case 'checkout':
      return (
        <Suspense fallback={<Loading />}>
          <Checkout lang={lang} cart={cart} onBack={() => navigate('shop')} onSuccess={() => navigate('home')} clearCart={clearCart} />
        </Suspense>
      );
    case 'admin':
      return (
        <Suspense fallback={<Loading />}>
          <AdminPanel lang={lang} />
        </Suspense>
      );
    default:
      return <NotFound />;
  }
};

const Shell = () => {
  const { route } = useNav();
  return (
    <>
      <a href="#main" className="sr-only z-[300] bg-haag-yellow p-3 text-black focus:not-sr-only focus:fixed focus:left-2 focus:top-2">
        Skip to content
      </a>
      <ScrollProgress />
      <Header />
      <main id="main">
        <Pages />
      </main>
      {route.page !== 'admin' && <Footer />}
      <CartDrawer />
      <WaitlistModal />
      <VictoryScene />
      <Toasts />
      <Cursor />
      <ParticleIntro logo="/images/cutout/logo.webp" />
    </>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <NavProvider>
        <Shell />
      </NavProvider>
    </StoreProvider>
  );
}
