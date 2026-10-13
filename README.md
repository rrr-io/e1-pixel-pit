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
  - `detect.js`: finds the photo squares, the date and the certificate number in a screenshot (pure, tested); `pixels.js` feeds it from the browser
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
| Photo covers | `src/assets/covers/` | Drop square PNG/WebP/JPG photos in. They fill the whole photo (rounded corners) and show after the team badges in the PHOTO tab. |
| Built-in pixel stickers | `src/editor/sprites.js` | Drawn from text grids, one character per pixel. |
| Built-in frames, ID covers, text-sticker styles, cover backdrops, E1 GP badge | `src/editor/draw.js` | Drawn in code. |
| Text stickers ("radio messages") | `TEXTS` in `src/editor/catalog.js` | Edit the list. |

File names set order and label: `01-heart.png` comes first and reads "heart". Images up to 160 px wide are drawn pixel-sharp, bigger ones smoothed; the default size follows the image's own proportions. To hide the built-in set once yours replace it, set `SHOW_BUILTIN` in `src/editor/catalog.js` (`stickers`, `frames`, `ids`) to `false`.

### Adding a team

Drop `name.webp` (square, transparent outside the badge) in `src/assets/logos/`, import it in `catalog.js` and add a row to `TEAMS` with a backdrop `color` and `dot` color. It shows up under PHOTO and in the sticker badges.

### Where things land

When a screenshot is loaded, `detect.js` reads it (scaled to 360 px wide) and finds:

- **the photo row**, with any number of squares: the tallest band of rows that stands out from the pastel card, split into one square per photo by the empty gaps between them. All squares share one size and one baseline.
- **the participation date**: the first text line below the photos with text on the right and nothing in the middle.
- **the certificate number**: the lowest text line that starts on the left.

Every photo except the first gets a cover in the chosen team badge (the PHOTO tab's numbered buttons turn single covers on and off), and the date frame and ID cover move onto the date and the number. If nothing is found, decorations keep their relative position and `PRESET` in `catalog.js` is used for new ones.

## Deploy

Pushing to `main` runs the tests, builds and rsyncs `dist/` to `/srv/e1-pixel-pit/` on rio-server, where Caddy serves it at `e1-pixel-pit.rrriooo.com`.