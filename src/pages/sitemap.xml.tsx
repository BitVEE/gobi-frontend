import type { GetServerSideProps } from 'next';
import routerList from '@/utils/routerList';
import { buildShareUrl } from '@/utils/shareMeta';

// Only public, canonical routes belong in the sitemap. Detail pages that need
// an article/event ID must be added with real IDs rather than bare route URLs.
const publicPaths = routerList.flatMap(item =>
  item.children ? item.children.filter(child => !child.link).map(child => child.path) : [item.path]
);

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const urls = publicPaths.flatMap(path => ['zh', 'en'].map(locale => {
    const alternates = ['zh', 'en', 'x-default'].map(language =>
      `<xhtml:link rel="alternate" hreflang="${language}" href="${buildShareUrl(path, language === 'en' ? 'en' : 'zh')}"/>`
    ).join('');
    return `<url><loc>${buildShareUrl(path, locale)}</loc>${alternates}</url>`;
  })).join('');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.write(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`);
  res.end();
  return { props: {} };
};

export default function Sitemap() { return null; }
