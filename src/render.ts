type StoreId = 'playStore' | 'steam' | 'itch';
type SocialId = 'discord' | 'instagram' | 'tiktok' | 'youtube' | 'facebook';
type GameStatus = 'released' | 'open-beta';
type Theme = 'meadow' | 'frost' | 'gold' | 'ember' | 'steel';
type PrincipleIcon = 'heart' | 'shield' | 'smile';

interface StoreLinks {
  playStore?: string;
  steam?: string;
  itch?: string;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  genre: string;
  tags?: string[];
  visible: boolean;
  status: GameStatus;
  theme?: Theme;
  icon?: string;
  cover?: string;
  stores: StoreLinks;
}

interface Principle {
  title: string;
  description: string;
  icon: PrincipleIcon;
}

export interface SiteConfig {
  studioName: string;
  shortName: string;
  heroEyebrow: string;
  headline: string;
  headlineHighlight?: string;
  intro: string;
  about: string;
  principles: Principle[];
  contactEmail?: string;
  social: Partial<Record<SocialId, string>>;
  storefronts: StoreLinks;
}


let BASE = './';
// Home and detail pages share exactly the same JSON-powered components.
export function setBase(base: string): void { BASE = base; }

// All site copy and URLs are maintained in JSON. Escape them before inserting HTML.
const escapeHtml = (value: string): string => String(value).replace(/[&<>"']/g, (char) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char
));

const safeExternalUrl = (value?: string): string => {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
  } catch { return ''; }
};

// Relative paths in games.json point at files under public/, including on /repo/ Pages sites.
const imageUrl = (value?: string): string => {
  if (typeof value !== 'string' || !value.trim()) return '';
  const path = value.trim();
  if (/^https?:\/\//i.test(path)) return safeExternalUrl(path);
  if (path.startsWith('/') || path.startsWith('//') || path.startsWith('#') || path.includes('..') || path.includes('\\') || /^[a-z]+:/i.test(path)) return '';
  return `${BASE}${path.replace(/^\.\//, '')}`;
};

const safeEmail = (value?: string): string =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? value.trim() : '';

const externalAttrs = 'target="_blank" rel="noopener noreferrer"';

const icon = (name: string): string => {
  const shared = 'width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  const paths: Record<string, string> = {
    arrow: '<path d="M4.5 12h15m-6-6 6 6-6 6"/>',
    diagonal: '<path d="M7 17 17 7M8 7h9v9"/>',
    controller: '<path d="M6 9h12c2 0 3.2 1.2 3.7 3.2l.7 3.3c.8 3.8-2.4 5.7-4.9 3.2l-2.1-2.1H8.6l-2.1 2.1C4 21.2.8 19.3 1.6 15.5l.7-3.3C2.8 10.2 4 9 6 9Z"/><path d="M7.5 11.4v4.7M5.1 13.8h4.8M16.2 12.4h.01M18.5 14.7h.01"/>',
    mail: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>',
    play: '<path d="m8 4 12 8-12 8V4Z" fill="currentColor" stroke="none"/>',
    steam: '<circle cx="16.5" cy="7.5" r="3.3"/><circle cx="7.8" cy="16.7" r="2.1"/><path d="m10 15.8 4.2-5.6M3 14l4.1 1.4"/>',
    itch: '<path d="M4 9.5c0-1 1.1-3 2.3-3h11.4C19 6.5 20 8.5 20 9.5v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M4 11c1 3 3 3 4 0 1 3 3 3 4 0 1 3 3 3 4 0 1 3 3 3 4 0"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    tiktok: '<path d="M14 3v11a4 4 0 1 1-4-4M14 4c.8 2.4 2.5 4 5 4.3"/>',
    youtube: '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none"/>',
    facebook: '<path d="M14.5 21v-8H18l.5-4h-4V7c0-1.1.4-1.7 1.8-1.7H19V2.2a23 23 0 0 0-3.2-.2C12.3 2 10.5 4 10.5 7.4V9H8v4h2.5v8"/>',
    discord: '<path d="M7 6.5c3.2-1.6 6.8-1.6 10 0l2 2.8c1.1 2.3 1.4 4.7 1 7.1-1.5 1.1-3 1.8-4.2 2.1l-.9-1.4M7 6.5l-2 2.8c-1.1 2.3-1.4 4.7-1 7.1 1.5 1.1 3 1.8 4.2 2.1l.9-1.4M9 14h.01M15 14h.01"/>',
    heart: '<path d="M20.6 8.4c0 4.9-8.6 10.5-8.6 10.5S3.4 13.3 3.4 8.4A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 8.6 1.1Z"/>',
    shield: '<path d="m12 2 8 3.5v5.7c0 5-3.4 8.2-8 10.8-4.6-2.6-8-5.8-8-10.8V5.5L12 2Z"/><path d="m8.7 11.8 2.4 2.4 4.5-4.7"/>',
    smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14c1.8 2.6 6.2 2.6 8 0M8.5 9.5h.01M15.5 9.5h.01"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M5 5 19 19M19 5 5 19"/>'
  };
  return `<svg ${shared}>${paths[name] || paths.arrow}</svg>`;
};

