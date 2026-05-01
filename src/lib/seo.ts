import { useEffect } from 'react';

export interface SEOConfig {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}

const SITE_URL = 'https://www.happydayslocation.com';
const DEFAULT_IMAGE = `${SITE_URL}/favicon.png`;

function setMetaTag(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function useSEO(config: SEOConfig) {
  useEffect(() => {
    const url = `${SITE_URL}${config.path}`;
    const image = config.image ?? DEFAULT_IMAGE;
    const type = config.type ?? 'website';

    document.title = config.title;
    setMetaTag('name', 'description', config.description);
    setMetaTag('name', 'robots', config.noindex ? 'noindex, nofollow' : 'index, follow');
    setLink('canonical', url);

    setMetaTag('property', 'og:title', config.title);
    setMetaTag('property', 'og:description', config.description);
    setMetaTag('property', 'og:url', url);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:image', image);
    setMetaTag('property', 'og:locale', 'fr_FR');
    setMetaTag('property', 'og:site_name', 'Happy Days Location');

    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', config.title);
    setMetaTag('name', 'twitter:description', config.description);
    setMetaTag('name', 'twitter:image', image);
  }, [config.title, config.description, config.path, config.image, config.type, config.noindex]);
}
