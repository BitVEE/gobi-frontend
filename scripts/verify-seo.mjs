import assert from 'node:assert/strict';

const base = process.env.SEO_BASE_URL || 'http://localhost:3000';
const origin = 'https://youthultragobi.exploring.cn';
async function read(path) {
  const response = await fetch(`${base}${path}`);
  assert.equal(response.status, 200, `${path} must return 200`);
  return response.text();
}
function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g'))].map(([tag]) =>
    Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key.toLowerCase(), value]))
  );
}

for (const [path, language, title] of [
  ['/', 'zh-CN', 'Youth Ultra Gobi 青戈赛官网 | 玄奘之路青少年戈壁挑战赛'],
  ['/en', 'en', 'Youth Ultra Gobi | Official Website'],
]) {
  const html = await read(path);
  assert.equal(tags(html, 'html')[0].lang, language);
  assert.equal(html.match(/<title[^>]*>(.*?)<\/title>/s)?.[1], title);
  const body = html.split('<div id="__next">')[1]?.split('<script')[0] || '';
  assert.match(body, /<main\b/, 'Public content must exist without JavaScript');
  assert.match(body, /<h1\b/);
  assert.ok(body.includes('Youth Ultra Gobi'), 'Brand must be present in server-rendered content');
  assert.equal(tags(html, 'meta').find(meta => meta.property === 'og:site_name')?.content, 'Youth Ultra Gobi');
  const links = tags(html, 'link');
  assert.equal(links.find(link => link.rel === 'canonical').href, `${origin}${path}`);
  for (const language of ['zh', 'en', 'x-default']) {
    assert.equal(links.find(link => link.hreflang === language)?.href, `${origin}${language === 'en' ? '/en' : '/'}`);
  }
  assert.ok(!tags(html, 'meta').find(meta => meta.name === 'robots')?.content.includes('noindex'));
  const schema = JSON.parse(html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/s)[1]);
  assert.equal(schema.name, 'Youth Ultra Gobi');
  assert.equal(schema.url, `${origin}/`);
}

for (const path of ['/login', '/user', '/race/info', '/race/pay', '/resources/success', '/resources/download']) {
  const html = await read(path);
  assert.ok(tags(html, 'meta').find(meta => meta.name === 'robots')?.content.includes('noindex'), `${path} must not be indexed`);
}

const sitemap = await read('/sitemap.xml');
const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, location]) => location);
assert.equal(new Set(locations).size, locations.length);
assert.ok(locations.includes(`${origin}/`) && locations.includes(`${origin}/en`));
assert.ok(!locations.some(location => /login|\/user|\/race\/(info|pay)|resources\/(success|download)/.test(location)));
assert.match(sitemap, /xmlns:xhtml="http:\/\/www.w3.org\/1999\/xhtml"/);
for (const location of locations) {
  const html = await read(new URL(location).pathname);
  assert.equal(tags(html, 'link').find(link => link.rel === 'canonical')?.href, location);
  assert.ok(!tags(html, 'meta').find(meta => meta.name === 'robots')?.content.includes('noindex'));
}
assert.ok((await read('/robots.txt')).includes(`Sitemap: ${origin}/sitemap.xml`));
assert.equal((await read('/google0697c507daceed82.html')).trim(), 'google-site-verification: google0697c507daceed82.html');
console.log(`SEO checks passed: server-rendered homepages, metadata, private pages, ${locations.length} sitemap URLs, robots and Google verification.`);
