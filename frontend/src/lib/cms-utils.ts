export const ALLOWED_ICONS = [
  'ShieldCheck',
  'Globe2',
  'Layers',
  'Gem',
  'Building2',
  'Sparkles',
  'Award',
  'CheckCircle',
  'Truck',
  'Compass',
  'Maximize2',
  'Palette',
] as const;

export function sanitizeUrl(url?: string, fallbackUrl: string = '#'): string {
  if (!url || typeof url !== 'string') return fallbackUrl;

  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();

  // Block dangerous protocol schemes
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return fallbackUrl;
  }

  return trimmed;
}
