# fr4gz.co.uk

A gaming fan site about frags: what the word means, where it came from, an FPS slang glossary, the history of fragging from Doom to modern esports, and a collection of embedded YouTube frag movies and famous plays.

The domain is for sale: the header, home page and footer link to `/domain-for-sale/`, which embeds the Zoho enquiry form.

The site is built with [Eleventy](https://www.11ty.dev/) (static HTML, no client framework) and is designed to be hosted on Cloudflare Pages. Fonts (Chakra Petch and JetBrains Mono) are self-hosted from npm packages, so pages make no Google Fonts requests.

## Quick start

```bash
npm install
```

```bash
npm start
```

This serves the site at http://localhost:8080 and rebuilds when files change. To produce a production build in `_site/`:

```bash
npm run build
```

## Project structure

```
eleventy.config.js          Filters, font copying, markdown and structured data helpers
src/
  _data/site.js             Site name, URL, contact email, domain sale form, analytics and advertising settings
  _data/videos.js           The YouTube videos (the main content to edit)
  _data/videoGroups.js      Video groups: names, tags and intros
  _data/glossary.js         FPS slang terms for /glossary/
  _includes/layouts/        base.njk (shell), article.njk (history article), page.njk (simple pages)
  _includes/partials/       Video card, icons, Zoho sale form, ad unit and tracking tags
  assets/css/style.css      Theme styles
  assets/js/site.js         Click-to-play YouTube embeds and the video filter
  index.njk                 Home page
  videos.njk                All videos, grouped, with filter buttons
  glossary.njk              A to Z glossary
  history-of-fragging.md    History article
  domain-for-sale.njk       Domain sale page with the embedded enquiry form
  about.md, contact.md, privacy.md, 404.njk
  sitemap.njk, robots.njk, ads.11ty.js
  _headers                  Cloudflare Pages response headers
```

## Adding or changing videos

Add an entry to `src/_data/videos.js`:

```js
{
  id: "XJyqQW1sdk0",          // the part after watch?v= in the YouTube URL
  group: "counter-strike",    // classic | counter-strike | modern | history (see videoGroups.js)
  title: "Exact title from YouTube",
  channel: "Channel name",
  game: "CS:GO",
  year: 2016,                 // optional
  blurb: "One or two factual sentences.",
  featured: true,             // optional: shown large near the top of the home page (use on one video)
},
```

Before adding a video, check it exists and allows embedding. This prints `200` for a video that can be embedded, `401` if the owner has turned embedding off and `404` or `400` if it has gone:

```bash
curl -s -o /dev/null -w "%{http_code}\n" "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=XJyqQW1sdk0&format=json"
```

When you recheck the list, update `videosChecked` in `src/_data/site.js`; the date is shown on the videos and about pages.

Videos load as a thumbnail and link. Nothing is loaded from YouTube's player until the visitor presses play, and then the embed uses `youtube-nocookie.com`. Without JavaScript, the link opens the video on YouTube.

Content style: British English, factual and neutral, and no em dashes or en dashes.

## Domain sale form

The footer panel, the home page callout and `/domain-for-sale/` are controlled by `site.sale` in `src/_data/site.js`. Set `enabled: false` to remove them all once the domain is sold. The Zoho form ID is `site.sale.zohoForm`; the embed script lives in `src/_includes/partials/sale-form.njk`.

## Analytics and advertising

All settings live in `src/_data/site.js`, and each can be overridden with a Cloudflare Pages environment variable:

| Setting | Environment variable | Purpose |
| --- | --- | --- |
| `analytics.ga4` | `GA4_ID` | Google Analytics 4 measurement ID (`G-...`) |
| `googleAds.conversionId` | `GOOGLE_ADS_ID` | Google Ads tag (`AW-...`) for conversion tracking and remarketing |
| `adsense.client` | `ADSENSE_CLIENT` | AdSense publisher ID (`ca-pub-...`). Loads AdSense (enough for Auto ads) and generates `/ads.txt` |
| `adsense.slots.listing` | `ADSENSE_SLOT_LISTING` | Manual ad unit between video groups on the home and videos pages |
| `adsense.slots.article` | `ADSENSE_SLOT_ARTICLE` | Manual ad unit in the glossary and the history article |

Ad containers are only rendered when both the publisher ID and the relevant slot ID are set.

**Consent.** Google Consent Mode v2 is on by default (`consentMode: true`), so Google tags start with storage denied. To show personalised ads to UK and EEA visitors, Google requires a certified consent management platform. The simplest option is to turn on the GDPR message in AdSense under *Privacy and messaging*. When AdSense is enabled, a "Cookie settings" link appears in the footer so visitors can change their choice.

## Deploying to Cloudflare Pages

1. In the Cloudflare dashboard, go to *Workers and Pages*, create a Pages project and connect this GitHub repository.
2. Build settings:
   - Framework preset: *None*
   - Build command: `npm run build`
   - Build output directory: `_site`
3. Environment variables (optional): `NODE_VERSION` = `22` (also set in `.nvmrc`), plus any of the analytics variables above.
4. Add the custom domain `fr4gz.co.uk` under *Custom domains*. If the domain currently points at GitHub Pages, remove that DNS record or GitHub Pages setting first.

Cloudflare Pages serves `404.html` for missing pages and applies the headers in `src/_headers`.
