# E1 Pixel Pit

A Picrew-style garage for MAMA vote certificates. Fans load the screenshot saved from MNET Plus, cover the non-ENHYPEN photo with their E1 team badge, frame the participation date, hide the certificate number, add pixel F1 stickers and save the PNG at the screenshot's own resolution. Everything happens in the browser: nothing is uploaded.

React + Vite, no backend.

## Run locally

```bash
npm install
npm run dev     # :5173
npm test        # vitest, a few seconds
```

## Layout

- `src/editor/`: the canvas engine, no React
  - `Editor.js`: certificate, decorations, selection, pointer handling (drag, red knob to scale and spin, white knobs to stretch, pinch), PNG export
  - `draw.js`: every painter (date frames, ID covers, team covers, text stickers, generic E1 badge)
  - `sprites.js`: pixel-art stickers, one character per pixel
  - `catalog.js`: teams, text stickers, default sizes, `SHOW_BUILTIN` and where each part lands on a certificate
  - `custom.js`: picks up your PNGs from `src/assets/stickers`, `frames` and `ids`
  - `geometry.js`: hit-testing and rescaling, pure and tested
  - `assets.js`: waits for the pixel font and decodes the logos before anything is drawn
- `src/components/`: the UI around the canvas
- `src/assets/logos/`: team badges, 480px WebP with a transparent background

### Where the artwork lives

| What | Where | How to change it |
|---|---|---|
| Team badges (PHOTO tab, TEAMS stickers) | `src/assets/logos/*.webp` | Overwrite a file keeping its name, or point the import in `catalog.js` at your PNG. Square, transparent outside the badge. |
| Your stickers | `src/assets/stickers/` | Drop PNG/WebP files in. They show first under STICKERS › PIXEL and in the gacha. |
| Your date frames | `src/assets/frames/` | Drop PNG/WebP files in, middle transparent. They show first in the DATE tab. |
| Your ID covers | `src/assets/ids/` | Drop PNG/WebP files in. They show first in the ID tab. |
| Built-in pixel stickers | `src/editor/sprites.js` | Drawn from text grids, one character per pixel. |
| Built-in frames, ID covers, text-sticker styles, cover backdrops, E1 GP badge | `src/editor/draw.js` | Drawn in code. |
| Text stickers ("radio messages") | `TEXTS` in `src/editor/catalog.js` | Edit the list. |

File names set order and label: `01-heart.png` comes first and reads "heart". Images up to 160 px wide are drawn pixel-sharp, bigger ones smoothed; the default size follows the image's own proportions. To hide the built-in set once yours replace it, set `SHOW_BUILTIN` in `src/editor/catalog.js` (`stickers`, `frames`, `ids`) to `false`.

### Adding a team

Drop `name.webp` (square, transparent outside the badge) in `src/assets/logos/`, import it in `catalog.js` and add a row to `TEAMS` with a backdrop `color` and `dot` color. It shows up under PHOTO and in the sticker badges.

### Where things land

`PRESET` in `catalog.js` holds the spot for the cover, the date frame and the ID cover as fractions of the screenshot, averaged from the EN (930×1410) and JP (605×940) certificates. Screenshots cropped differently need a nudge; when a new screenshot is loaded, existing decorations keep their relative position.

## Deploy

Pushing to `main` runs the tests, builds and rsyncs `dist/` to `/srv/e1-pixel-pit/` on rio-server, where Caddy serves it at `e1-pixel-pit.rrriooo.com`.