import './styles.css';
import { mainTemplate, setBase } from './render';
import type { Game, SiteConfig } from './render';

const BASE = import.meta.env.BASE_URL;
setBase(BASE);
const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Missing #app element');

type GamesFile = { games: Game[] };
const icon = (name: string): string => name === 'close'
  ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 5 19 19M19 5 5 19"/></svg>'
  : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';

function bindImageFallbacks(): void {
  document.querySelectorAll<HTMLImageElement>('.game-icon img, .game-cover').forEach((img) => {
    const hideBrokenImage = () => { img.hidden = true; };
    img.addEventListener('error', hideBrokenImage, { once: true });
    if (img.complete && img.naturalWidth === 0) hideBrokenImage();
  });
}

function bindMobileMenu(): void {
  const toggle = document.querySelector<HTMLButtonElement>('.mobile-menu-toggle');
  const menu = document.querySelector<HTMLElement>('#mobile-navigation');
  if (!toggle || !menu) return;
  const setOpen = (open: boolean): void => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    toggle.innerHTML = icon(open ? 'close' : 'menu');
    menu.hidden = !open;
  };
  toggle.addEventListener('click', (event) => { event.stopPropagation(); setOpen(menu.hidden); });
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setOpen(false); });
  document.addEventListener('click', (event) => {
    if (!menu.hidden && event.target instanceof Node && !menu.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', () => setOpen(false));
}

async function loadJson<T>(file: string): Promise<T> {
  const response = await fetch(`${BASE}data/${file}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Failed to load ${file}: HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

async function initialize(): Promise<void> {
  if (!app) return;
  if (app.dataset.prerendered === 'true') {
    bindImageFallbacks();
    bindMobileMenu();
    return;
  }
  try {
    const [site, data] = await Promise.all([loadJson<SiteConfig>('site.json'), loadJson<GamesFile>('games.json')]);
    if (!site?.studioName || !Array.isArray(data?.games)) throw new Error('Invalid configuration files.');
    const games = data.games.filter((game) => game.visible === true && game.id && game.title);
    document.title = `${site.studioName} | Feel-good indie games`;
    app.innerHTML = mainTemplate(site, games);
    bindImageFallbacks();
    bindMobileMenu();
  } catch (error) {
    console.error('Could not load website configuration:', error);
    app.innerHTML = '<main class="load-error" role="alert"><h1>Our games are taking a little break.</h1><p>Please refresh. If the problem continues, check the game and studio JSON files.</p><button type="button" id="reload-page">Try again</button></main>';
    document.querySelector('#reload-page')?.addEventListener('click', () => location.reload());
  }
}

void initialize();
