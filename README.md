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
  - `catalog.js`: teams, text stickers, default sizes and where each part lands on a certificate
  - `geometry.js`: hit-testing and rescaling, pure and tested
  - `assets.js`: waits for the pixel font and decodes the logos before anything is drawn
- `src/components/`: the UI around the canvas
- `src/assets/logos/`: team badges, 480px WebP with a transparent background

### Adding a team

Drop `name.webp` (square, transparent outside the badge) in `src/assets/logos/`, import it in `catalog.js` and add a row to `TEAMS` with a backdrop `color` and `dot` color. It shows up under PHOTO and in the sticker badges.

### Where things land

`PRESET` in `catalog.js` holds the spot for the cover, the date frame and the ID cover as fractions of the screenshot, averaged from the EN (930×1410) and JP (605×940) certificates. Screenshots cropped differently need a nudge; when a new screenshot is loaded, existing decorations keep their relative position.

## Deploy

Pushing to `main` runs the tests, builds and rsyncs `dist/` to `/srv/e1-pixel-pit/` on rio-server, where Caddy serves it at `e1-pixel-pit.rrriooo.com`.

Once:

1. Repo secrets: `SSH_HOST`, `SSH_USER`, `SSH_KEY` (same as the other repos).
2. DNS: an `A` record for `e1-pixel-pit.rrriooo.com` pointing to the server.
3. Add the block in `deploy/Caddyfile` to `/srv/caddy/Caddyfile` and reload: `docker exec caddy caddy reload --config /etc/caddy/Caddyfile`.
