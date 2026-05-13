/**
 * Origen de API que usa el navegador en E2E (ver `VITE_API_URL` en playwright.config).
 */
export const E2E_API_ORIGIN =
  process.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

export function isApiUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const base = new URL(E2E_API_ORIGIN);
    return u.origin === base.origin;
  } catch {
    return false;
  }
}

export function pathMatchesProductsList(url: string): boolean {
  if (!isApiUrl(url)) {
    return false;
  }
  const u = new URL(url);
  return u.pathname === '/products' && u.search === '';
}

export function pathMatchesProductById(url: string): boolean {
  if (!isApiUrl(url)) {
    return false;
  }
  const u = new URL(url);
  return /^\/products\/[0-9a-f-]{36}$/i.test(u.pathname);
}

export function pathMatchesInventoryByProductId(url: string): boolean {
  if (!isApiUrl(url)) {
    return false;
  }
  const u = new URL(url);
  return /^\/inventory\/[0-9a-f-]{36}$/i.test(u.pathname);
}

export function pathMatchesMovementsPost(url: string): boolean {
  if (!isApiUrl(url)) {
    return false;
  }
  const u = new URL(url);
  return u.pathname === '/movements';
}
