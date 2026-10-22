import { Page } from '../types';

export interface Route {
  page: Page;
  id?: string;
}

export const parseRoute = (pathname: string): Route => {
  const parts = pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  const [first, second] = parts;
  switch (first) {
    case undefined:
      return { page: 'home' };
    case 'shop':
      return { page: 'shop' };
    case 'product':
      return second ? { page: 'product', id: second } : { page: 'shop' };
    case 'lookbook':
      return { page: 'lookbook' };
    case 'about':
      return { page: 'about' };
    case 'checkout':
      return { page: 'checkout' };
    case 'admin':
      return { page: 'admin' };
    default:
      return { page: 'notfound' };
  }
};

export const routeToPath = (route: Route): string => {
  switch (route.page) {
    case 'home':
      return '/';
    case 'product':
      return `/product/${route.id ?? ''}`;
    case 'notfound':
      return window.location.pathname;
    default:
      return `/${route.page}`;
  }
};

export const routeKey = (route: Route) => `${route.page}:${route.id ?? ''}`;
