import type { PageMetadata } from './types';

const TIMEOUT_MS = 5000;
const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

function getFaviconFallback(url: string): string {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`;
  } catch {
    return '';
  }
}

function getDomainTitle(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function parseMetaFromHtml(html: string, originalUrl: string): PageMetadata {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const getMeta = (selectors: string[]): string | null => {
    for (const sel of selectors) {
      const el = doc.querySelector(sel);
      const val = el?.getAttribute('content') ?? el?.textContent;
      if (val?.trim()) return val.trim();
    }
    return null;
  };

  const title =
    getMeta(['meta[property="og:title"]', 'meta[name="twitter:title"]']) ??
    doc.title?.trim() ??
    getDomainTitle(originalUrl);

  const description =
    getMeta([
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
      'meta[name="description"]',
    ]) ?? '';

  const image =
    getMeta(['meta[property="og:image"]', 'meta[name="twitter:image"]']) ??
    null;

  const siteName =
    getMeta(['meta[property="og:site_name"]']) ?? null;

  // Find favicon
  let favicon: string | null = null;
  const faviconEl = doc.querySelector(
    'link[rel*="icon"]',
  ) as HTMLLinkElement | null;
  if (faviconEl?.href) {
    try {
      favicon = new URL(faviconEl.href, originalUrl).href;
    } catch {
      favicon = null;
    }
  }
  if (!favicon) {
    favicon = getFaviconFallback(originalUrl);
  }

  return {
    url: originalUrl,
    title,
    description,
    image,
    favicon,
    siteName,
  };
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, mode: 'cors' });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function scrapeMetadata(url: unknown): Promise<PageMetadata> {
  const urlStr = String(url ?? '').trim();
  if (!urlStr) {
    return { url: '', title: '', description: '', image: null, favicon: null, siteName: null };
  }

  // 1. Try direct fetch
  try {
    const res = await fetchWithTimeout(urlStr);
    if (res.ok) {
      const html = await res.text();
      return parseMetaFromHtml(html, urlStr);
    }
  } catch {
    // CORS or network error — try proxies
  }

  // 2. Try CORS proxies
  for (const buildProxy of CORS_PROXIES) {
    try {
      const proxyUrl = buildProxy(urlStr);
      const res = await fetchWithTimeout(proxyUrl);
      if (res.ok) {
        const html = await res.text();
        return parseMetaFromHtml(html, urlStr);
      }
    } catch {
      // Try next proxy
    }
  }

  // 3. Fallback
  return {
    url: urlStr,
    title: getDomainTitle(urlStr),
    description: '',
    image: null,
    favicon: getFaviconFallback(urlStr),
    siteName: null,
  };
}