const platformMetadata: Record<StoreId, { name: string; iconName: string }> = {
  playStore: { name: 'Google Play', iconName: 'play' },
  steam: { name: 'Steam', iconName: 'steam' },
  itch: { name: 'itch.io', iconName: 'itch' }
};
const socialMetadata: Record<SocialId, { name: string; iconName: string }> = {
  discord: { name: 'Discord', iconName: 'discord' },
  instagram: { name: 'Instagram', iconName: 'instagram' },
  tiktok: { name: 'TikTok', iconName: 'tiktok' },
  youtube: { name: 'YouTube', iconName: 'youtube' },
  facebook: { name: 'Facebook', iconName: 'facebook' }
};

function storeButtons(stores: StoreLinks, gameTitle: string): string {
  const links = (Object.keys(platformMetadata) as StoreId[]).flatMap((platform) => {
    const url = safeExternalUrl(stores?.[platform]);
    if (!url) return [];
    const { name, iconName } = platformMetadata[platform];
    return [`<a class="store-button store-button--${platform}" href="${escapeHtml(url)}" ${externalAttrs} aria-label="${escapeHtml(gameTitle)} on ${name}">
      ${icon(iconName)}<span>${name}</span>${icon('diagonal')}
    </a>`];
  });
  return links.length ? links.join('') : '<span class="store-coming">Store link coming soon</span>';
}

function gameIcon(game: Game): string {
  const src = imageUrl(game.icon);
  const initials = game.id === 'lootfarmer' ? 'LF' : game.title.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
  return `<div class="game-icon game-icon--${escapeHtml(game.theme || 'frost')}">
    <span class="game-icon-fallback" aria-hidden="true">${escapeHtml(initials)}</span>
    ${src ? `<img src="${escapeHtml(src)}" alt="" loading="lazy">` : ''}
  </div>`;
}

