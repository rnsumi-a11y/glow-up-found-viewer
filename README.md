# THE GLOW UP FOUND

Finding the glow in the in-between.

An interactive vintage picture viewer for Instagram (personal style, outfits, and beauty), Substack (essays and editorial stories), and The Newsstand (the magazine website). Designed as a destination from Linktree, with warm ivory, blush accents, editorial type, swappable reels, a working advance lever, and a large photo preview.

## Preview

Run `npm run dev`, then open http://127.0.0.1:4173. Use phone and desktop viewport sizes. Run `npm test` and `npm run build` to validate.

## Curated content

All three destination URLs are configured. Each reel contains one owner-approved image with its exact destination URL. The Instagram and Substack portraits and the Newsstand card retain their full image proportions. No personal photographs from the original version are served. No automatic Instagram or Substack fetching runs.

Set the three collection URLs in `public/data/site.json`. Add approved items to `public/data/instagram.json`, `substack.json`, and `newsstand.json`, each with a unique `id`, `title`, `image`, and exact HTTPS `url`. Put approved photographs in `public/assets/`; local image paths start with `/assets/`. Keep `status` as `curated`.

Reel controls support clicking, keyboard arrows, touch swipes, and reduced motion. The direct destination links remain available alongside the interactive experience once configured.

Publishing requires the owner's approval after reviewing phone and desktop previews. Work stays in this existing repository.

Original application code is MIT licensed; see LICENSE. Jost's license is in public/assets/Jost-OFL.txt.
