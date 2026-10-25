# Shekinah Weleful Designs — Feel-good games website

Light, cheerful, responsive **static website** using the official Shekinah logo and brand palette. It has **no database, no backend, and no manually updated spotlight**. GitHub Actions builds and deploys it to GitHub Pages.

## Maintaining your website

### Add or edit a game — `public/data/games.json`

Each object in the `games` array corresponds to one game card **and an automatically generated SEO game page**. **Its order in the JSON determines its order on the homepage.** Copy an existing entry to add a game; do not reuse another game's `id`.

| Field | What it does |
|---|---|
| `id` | Permanent, unique identifier, lowercase letters/numbers/hyphens |
| `title`, `description`, `genre` | Visible game information |
| `tags` | Up to three short labels (optional) |
| `visible` | `true` shows the game and creates an indexable page; `false` excludes it from generated pages and sitemap |
| `status` | `released` or `open-beta` (only open beta shows a badge) |
| `icon` | Game icon URL or local image path under `public/` |
| `cover` | Wide promotional art URL or local image path under `public/` |
| `theme` | Fallback cover color: `meadow`, `frost`, `gold`, `ember`, or `steel` |
| `stores.playStore` | Full game listing URL on Google Play |
| `stores.steam` | Full game listing URL on Steam |
| `stores.itch` | Full game listing URL on itch.io |

**Platform buttons appear automatically** whenever the platform has a valid nonempty `http://` or `https://` URL. If the URL is `""` or the property is absent, that store isn't shown. You can add one, two, or all three links for each game. No boolean flags are needed.

The initial five visible games are Growing Kingdom, LootFarmer, Everfort, Hunter Clicker, and Hopeless Fort (**Open Beta**). Miner Hero remains in JSON but is hidden.

### Edit studio copy, social links, and storefronts — `public/data/site.json`

Update `siteUrl` (the exact public homepage address, including the trailing `/`), studio copy, `headline`, `headlineHighlight`, `intro`, `about`, and `principles` here.

- `social.discord`, `social.instagram`, `social.tiktok`, `social.youtube`, `social.facebook`: individual community accounts.
- `contactEmail`: contact address.
- `storefronts.playStore`, `storefronts.steam`, `storefronts.itch`: links to the **studio/developer** pages where visitors can find all your games.
- `principles`: the philosophy cards, each with `title`, `description`, and an `icon` (`heart`, `shield`, `smile`).

Social and developer storefront URLs are prefilled for Discord, Instagram, TikTok, YouTube, Google Play, Steam, and itch.io. The Facebook URL remains empty until provided, and the existing contact email is retained. Empty social or storefront URLs are hidden automatically and do **not** generate dummy buttons.

### Images and branding

The site uses your supplied **official** Shekinah graphics (rather than recreating the logo with text):

- Header: `public/images/brand/wordmark-blue.png` (blue symbol, dark wordmark, transparent background).
- Footer: `public/images/brand/wordmark-white.png` (white wordmark for indigo background).
- Hero: `public/images/brand/blue-icon.png`.
- Site icons and social share image: `public/favicon.png`, `public/apple-touch-icon.png`, `public/social-preview.png`.

Brand colors used: `#2E3A98`, `#05F0F5`, `#29A3DD`, `#2A81AC` from the supplied brand guide. The logo typeface remains inside the supplied images; it is not redistributed as a font file.

For reliable game pictures, eventually place game images in `public/images/games/`, e.g.:

`"cover": "images/games/my-game.webp"`

Recommended covers: ~1200 × 675 pixels (16:9). Icons: square (512 × 512 preferred). Four game icons were cropped from your Play Console screenshot and stored locally in `public/images/games/` for reliability; replace those temporary small images with your original higher-resolution icons when convenient. Game covers still point to the existing Google Play CDN URLs; if any cover fails, a branded cover fallback remains visible. **LootFarmer does not yet have promotional artwork**, so it intentionally uses the image-only fallback until you add it. Card artwork is never covered by large game-title text; game titles remain below the cover.

The LootFarmer Google Play URL is derived from its package name and may not work for the general public before production release. Confirm it after publishing. **Hopeless Fort's listing may also need a public opt-in URL while it is in open beta**, depending on testing access.

## Running locally

Requires Node.js 22+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. The development server automatically reloads changes.