function cardTemplate(game: Game, index: number): string {
  const cover = imageUrl(game.cover);
  const fallbackArtIcon = imageUrl(game.icon) || `${BASE}images/brand/blue-icon.png`;
  const theme: Theme = ['meadow', 'frost', 'gold', 'ember', 'steel'].includes(game.theme || '') ? game.theme! : 'frost';
  const beta = game.status === 'open-beta';
  const tags = (game.tags || []).slice(0, 3).map((tag) => `<span class="game-tag">${escapeHtml(tag)}</span>`).join('');
  return `<article class="game-card theme--${theme}" id="game-${escapeHtml(game.id)}" style="--card-index:${index}">
    <a class="game-art game-art-link" href="${BASE}games/${escapeHtml(game.id)}/" aria-label="Learn more about ${escapeHtml(game.title)}">
      <div class="art-decor art-decor--one" aria-hidden="true"></div>
      <div class="art-decor art-decor--two" aria-hidden="true"></div>
      <div class="art-fallback" aria-hidden="true"><img src="${escapeHtml(fallbackArtIcon)}" alt="" loading="lazy"></div>
      ${cover ? `<img class="game-cover" src="${escapeHtml(cover)}" alt="${escapeHtml(game.title)} preview" loading="lazy">` : ''}
      ${beta ? '<span class="badge badge--beta">Open beta</span>' : ''}
    </a>
    <div class="game-body">
      <div class="game-title-row">
        ${gameIcon(game)}
        <div class="game-title-copy">
          <p class="game-genre">${escapeHtml(game.genre)}</p>
          <h3><a href="${BASE}games/${escapeHtml(game.id)}/">${escapeHtml(game.title)}</a></h3>
        </div>
      </div>
      <p class="game-description">${escapeHtml(game.description)}</p>
      ${tags ? `<div class="game-tags">${tags}</div>` : ''}
      <div class="game-store-buttons">${storeButtons(game.stores || {}, game.title)}</div>
      <a class="game-details-link" href="${BASE}games/${escapeHtml(game.id)}/">Game details ${icon('arrow')}</a>
    </div>
  </article>`;
}

function highlightedHeadline(headline: string, phrase?: string): string {
  if (!phrase) return escapeHtml(headline);
  const index = headline.toLowerCase().lastIndexOf(phrase.toLowerCase());
  if (index < 0) return escapeHtml(headline);
  return `${escapeHtml(headline.slice(0, index))}<span class="hero-highlight">${escapeHtml(headline.slice(index, index + phrase.length))}</span>${escapeHtml(headline.slice(index + phrase.length))}`;
}

function principleTemplate(principle: Principle): string {
  const permittedIcon: PrincipleIcon = ['heart', 'shield', 'smile'].includes(principle.icon) ? principle.icon : 'heart';
  return `<article class="value-card">
    <span class="value-icon value-icon--${permittedIcon}">${icon(permittedIcon)}</span>
    <h3>${escapeHtml(principle.title)}</h3>
    <p>${escapeHtml(principle.description)}</p>
  </article>`;
}

