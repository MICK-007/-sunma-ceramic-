/**
 * Universal Media URL Resolver (Multi-Tier Safety Net)
 * 
 * Contract:
 * Tier 1: Canonical Production Storage URL (e.g. Supabase Storage / Render API HTTPS) -> Used directly
 * Tier 2: Relative URL (/api/...) -> Prepends active Production/Local API Base
 * Tier 3: Legacy Localhost URL -> Dynamically rewritten to Production API Base when running on Vercel
 * Tier 4: Invalid / Empty -> Safe fallback
 */
export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  const cleanUrl = url.trim();
  if (!cleanUrl) return '';

  // Data URIs pass through directly for non-persisted preview
  if (cleanUrl.startsWith('data:')) return cleanUrl;

  const prodApiBase = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '')
    : 'https://sunma-ceramic.onrender.com';

  let localApiBase = 'http://localhost:5000';
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host.startsWith('192.168.') || host.startsWith('127.0.')) {
      localApiBase = `http://${host}:5000`;
    }
  }

  // Tier 1: Canonical Production Storage / HTTPS URL -> Use directly
  if (cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }

  // Tier 2: Relative URL (/api/...) -> Prepend API Base
  if (cleanUrl.startsWith('/')) {
    const activeBase = (typeof window !== 'undefined' && window.location.hostname !== 'localhost')
      ? prodApiBase
      : localApiBase;
    return `${activeBase}${cleanUrl}`;
  }

  // Tier 3: Legacy Localhost URL -> Rewrite to Production API Base when running on Vercel
  if (cleanUrl.includes('localhost:5000') || cleanUrl.includes('127.0.0.1:5000')) {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return cleanUrl.replace(/^http:\/\/(localhost|127\.0\.0\.1):5000/, prodApiBase);
    }
    return cleanUrl;
  }

  // Tier 4: External HTTP URL or fallback
  return cleanUrl;
}
