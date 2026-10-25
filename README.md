# Shekinah Weleful Designs — Feel-good games website

Light, cheerful, responsive **static website** using the official Shekinah logo and brand palette. It has **no database, no backend, and no manually updated spotlight**. GitHub Actions builds and deploys it to GitHub Pages.

## Maintaining your website

### Add or edit a game — `public/data/games.json`

Each object in the `games` array corresponds to one game card. **Its order in the JSON determines its order on the website.** Copy an existing entry to add a game; do not reuse another game's `id`.

| Field | What it does |
|---|---|
| `id` | Permanent, unique identifier, lowercase letters/numbers/hyphens |
| `title`, `description`, `genre` | Visible game information |
| `tags` | Up to three short labels (optional) |
| `visible` | `true` shows the game; `false` hides it |
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

Update the studio copy, `headline`, `headlineHighlight`, `intro`, `about`, and `principles` here.

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
npm run build       # create deployable dist/
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
- Social preview meta image is relative; on some social platforms a custom domain and absolute `og:image` URL improve preview support.
- All JSON text displayed to visitors is HTML-escaped; outgoing links are checked for supported schemes.
