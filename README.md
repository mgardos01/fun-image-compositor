# Image Compositor

Multiply groups of images together, like stacking layers set to _multiply_, and tile the
results into one picture. Everything runs in the browser: images are decoded by the browser and
blended with [Photon](https://silvia-odwyer.github.io/photon/) (WebAssembly) in web workers, and
nothing is uploaded.

**Live site:** https://mgardos01.github.io/fun-image-compositor/

## How it works

1. Add images by dropping them anywhere on the page (desktop) or with **Add images** (phones open
   the photo library). Drag thumbnails to reorder them; on touch screens, press and hold first.
2. Every _Layers per image_ consecutive images are multiplied together into one tile. The first
   image in each group sets the tile's size, and the others must be at least that large.
3. The tiles are laid out _Images per row_ across in the final image, which you can download or
   share.

## Developing

Requires Node 22.17 or newer.

```bash
npm install
npm run dev
```

Other scripts: `npm run build` (static site in `build/`), `npm run preview`, `npm run check`
(types) and `npm run lint`.

Built with SvelteKit 3 and Svelte 5, using `@sveltejs/adapter-static`. SvelteKit's options live in
`vite.config.ts`.

## Deploying

`.github/workflows/deploy.yml` builds the site and publishes it to GitHub Pages on every push to
`main`. It sets `BASE_PATH` to `/<repo-name>`, since Pages serves the site from that subfolder.
To enable it, set **Settings → Pages → Source** to **GitHub Actions**.
