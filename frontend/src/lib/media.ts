/**
 * Resolves media URLs for both local dev (http://localhost:5000) and production (Vercel + Render)
 */
export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  const cleanUrl = url.trim();
  if (!cleanUrl) return '';

  // Data URIs pass through directly
  if (cleanUrl.startsWith('data:')) return cleanUrl;

  // Determine current API base host
  let apiBase = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '')
    : 'https://sunma-ceramic.onrender.com';

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host.startsWith('192.168.') || host.startsWith('127.0.')) {
      apiBase = `http://${host}:5000`;
    }
  }

  // Relative API URLs
  if (cleanUrl.startsWith('/')) {
    return `${apiBase}${cleanUrl}`;
  }

  // Rewrite localhost URLs when loaded on production Vercel
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && cleanUrl.includes('localhost:5000')) {
    return cleanUrl.replace(/^http:\/\/localhost:5000/, apiBase);
  }

  return cleanUrl;
}
