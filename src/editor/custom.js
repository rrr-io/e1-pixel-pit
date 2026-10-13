// Your own artwork. Every PNG or WebP dropped in these folders shows up in the app, no code needed:
//   src/assets/stickers/  → STICKERS tab (PIXEL filter, before the built-in pixel parts)
//   src/assets/frames/    → DATE tab   (date frames: leave the middle transparent so the date shows)
//   src/assets/ids/       → ID tab     (covers for the certificate number)
// The file name sets the order and the label: "01-heart.png" sorts first and reads "heart".
// Images up to 160 px wide are drawn pixel-sharp (pixel art); bigger ones are smoothed.
const stickers = import.meta.glob('../assets/stickers/*.{png,webp}', { eager: true, import: 'default' })
const frames = import.meta.glob('../assets/frames/*.{png,webp}', { eager: true, import: 'default' })
const ids = import.meta.glob('../assets/ids/*.{png,webp}', { eager: true, import: 'default' })

export const PNG_PREFIX = 'png:'
export const isPng = key => typeof key === 'string' && key.startsWith(PNG_PREFIX)

export function listFromGlob(map) {
  return Object.entries(map)
    .map(([path, url]) => {
      const stem = path.split('/').pop().replace(/\.(png|webp)$/i, '')
      const name = stem.replace(/^\d+[-_ ]*/, '').replace(/[-_]+/g, ' ').trim() || stem
      return { key: PNG_PREFIX + stem, name, url }
    })
    .sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }))
}

// Keyed by the item type the editor already uses, so a PNG frame still replaces the current frame, and so on.
export const CUSTOM = {
  sprite: listFromGlob(stickers),
  frame: listFromGlob(frames),
  id: listFromGlob(ids)
}

export const customEntry = (type, key) => (CUSTOM[type] || []).find(e => e.key === key) || null
