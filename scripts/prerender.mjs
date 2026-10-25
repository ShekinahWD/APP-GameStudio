// Pre-render every visible game plus the homepage after Vite creates dist/.
// Node 22's --experimental-strip-types runs the same TS render functions as the browser.
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { setBase, mainTemplate, detailTemplate } from '../src/render.ts';

const output = resolve('dist');
const [site, catalog, builtHtml] = await Promise.all([
  readFile('public/data/site.json', 'utf8').then(JSON.parse),
  readFile('public/data/games.json', 'utf8').then(JSON.parse),
  readFile(join(output, 'index.html'), 'utf8')
]);
const root = site.siteUrl;
const visible = catalog.games.filter((game) => game.visible === true);
const e = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
const encodeJsonLd = (data) => JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
const urlFor = (game) => game ? new URL(`games/${game.id}/`, root).href : root;
const imageUrl = (value) => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return new URL(value, root).href;
};
const description = (value) => String(value || '').replace(/\s+/g, ' ').trim().slice(0, 300);
const orgId = `${root}#organization`;
const organization = {
  '@type': 'Organization', '@id': orgId, name: site.studioName, url: root,
  description: site.intro,
  logo: new URL('images/brand/blue-icon.png', root).href,
  email: site.contactEmail || undefined,
  sameAs: [...Object.values(site.social || {}), ...Object.values(site.storefronts || {})].filter(Boolean)
};
const pageMeta = ({ game }) => {
  const canonical = urlFor(game);
  const title = game ? `${game.title} | ${site.studioName}` : `${site.studioName} | Feel-good indie games`;
  const desc = description(game ? game.description : site.intro);
  const image = game ? imageUrl(game.cover || game.icon) : '';
  const shareImage = image || new URL('social-preview.png', root).href;
  const jsonLd = game ? {
    '@context': 'https://schema.org',
    '@graph': [organization,
      {
        '@type': 'VideoGame', '@id': `${canonical}#game`, name: game.title,
        description: game.description, url: canonical,
        genre: game.tags?.length ? game.tags : [game.genre],
        gamePlatform: [game.stores?.playStore && 'Android', game.stores?.steam && 'PC', game.stores?.itch && 'PC'].filter(Boolean),
        image: image || undefined,
        publisher: { '@id': orgId },
        inLanguage: 'en',
        sameAs: Object.values(game.stores || {}).filter(Boolean)
      },
      {
        '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'All games', item: root },
          { '@type': 'ListItem', position: 2, name: game.title, item: canonical }
        ]
      }
    ]
  } : {
    '@context': 'https://schema.org',
    '@graph': [organization,
      { '@type': 'WebSite', '@id': `${root}#website`, name: site.studioName, url: root, publisher: { '@id': orgId }, inLanguage: 'en' },
      { '@type': 'ItemList', name: 'Games by Shekinah Weleful Designs', itemListElement: visible.map((g, i) => (
        { '@type': 'ListItem', position: i + 1, name: g.title, url: urlFor(g) }
      )) }
    ]
  };
  return [
    `<title>${e(title)}</title>`,
    `<meta name="description" content="${e(desc)}">`,
    `<link rel="canonical" href="${e(canonical)}">`,
    `<meta property="og:type" content="${game ? 'article' : 'website'}">`,
    `<meta property="og:site_name" content="${e(site.studioName)}">`,
    `<meta property="og:title" content="${e(title)}">`,
    `<meta property="og:description" content="${e(desc)}">`,
    `<meta property="og:url" content="${e(canonical)}">`,
    `<meta property="og:image" content="${e(shareImage)}">`,
    `<meta property="og:image:alt" content="${e(game ? game.title : site.studioName)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${e(title)}">`,
    `<meta name="twitter:description" content="${e(desc)}">`,
    `<meta name="twitter:image" content="${e(shareImage)}">`,
    `<script type="application/ld+json">${encodeJsonLd(jsonLd)}</script>`
  ].join('\n    ');
};
const renderSeo = (html, game) => {
  if (!html.includes('<!-- SEO_META:')) throw new Error('Expected SEO placeholder in built index.html');
  const result = html.replace(/<!-- SEO_META:[\s\S]*?-->/, pageMeta({ game }));
  // Keep the production title in one place (SEO metadata, no duplicate title).
  return result.replace(/\s*<title>Shekinah Weleful Designs \| Feel-good indie games<\/title>/, '');
};
setBase('./');
const visibleHtml = mainTemplate(site, visible);
let home = renderSeo(builtHtml, null);
const loading = '<div id="app"><div class="loading-screen" role="status" aria-live="polite">Loading games…</div></div>';
if (!home.includes(loading)) throw new Error('Expected app loading placeholder in dist/index.html');
home = home.replace(loading, `<div id="app" data-prerendered="true">${visibleHtml}</div>`);
await writeFile(join(output, 'index.html'), home);

const assets = await readdir(join(output, 'assets'));
const cssFile = assets.find((file) => /^index-[^/]+\.css$/.test(file));
if (!cssFile) throw new Error('Expected Vite to output assets/index-*.css');
for (const game of visible) {
  setBase('../../'); // /games/<id>/ -> repository root, including GitHub Pages subpaths.
  const html = `<!doctype html>\n<html lang="en">\n<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#ffffff">
    <meta name="color-scheme" content="light">
    ${pageMeta({ game })}
    <link rel="icon" href="../../favicon.png" type="image/png">
    <link rel="apple-touch-icon" href="../../apple-touch-icon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../assets/${e(cssFile)}">
</head>\n<body>
    <a class="skip-link" href="#game-content">Skip to game</a>
    <div id="game-content">${detailTemplate(site, game)}</div>
</body>\n</html>\n`;
  const gameDir = join(output, 'games', game.id);
  await mkdir(gameDir, { recursive: true });
  await writeFile(join(gameDir, 'index.html'), html);
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
  root, ...visible.map(urlFor)
].map((url) => `  <url><loc>${e(url)}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile(join(output, 'sitemap.xml'), sitemap);
// On a GitHub project page this is not the host-root robots.txt; Google Search
// Console should receive the sitemap URL directly. Still useful on custom domains.
await writeFile(join(output, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap.xml', root).href}\n`);
console.log(`✓ Prerendered homepage + ${visible.length} visible game pages, sitemap and robots.txt.`);
