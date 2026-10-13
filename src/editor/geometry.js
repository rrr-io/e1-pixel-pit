// Pure geometry, no DOM: tested in geometry.test.js.
import { STRETCHY } from './catalog.js'

// A point in image coordinates, seen from the item's centre with its rotation undone.
export function toLocal(p, it) {
  const dx = p.x - it.x, dy = p.y - it.y
  const c = Math.cos(-(it.rot || 0)), s = Math.sin(-(it.rot || 0))
  return { x: dx * c - dy * s, y: dx * s + dy * c }
}

// Knobs drawn around the selected item, in item-local coordinates.
export function handles(it) {
  const list = [{ k: 'del', x: -it.w / 2, y: -it.h / 2 }, { k: 'rot', x: it.w / 2, y: it.h / 2 }]
  if (STRETCHY.includes(it.type)) list.push({ k: 'sw', x: it.w / 2, y: 0 }, { k: 'sh', x: 0, y: it.h / 2 })
  return list
}

export function hitHandle(p, it, radius) {
  if (!it) return null
  const l = toLocal(p, it)
  for (const h of handles(it)) if (Math.hypot(l.x - h.x, l.y - h.y) <= radius) return h.k
  return null
}

// Topmost item under the point (last drawn wins).
export function hitItem(p, items, slop = 0) {
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i], l = toLocal(p, it)
    if (Math.abs(l.x) <= it.w / 2 + slop && Math.abs(l.y) <= it.h / 2 + slop) return it
  }
  return null
}

// When a new screenshot replaces the old one, keep each decoration in the same relative spot.
// Sizes follow the width so a square stays square.
export function rescaleItems(items, from, to) {
  const kx = to.W / from.W, ky = to.H / from.H
  for (const it of items) { it.x *= kx; it.y *= ky; it.w *= kx; it.h *= kx }
  return items
}

// Snap a rotation to the nearest quarter turn when it is close enough.
export function snapAngle(r, tolerance = 0.06) {
  const q = Math.PI / 2, snapped = Math.round(r / q) * q
  return Math.abs(r - snapped) < tolerance ? snapped : r
}
