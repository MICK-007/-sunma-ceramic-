/**
 * Universal Media URL Resolver (Multi-Tier Safety Net)
 * Works in Local Dev, Vercel Production, Render API, and Supabase Storage.
 */
export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  const cleanUrl = url.trim();
  if (!cleanUrl) return '';

  // Data URIs pass through directly for non-persisted local previews
  if (cleanUrl.startsWith('data:')) return cleanUrl;

  // Determine Active API Base Host
  let apiBase = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '')
    : 'https://sunma-ceramic.onrender.com';

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host.startsWith('192.168.') || host.startsWith('127.0.')) {
      apiBase = `http://${host}:5000`;
    }
  }

  // Tier 1: Canonical HTTPS / Supabase Storage URL / External HTTPS -> Pass through directly
  if (cleanUrl.startsWith('https://') || cleanUrl.startsWith('http://')) {
    // Legacy Localhost URL -> Rewrite to Production API Base when running on Vercel
    if (cleanUrl.includes('localhost:5000') || cleanUrl.includes('127.0.0.1:5000')) {
      if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        return cleanUrl.replace(/^http:\/\/(localhost|127\.0\.0\.1):5000/, apiBase);
      }
    }
    return cleanUrl;
  }

  // Tier 2: Relative URL (/api/...) -> Prepend API Base
  if (cleanUrl.startsWith('/')) {
    return `${apiBase}${cleanUrl}`;
  }

  return cleanUrl;
}
