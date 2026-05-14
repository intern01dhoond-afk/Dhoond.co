import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BASE_URL = 'https://www.dhoond.co';

/**
 * Custom hook to manage SEO meta tags and canonical links
 * @param {Object} params
 * @param {string} params.title - Page title
 * @param {string} params.description - Meta description
 * @param {string} params.canonicalPath - Path for the canonical URL (e.g. '/painting')
 */
export const useSEO = ({ title, description, canonicalPath }) => {
  const location = useLocation();
  
  useEffect(() => {
    // 1. Update Title
    if (title) {
      document.title = title;
    }

    // 2. Manage Canonical Link
    const path = canonicalPath || location.pathname;
    const cleanPath = path === '/' ? '' : path;
    const canonicalUrl = `${BASE_URL}${cleanPath}`;

    let link = document.querySelector("link[rel='canonical']");
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);

    // 3. Manage Meta Description
    if (description) {
      let metaDesc = document.querySelector("meta[name='description']");
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }

    // 4. Update OG Tags
    const updateOG = (property, content) => {
      let tag = document.querySelector(`meta[property='${property}']`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateOG('og:title', title || 'Dhoond.co');
    updateOG('og:url', canonicalUrl);
    if (description) updateOG('og:description', description);

  }, [title, description, canonicalPath, location.pathname]);
};