export function mainTemplate(site: SiteConfig, games: Game[]): string {
  const socials = (Object.keys(socialMetadata) as SocialId[]).flatMap((id) => {
    const url = safeExternalUrl(site.social?.[id]);
    if (!url) return [];
    const meta = socialMetadata[id];
    return [`<a class="social-link" href="${escapeHtml(url)}" ${externalAttrs} aria-label="Visit our ${meta.name}">
      <span class="social-icon">${icon(meta.iconName)}</span><span>${meta.name}</span>${icon('diagonal')}</a>`];
  });
  const storefronts = (Object.keys(platformMetadata) as StoreId[]).flatMap((id) => {
    const url = safeExternalUrl(site.storefronts?.[id]);
    if (!url) return [];
    const meta = platformMetadata[id];
    return [`<a class="profile-link" href="${escapeHtml(url)}" ${externalAttrs}>${icon(meta.iconName)}<span>${meta.name}</span>${icon('diagonal')}</a>`];
  });
  const email = safeEmail(site.contactEmail);
  const discord = safeExternalUrl(site.social?.discord);
  const playStore = safeExternalUrl(site.storefronts?.playStore);
  const studioName = escapeHtml(site.studioName);
  const contactButton = email ? `<a class="contact-link" href="mailto:${escapeHtml(email)}">${icon('mail')}<span>${escapeHtml(email)}</span>${icon('diagonal')}</a>` : '';
  const communityCta = discord
    ? `<a class="button button--primary" href="${escapeHtml(discord)}" ${externalAttrs}>Join our Discord ${icon('diagonal')}</a>`
    : '<a class="button button--primary" href="#community">Stay connected ' + icon('arrow') + '</a>';
  return `<div class="site-shell" id="top">
    <header class="site-header">
      <div class="header-inner">
        <a class="brand" href="#top" aria-label="${studioName} — home"><img src="${BASE}images/brand/wordmark-blue.png" alt="${studioName}"></a>
        <nav class="header-nav" aria-label="Main navigation">
          <a href="#games">Games</a><a href="#about">Our promise</a><a href="#community">Community</a>
        </nav>
        ${playStore ? `<a class="header-cta" href="${escapeHtml(playStore)}" ${externalAttrs}>All our games ${icon('diagonal')}</a>` : ''}
        <button class="mobile-menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-navigation" aria-label="Open navigation">${icon('menu')}</button>
      </div>
      <nav class="mobile-navigation" id="mobile-navigation" aria-label="Mobile navigation" hidden>
        <a href="#games">Games</a><a href="#about">Our promise</a><a href="#community">Community</a>
        ${playStore ? `<a href="${escapeHtml(playStore)}" ${externalAttrs}>All our games ${icon('diagonal')}</a>` : ''}
      </nav>
    </header>

    <main>
      <section class="hero" aria-labelledby="hero-heading">
        <div class="hero-inner page-container">
          <div class="hero-copy">
            <div class="eyebrow"><span class="eyebrow-dot"></span>${escapeHtml(site.heroEyebrow)}</div>
            <h1 id="hero-heading">${highlightedHeadline(site.headline, site.headlineHighlight)}</h1>
            <p class="hero-description">${escapeHtml(site.intro)}</p>
            <div class="hero-actions"><a class="button button--primary" href="#games">Explore our games ${icon('arrow')}</a><a class="button button--outline" href="#about">Our philosophy ${icon('chevron')}</a></div>
          </div>
          <div class="hero-art" aria-hidden="true">
            <div class="hero-art-halo"></div>
            <div class="hero-art-dotted hero-art-dotted--top"></div>
            <div class="hero-art-dotted hero-art-dotted--bottom"></div>
            <div class="hero-art-orbit hero-art-orbit--outer"></div>
            <div class="hero-art-orbit hero-art-orbit--inner"></div>
            <div class="hero-art-logo"><img src="${BASE}images/brand/blue-icon.png" alt=""></div>
            <span class="float-pill float-pill--first">${icon('heart')} Fun comes first</span>
            <span class="float-pill float-pill--second">${icon('shield')} No pay-to-win</span>
            <span class="float-spark float-spark--one">✦</span>
            <span class="float-spark float-spark--two">✦</span>
          </div>
        </div>
      </section>

      <section class="games-section" id="games" aria-labelledby="games-heading">
        <div class="page-container">
          <div class="section-heading">
            <div><div class="eyebrow">THE GAME COLLECTION</div><h2 id="games-heading">Find something <span>fun to play.</span></h2><p>Different worlds, different adventures. Find your next favorite.</p></div>
            <div class="game-count">${games.length} ${games.length === 1 ? 'game' : 'games'} to discover ${icon('controller')}</div>
          </div>
          ${games.length ? `<div class="game-grid">${games.map(cardTemplate).join('')}</div>` : '<p class="no-games">New adventures are coming soon.</p>'}
        </div>
      </section>

      <section class="values-section" id="about" aria-labelledby="values-heading">
        <div class="page-container">
          <div class="values-intro"><div class="eyebrow">OUR PHILOSOPHY</div><h2 id="values-heading">Feel-good games.<br><span>Player-first thinking.</span></h2><p>${escapeHtml(site.about)}</p></div>
          <div class="values-grid">${(site.principles || []).map(principleTemplate).join('')}</div>
        </div>
      </section>

      <section class="community-section" id="community" aria-labelledby="community-heading">
        <div class="page-container community-layout">
          <div class="community-intro">
            <div class="eyebrow">KEEP IN TOUCH</div>
            <h2 id="community-heading">Let's stay <span>connected.</span></h2>
            <p>Follow the studio, join the conversation, or send us your thoughts. We love hearing from players.</p>
            ${communityCta}
          </div>
          <div class="community-panel">
            ${socials.length ? `<div class="links-group"><h3>FOLLOW & CONNECT</h3><div class="social-grid">${socials.join('')}</div></div>` : ''}
            ${storefronts.length ? `<div class="links-group"><h3>FIND ALL OUR GAMES</h3><div class="profile-grid">${storefronts.join('')}</div></div>` : ''}
            ${contactButton ? `<div class="links-group"><h3>EMAIL US</h3>${contactButton}</div>` : ''}
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="page-container footer-inner">
        <a class="footer-brand" href="#top" aria-label="${studioName} — back to top"><img src="${BASE}images/brand/wordmark-white.png" alt="${studioName}"></a>
        <div class="footer-note"><span>Made for players, with heart.</span><small>© ${new Date().getFullYear()} ${studioName}. All rights reserved.</small></div>
        <a class="back-to-top" href="#top">Back to top ↑</a>
      </div>
    </footer>
  </div>`;
}


