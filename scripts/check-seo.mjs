import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
const site = JSON.parse(await readFile('public/data/site.json', 'utf8'));
const { games } = JSON.parse(await readFile('public/data/games.json', 'utf8'));
const visible = games.filter(g => g.visible);
const root = site.siteUrl;
const pages = [
  { path: 'index.html', url: root, title: site.studioName },
  ...visible.map(g => ({ path: join('games', g.id, 'index.html'), url: `${root}games/${g.id}/`, title: g.title }))
];
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
assert.equal((sitemap.match(/<loc>/g) || []).length, pages.length);
for (const page of pages) {
  const html = await readFile(join('dist', page.path), 'utf8');
  assert.ok(html.includes(`<link rel="canonical" href="${page.url}">`), `Missing canonical: ${page.path}`);
  assert.ok(html.includes(`<meta property="og:url" content="${page.url}">`), `Missing OG URL: ${page.path}`);
  assert.ok(html.includes(`<h1`), `Missing visible H1: ${page.path}`);
  assert.ok(html.includes(page.title), `Missing title: ${page.path}`);
  assert.ok(sitemap.includes(`<loc>${page.url}</loc>`), `Missing sitemap URL: ${page.url}`);
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1, `Expected one JSON-LD script: ${page.path}`);
  const parsed = JSON.parse(scripts[0][1]);
  assert.equal(parsed['@context'], 'https://schema.org');
  if (page.path !== 'index.html') {
    assert.ok(parsed['@graph'].some(item => item['@type'] === 'VideoGame'));
    const cssPath = html.match(/href="(\.\.\/\.\.\/assets\/index-[^"]+\.css)"/);
    assert.ok(cssPath, `CSS link missing: ${page.path}`);
    await access(join('dist', 'assets', cssPath[1].split('/').at(-1)));
  }
}
for (const game of games.filter(g => !g.visible)) {
  assert.ok(!sitemap.includes(`/games/${game.id}/`), `Hidden game leaked in sitemap: ${game.id}`);
}
const index = await readFile('dist/index.html', 'utf8');
assert.ok(index.includes('data-prerendered="true"'), 'Homepage not pre-rendered');
for (const game of visible) {
  assert.ok(index.includes(`href="./games/${game.id}/"`), `Missing link to game page: ${game.id}`);
}
console.log(`✓ SEO verified: ${pages.length} indexable pages, metadata, structured data and sitemap.`);
