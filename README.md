# SEO AI Suite — marketing site

A one-page marketing site for **SEO AI Suite** (the self-hosted, AI-powered SEO
toolkit for WordPress), built on a faithful clone of the
<https://www.ilabsolutions.it/> template.

The original is a hand-coded **static site** (jQuery + anime.js + a custom canvas
particle "blob" + custom cursor + the `Grumpy 24` display font). The clone keeps
all of that layout, animation and interaction work intact, and the **content has
been rewritten in English to be about SEO AI Suite** — so the design is the
ilabsolutions template, but every word, badge and section is now about the product.

## Run it

```bash
python3 serve.py
# then open http://localhost:8000
```

A tiny static server is used (instead of just opening `index.html`) so that the
`contact_form.php` overlay renders inside its iframe and relative asset paths
resolve over HTTP exactly like a real site.

## How it was personalized (content sourced from `../seo-ai-suite`)

| Section (original → now) | Content |
|---|---|
| Hero `digital creative studio` → `smart seo suite` | product name in the display serif |
| Intro paragraphs | what it is: self-hosted, talks to Google Search Console + the LLM of your choice, on your own API keys — no cloud, no credits |
| Clients logo grid → **Integrations** | Google Search Console, Google Analytics, Anthropic Claude, OpenAI GPT, Google Ads, PageSpeed Insights, DataForSEO, WordPress REST API |
| Awards → **Product stats** | `20` tools in one plugin · `2` AI providers · `0` credits/clouds/limits (with the original count-up animation) |
| Services (Branding/Web/Adv/Social) → **Feature pillars** | Content · Optimization · Tracking · Ads & Data — using the suite's real screens (Keywords, AI Ideas, Page Optimization, Schema, Site Audit, Rank Tracking, AI Bot Tracking, etc.) |
| Footer `start a project` → `start ranking today` | product footer (placeholder contact + GitHub/Docs/Changelog links) |
| Contact NLForm (Italian) → English | mad-libs form asking feature interest, platform, monthly traffic, etc. |

### Custom assets created for the rebrand
- `img/logo.svg` / `img/logo_white.svg` — circular brand badge ("SEO" + `AI SUITE · FOR WORDPRESS`), replacing the ILAB logo, in dark/white variants.
- `img/cta_text_black.svg` / `img/cta_text_white.svg` — the rotating CTA badge text (`GET STARTED · CONTACT US`), replacing the Italian `UN PREVENTIVO · CONTATTACI`.
- `css/personalize.css` — styles the integration cards and stat tiles; loaded after the template CSS, leaving the original stylesheets untouched.

## Things to fill in
- Footer email (`hello@seoaisuite.dev`), GitHub/Documentation/Changelog links, and the `og:url` are **placeholders** — swap in your real brand details.
- The product name "SEO AI Suite" is the plugin's working name; rename freely.

## Differences from a production deploy (intentional)
- **Third-party tracking removed.** The template embedded Google Tag Manager,
  Analytics, Google Ads and a Facebook Pixel tied to the original owner's
  accounts; these were stripped and the conversion handlers stubbed as no-ops.
- **Contact form is display-only.** The NLForm posts to a server-side handler that
  doesn't exist locally, so submitting does nothing (no backend in this static site).