// This detail page is statically generated. It remains readable without JavaScript.
export function detailTemplate(site: SiteConfig, game: Game): string {
  const logo = `${BASE}images/brand/wordmark-blue.png`;
  const whiteLogo = `${BASE}images/brand/wordmark-white.png`;
  const image = imageUrl(game.cover);
  const fallback = imageUrl(game.icon) || `${BASE}images/brand/blue-icon.png`;
  const theme: Theme = ['meadow', 'frost', 'gold', 'ember', 'steel'].includes(game.theme || '') ? game.theme! : 'frost';
  const badge = game.status === 'open-beta' ? '<span class="badge badge--beta">Open beta</span>' : '';
  return `<div class="site-shell detail-shell" id="top">
    <header class="site-header"><div class="header-inner">
      <a class="brand" href="${BASE}" aria-label="${escapeHtml(site.studioName)} — home"><img src="${logo}" alt="${escapeHtml(site.studioName)}"></a>
      <nav class="header-nav detail-header-nav" aria-label="Main navigation"><a href="${BASE}#games">Games</a><a href="${BASE}#about">Our promise</a><a href="${BASE}#community">Community</a></nav>
      <a class="header-cta" href="${BASE}#games">All games ${icon('arrow')}</a>
    </div></header>
    <main class="detail-main"><div class="page-container">
      <a class="detail-back" href="${BASE}#games">← Back to all games</a>
      <div class="detail-layout">
        <div class="detail-visual game-card theme--${theme}">
          <div class="game-art detail-game-art">
            <div class="art-decor art-decor--one" aria-hidden="true"></div><div class="art-decor art-decor--two" aria-hidden="true"></div>
            <div class="art-fallback" aria-hidden="true"><img src="${escapeHtml(fallback)}" alt=""></div>
            ${image ? `<img class="game-cover" src="${escapeHtml(image)}" alt="Gameplay preview for ${escapeHtml(game.title)}">` : ''}
            ${badge}
          </div>
        </div>
        <div class="detail-copy">
          <p class="eyebrow">${escapeHtml(game.genre)}</p>
          <h1>${escapeHtml(game.title)}</h1>
          <p class="detail-description">${escapeHtml(game.description)}</p>
          ${(game.tags || []).length ? `<div class="game-tags">${(game.tags || []).map(tag => `<span class="game-tag">${escapeHtml(tag)}</span>`).join('')}</div>` : ''}
          <h2>Play ${escapeHtml(game.title)}</h2>
          <div class="detail-stores game-store-buttons">${storeButtons(game.stores || {}, game.title)}</div>
          <p class="detail-note">Store buttons appear for the platforms where the game has a listing.</p>
        </div>
      </div>
    </div></main>
    <footer class="site-footer"><div class="page-container footer-inner">
      <a class="footer-brand" href="${BASE}"><img src="${whiteLogo}" alt="${escapeHtml(site.studioName)}"></a>
      <div class="footer-note"><span>Made for players, with heart.</span><small>© ${new Date().getFullYear()} ${escapeHtml(site.studioName)}. All rights reserved.</small></div>
      <a class="back-to-top" href="${BASE}#games">Explore more games ↑</a>
    </div></footer>
  </div>`;
}
