/**
 * useSEO — sets <title>, <meta description>, and <link rel="canonical"> for each page.
 * Works without react-helmet by directly mutating document.head.
 * All canonical URLs are always https://dhoond.co (no www, no http, no query params).
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BASE_URL = 'https://dhoond.co';

/**
 * @param {Object} params
 * @param {string} params.title       - Page <title>
 * @param {string} params.description - Meta description (150-160 chars ideal)
 * @param {string} [params.canonical] - Override canonical path (default: current pathname, no query)
 * @param {string} [params.ogImage]   - OG image URL (default: /favicon.png)
 */
export function useSEO({ title, description, canonical, ogImage }) {
  const { pathname } = useLocation();

  useEffect(() => {
    // ── Title ──────────────────────────────────────────────────────────────
    document.title = title;

    // ── Description ────────────────────────────────────────────────────────
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.name = 'description';
      document.head.appendChild(descMeta);
    }
    descMeta.content = description;

    // ── Canonical ──────────────────────────────────────────────────────────
    // Always use clean path — no query strings, no hash, no www
    const canonicalPath = canonical || pathname.split('?')[0].split('#')[0];
    const canonicalUrl = `${BASE_URL}${canonicalPath === '/' ? '' : canonicalPath}` || BASE_URL;
    
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.rel = 'canonical';
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.href = canonicalUrl;

    // ── Open Graph (for Facebook/WhatsApp/Instagram previews) ─────────────
    const ogTags = {
      'og:title': title,
      'og:description': description,
      'og:url': canonicalUrl,
      'og:image': ogImage || `${BASE_URL}/favicon.png`,
      'og:type': 'website',
      'og:site_name': 'Dhoond.co',
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.content = content;
    });

    // ── Twitter Card ───────────────────────────────────────────────────────
    const twitterTags = {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': ogImage || `${BASE_URL}/favicon.png`,
    };

    Object.entries(twitterTags).forEach(([name, content]) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.name = name;
        document.head.appendChild(tag);
      }
      tag.content = content;
    });

    // Cleanup: restore default title when component unmounts
    return () => {
      document.title = 'Dhoond - Home Services at Your Doorstep';
    };
  }, [title, description, canonical, ogImage, pathname]);
}