```bash
npm run validate    # check JSON and TypeScript
npm run build       # create deployable dist/ including SEO pages and sitemap
npm run validate:seo  # inspect generated SEO files (run after build)
npm run preview     # preview production build
```

## GitHub Pages automatic deployment

1. Create a GitHub repository and put the **contents of this ZIP at its root** (including hidden `.github/`).
2. Make sure the default branch is `main`, or adjust `.github/workflows/deploy.yml`.
3. On GitHub: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Commit and push. The workflow builds and deploys the website.
5. Future JSON edits and added image files redeploy automatically on push.

`vite.config.mjs` uses `base: './'` so GitHub Pages works whether published on a custom domain, `username.github.io`, or `username.github.io/repository/`.

## Maintenance notes

- No featured or spotlight fields, game-of-the-week sections, news feed, or other manually refreshed material.
- Don't fill unused URLs with `#`, the word `false`, or dummy placeholder URLs: use `""`.
- When using a local image path in JSON, omit `public/` and the leading slash.
- All Open Graph and Twitter image links are absolute after `npm run build`, based on `siteUrl`.
- All JSON text displayed to visitors is HTML-escaped; outgoing links are checked for supported schemes.


## SEO and Google Search Console (free)

The published site is **statically pre-rendered at build time** using the same component templates as the development site. Search engines receive all visible game cards, store links, and studio text in the initial HTML without needing to execute JavaScript. Individual pages automatically exist at `games/<id>/` for every `"visible": true` game.

`npm run build` produces:

- `dist/index.html` — pre-rendered homepage with canonical, social preview metadata, and `Organization`, `WebSite`, and `ItemList` JSON-LD.
- `dist/games/<id>/index.html` — separate branded detail page for each visible game, with distinct title, meta description, canonical, social previews, `VideoGame` and breadcrumb structured data.
- `dist/sitemap.xml` — automatically lists the homepage and **visible games only** (no manually entered dates).
- `dist/robots.txt` — permissive crawl policy and sitemap reference.

All these files are deployed by the existing GitHub Actions workflow. **Do not edit `dist/` manually.** Editing JSON and pushing to `main` is sufficient. Hidden games are excluded from page generation and the sitemap. Keep game IDs stable after publishing: changing an ID changes the game's page URL.

### Google Search Console setup

1. Deploy the site successfully and verify the homepage and a game detail page load.
2. Open [Google Search Console](https://search.google.com/search-console).
3. Add a **URL prefix** property (not a domain property) for:

   `https://shekinahwd.github.io/APP-GameStudio/`

4. Verify ownership using a method Google offers you. The **HTML tag method** works by copying the exact verification meta tag Google gives you into the `<head>` of the repository's `index.html` (outside the `SEO_META` placeholder), committing, and deploying. Alternatively, place Google's verification HTML file at `public/<google-provided-filename>.html`, then push and verify. Do not invent a verification code.
5. In Search Console → **Sitemaps**, submit this URL:

   `https://shekinahwd.github.io/APP-GameStudio/sitemap.xml`

6. Use **URL Inspection** to request indexing of the homepage and several game pages if useful; indexing and ranking aren't guaranteed or instantaneous.

**GitHub Pages note:** On GitHub *project pages*, `/APP-GameStudio/robots.txt` is **not** the authoritative robots.txt for `shekinahwd.github.io` because crawler robots rules are read from the **host root** (`https://shekinahwd.github.io/robots.txt`). The project-level file is still generated for compatibility with future custom domains, but **submit the sitemap directly in Search Console**. There is no need for a paid domain, Search Console subscription, or paid SEO tool.

### If you change domains or repository names

Update `siteUrl` in `public/data/site.json` to match the final public URL **with a trailing slash**, then deploy again. Canonical URLs, sitemap URLs, social images, and structured-data links will automatically follow it. Incorrect `siteUrl` values can cause search engines to index the wrong addresses.

### Verification

`npm run validate` checks JSON and TypeScript. `npm run build` also checks that all visible-game pages, canonical URLs, structured data, stylesheets, and sitemap entries are generated as expected (`scripts/check-seo.mjs`). Preview the production output with `npm run preview`.

SEO helps search engines understand and discover the studio and its games. Google does not guarantee rich-result enhancements for `VideoGame` markup, and better ranking still depends on content quality, links, and search demand.
