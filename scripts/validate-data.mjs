import { readFileSync } from 'node:fs';

const loadJson = (file) => JSON.parse(readFileSync(new URL(`../public/data/${file}`, import.meta.url), 'utf8'));
const errors = [];
const fail = (message) => errors.push(message);
const validWebLink = (value, field) => {
  if (value === '' || value === undefined) return;
  if (typeof value !== 'string') return fail(`${field} must be a URL string or empty string.`);
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) fail(`${field} must use http/https.`);
  } catch {
    fail(`${field} must be a full valid URL, or empty string.`);
  }
};

try {
  const site = loadJson('site.json');
  const { games } = loadJson('games.json');
  if (!site.studioName || !site.shortName || !site.headline) fail('site.json needs a studioName, shortName, and headline.');
  try {
    const siteUrl = new URL(site.siteUrl);
    if (siteUrl.protocol !== 'https:' || siteUrl.search || siteUrl.hash || !site.siteUrl.endsWith('/')) {
      fail('site.json siteUrl must be an absolute HTTPS URL ending in / without query or hash.');
    }
  } catch { fail('site.json requires a valid siteUrl such as https://username.github.io/repository/.'); }
  if (!Array.isArray(games)) fail('games.json needs a games array.');
  if (Array.isArray(games)) {
    const ids = new Set();
    for (const [index, game] of games.entries()) {
      const path = `games[${index}]`;
      if (!game?.id || !/^[a-z0-9-]+$/.test(game.id)) fail(`${path}.id must contain only lowercase letters, numbers and hyphens.`);
      if (ids.has(game.id)) fail(`Duplicate game id: ${game.id}`);
      ids.add(game.id);
      if (!game.title || !game.description || !game.genre) fail(`${path} is missing title, description or genre.`);
      if (typeof game.visible !== 'boolean') fail(`${path}.visible must be true or false.`);
      if (!['released', 'open-beta'].includes(game.status)) fail(`${path}.status must be released or open-beta.`);
      for (const platform of ['playStore', 'steam', 'itch']) validWebLink(game.stores?.[platform], `${path}.stores.${platform}`);
    }
  }
  if (site.principles !== undefined) {
    if (!Array.isArray(site.principles)) fail('site.principles must be an array.');
    else for (const [index, principle] of site.principles.entries()) {
      if (!principle?.title || !principle?.description || !['heart', 'shield', 'smile'].includes(principle.icon)) fail(`site.principles[${index}] needs title, description and an icon (heart, shield or smile).`);
    }
  }
  for (const [key, value] of Object.entries(site.social || {})) validWebLink(value, `site.social.${key}`);
  for (const [key, value] of Object.entries(site.storefronts || {})) validWebLink(value, `site.storefronts.${key}`);
  if (site.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.contactEmail)) fail('Invalid contactEmail.');
} catch (error) {
  fail(error.message);
}

if (errors.length) {
  for (const message of errors) console.error(`✖ ${message}`);
  process.exitCode = 1;
} else {
  console.log('✓ Game and studio data validated.');
}
