// Everything that paints on a canvas. All drawing happens in item-local coordinates:
// the origin is the item's centre and (w, h) its size in image pixels.
import { SPRITES, spriteCanvas } from './sprites.js'
import { teamOf } from './catalog.js'
import { assets } from './assets.js'

export const PIX = '"Press Start 2P", "Courier New", monospace'
export const RED = '#e10600'
export const INK = '#111114'

/* ---------- helpers ---------- */
export function pixPath(p, x, y, w, h, u) {
  p.moveTo(x + u, y); p.lineTo(x + w - u, y); p.lineTo(x + w - u, y + u); p.lineTo(x + w, y + u); p.lineTo(x + w, y + h - u)
  p.lineTo(x + w - u, y + h - u); p.lineTo(x + w - u, y + h); p.lineTo(x + u, y + h); p.lineTo(x + u, y + h - u); p.lineTo(x, y + h - u)
  p.lineTo(x, y + u); p.lineTo(x + u, y + u); p.closePath()
}
function rectPath(p, x, y, w, h) { p.moveTo(x, y); p.lineTo(x + w, y); p.lineTo(x + w, y + h); p.lineTo(x, y + h); p.closePath() }
function ring(c, w, h, t, u, color) {
  const p = new Path2D()
  pixPath(p, -w / 2, -h / 2, w, h, u)
  pixPath(p, -w / 2 + t, -h / 2 + t, w - 2 * t, h - 2 * t, Math.max(0, u - t * 0.3))
  c.fillStyle = color
  c.fill(p, 'evenodd')
}
export function spr(c, key, cx, cy, width) {
  const s = SPRITES[key]
  const h = width * s.nrows / s.cols
  c.save(); c.imageSmoothingEnabled = false
  c.drawImage(spriteCanvas(key), cx - width / 2, cy - h / 2, width, h)
  c.restore()
}
function fitText(c, text, maxW, maxH) {
  let size = maxH
  c.font = size + 'px ' + PIX
  const m = c.measureText(text).width
  if (m > maxW) size *= maxW / m
  return Math.max(1, size)
}
function pixText(c, text, x, y, maxW, maxH, fill, shadow) {
  const s = fitText(c, text, maxW, maxH)
  c.font = s + 'px ' + PIX; c.textAlign = 'center'; c.textBaseline = 'middle'
  if (shadow) { c.fillStyle = shadow; c.fillText(text, x + s * 0.12, y + s * 0.12) }
  c.fillStyle = fill; c.fillText(text, x, y + s * 0.04)
}
function checker(c, x, y, w, h, cell, a, b) {
  for (let j = 0, yy = y; yy < y + h; yy += cell, j++)
    for (let i = 0, xx = x; xx < x + w; xx += cell, i++) { c.fillStyle = (i + j) % 2 ? b : a; c.fillRect(xx, yy, cell + 0.6, cell + 0.6) }
}
function label(c, text, x, y, u, bg, fg) {
  c.font = (u * 2) + 'px ' + PIX
  const tw = c.measureText(text).width, th = u * 3.2
  const p = new Path2D(); pixPath(p, x, y, tw + u * 2.4, th, u * 0.6); c.fillStyle = INK; c.fill(p)
  const q = new Path2D(); pixPath(q, x + u * 0.5, y + u * 0.5, tw + u * 1.4, th - u, u * 0.4); c.fillStyle = bg; c.fill(q)
  c.fillStyle = fg; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(text, x + u * 1.2, y + th / 2 + u * 0.1)
}

/* ---------- date frames: hollow, the date shows through ---------- */
export const FRAMES = {
  kerb: { name: 'Kerb', draw(c, w, h) {
    const u = Math.max(1, h / 10), t = u * 1.8
    const p = new Path2D(); rectPath(p, -w / 2, -h / 2, w, h); rectPath(p, -w / 2 + t, -h / 2 + t, w - 2 * t, h - 2 * t)
    c.save(); c.clip(p, 'evenodd')
    const seg = u * 2.6
    for (let i = 0, x = -w / 2 - h; x < w / 2 + h; x += seg, i++) {
      c.fillStyle = i % 2 ? '#ffffff' : RED
      c.beginPath(); c.moveTo(x, h / 2); c.lineTo(x + seg, h / 2); c.lineTo(x + seg + h, -h / 2); c.lineTo(x + h, -h / 2); c.closePath(); c.fill()
    }
    c.restore(); c.lineWidth = u * 0.5; c.strokeStyle = INK; c.strokeRect(-w / 2, -h / 2, w, h)
  } },
  checker: { name: 'Checker', draw(c, w, h) {
    const u = Math.max(1, h / 10), t = u * 2
    const p = new Path2D(); rectPath(p, -w / 2, -h / 2, w, h); rectPath(p, -w / 2 + t, -h / 2 + t, w - 2 * t, h - 2 * t)
    c.save(); c.clip(p, 'evenodd'); checker(c, -w / 2, -h / 2, w, h, u, '#ffffff', INK); c.restore()
    c.lineWidth = u * 0.6; c.strokeStyle = RED; c.strokeRect(-w / 2, -h / 2, w, h)
  } },
  bow: { name: 'Red bow', draw(c, w, h) {
    const u = h / 10
    ring(c, w, h, u * 1.7, u * 1.4, RED); ring(c, w - u * 1.1, h - u * 1.1, u * 0.45, u * 1.1, '#ffffff')
    spr(c, 'bow', 0, -h / 2 - u * 0.2, Math.min(h * 0.95, w * 0.3))
  } },
  lap: { name: 'Lap time', draw(c, w, h) {
    const u = h / 10
    ring(c, w, h, u * 1.4, u, INK); ring(c, w - u * 2.2, h - u * 2.2, u * 0.5, u * 0.6, RED)
    label(c, 'LAP TIME', -w / 2 + u * 1.5, -h / 2 - u * 3.2 + u * 1.4, u, RED, '#ffffff')
  } },
  gold: { name: 'P1 gold', draw(c, w, h) {
    const u = h / 10
    ring(c, w, h, u * 1.6, u * 1.2, '#d08a12'); ring(c, w - u * 0.8, h - u * 0.8, u * 1.0, u * 0.9, '#ffc83d')
    spr(c, 'trophy', -w / 2, 0, h * 0.85)
    const tw = h * 0.9, th = h * 0.5, tx = w / 2 - tw * 0.75, ty = -h / 2 - th * 0.55
    const p = new Path2D(); pixPath(p, tx, ty, tw, th, u * 0.8); c.fillStyle = INK; c.fill(p)
    const q = new Path2D(); pixPath(q, tx + u * 0.5, ty + u * 0.5, tw - u, th - u, u * 0.5); c.fillStyle = RED; c.fill(q)
    pixText(c, 'P1', tx + tw / 2, ty + th / 2, tw * 0.7, th * 0.55, '#ffffff')
  } },
  lights: { name: 'Lights out', draw(c, w, h) {
    const u = h / 10
    ring(c, w, h, u * 1.4, u * 1.1, INK); ring(c, w - u * 1.2, h - u * 1.2, u * 0.7, u * 0.8, RED)
    const sw = Math.min(w * 0.5, h * 2)
    spr(c, 'lights', 0, -h / 2 - sw * 5 / 16 / 2 + u * 0.6, sw)
  } },
  hiscore: { name: 'Hi-score', draw(c, w, h) {
    const u = h / 10
    c.lineWidth = u * 0.9; c.strokeStyle = RED; c.strokeRect(-w / 2 + u * 0.45, -h / 2 + u * 0.45, w - u * 0.9, h - u * 0.9)
    c.lineWidth = u * 0.6; c.strokeStyle = '#ffffff'; c.strokeRect(-w / 2 + u * 1.7, -h / 2 + u * 1.7, w - u * 3.4, h - u * 3.4)
    label(c, 'HI-SCORE', -w / 2 + u * 1.2, -h / 2 - u * 2.2, u, INK, '#ffffff')
    spr(c, 'sparkle', w / 2 - u * 0.4, -h / 2 + u * 0.4, h * 0.42); spr(c, 'sparkle', -w / 2 + u * 0.4, h / 2 - u * 0.4, h * 0.32)
  } }
}

/* ---------- ID covers: opaque ---------- */
export const IDS = {
  mosaic: { name: 'Pixel blur', mosaic: true },
  checker: { name: 'Checker tape', draw(c, w, h) {
    const u = h / 8, p = new Path2D(); pixPath(p, -w / 2, -h / 2, w, h, u)
    c.save(); c.clip(p); checker(c, -w / 2, -h / 2, w, h, h / 3, '#ffffff', INK); c.restore()
    c.lineWidth = u * 0.5; c.strokeStyle = RED; c.stroke(p)
  } },
  hazard: { name: 'No peeking', draw(c, w, h) {
    const u = h / 8, p = new Path2D(); pixPath(p, -w / 2, -h / 2, w, h, u)
    c.save(); c.clip(p); c.fillStyle = '#ffffff'; c.fillRect(-w / 2, -h / 2, w, h); c.fillStyle = RED
    for (let x = -w / 2 - h; x < w / 2 + h; x += h * 0.75) { c.beginPath(); c.moveTo(x, h / 2); c.lineTo(x + h * 0.35, h / 2); c.lineTo(x + h * 0.35 + h, -h / 2); c.lineTo(x + h, -h / 2); c.closePath(); c.fill() }
    const bw = Math.min(w * 0.78, h * 6.2), bh = h * 0.62, q = new Path2D(); pixPath(q, -bw / 2, -bh / 2, bw, bh, u * 0.6)
    c.fillStyle = INK; c.fill(q); pixText(c, 'NO PEEKING!', 0, 0, bw * 0.86, bh * 0.5, '#ffffff')
    c.restore(); c.lineWidth = u * 0.5; c.strokeStyle = INK; c.stroke(p)
  } },
  coin: { name: '1 coin 1 vote', draw(c, w, h) {
    const u = h / 8, p = new Path2D(); pixPath(p, -w / 2, -h / 2, w, h, u)
    c.fillStyle = INK; c.fill(p); c.lineWidth = u * 0.7; c.strokeStyle = RED; c.stroke(p)
    const cs = h * 0.62; spr(c, 'coin', w / 2 - cs * 0.85, 0, cs)
    pixText(c, '1 COIN = 1 VOTE', -cs * 0.75, 0, w - cs * 2.4, h * 0.34, '#ffffff', RED)
  } },
  ticket: { name: 'Engene pass', draw(c, w, h) {
    const r = h * 0.22, p = new Path2D()
    p.moveTo(-w / 2, -h / 2); p.lineTo(w / 2, -h / 2); p.lineTo(w / 2, -r); p.arc(w / 2, 0, r, -Math.PI / 2, Math.PI / 2, true)
    p.lineTo(w / 2, h / 2); p.lineTo(-w / 2, h / 2); p.lineTo(-w / 2, r); p.arc(-w / 2, 0, r, Math.PI / 2, -Math.PI / 2, true); p.closePath()
    c.fillStyle = RED; c.fill(p); c.lineWidth = h * 0.06; c.strokeStyle = INK; c.stroke(p)
    const sx = w / 2 - h * 1.05
    c.save(); c.setLineDash([h * 0.09, h * 0.08]); c.lineWidth = h * 0.05; c.strokeStyle = '#ffffff'; c.beginPath(); c.moveTo(sx, -h * 0.4); c.lineTo(sx, h * 0.4); c.stroke(); c.restore()
    spr(c, 'star', (sx + w / 2) / 2 - h * 0.03, 0, h * 0.5)
    pixText(c, 'ENGENE PASS', (-w / 2 + sx) / 2, 0, (sx + w / 2) - r * 2 - h * 0.3, h * 0.34, '#ffffff', INK)
  } },
  plate: { name: 'E1 plate', draw(c, w, h) {
    const u = h / 8, p = new Path2D(); pixPath(p, -w / 2, -h / 2, w, h, u)
    c.fillStyle = '#ffffff'; c.fill(p); c.save(); c.clip(p); c.fillStyle = RED; c.fillRect(-w / 2, -h / 2, h * 0.8, h); c.restore()
    pixText(c, 'E1', -w / 2 + h * 0.4, 0, h * 0.6, h * 0.36, '#ffffff')
    c.lineWidth = u * 0.6; c.strokeStyle = INK; c.stroke(p)
    pixText(c, 'ENGENE-26', h * 0.4, 0, w - h * 1.4, h * 0.42, INK)
  } }
}

/* ---------- text stickers ---------- */
const TEXT_LOOK = {
  red: { bg: RED, bd: INK, fg: '#ffffff', sh: '#6b0000' },
  black: { bg: INK, bd: RED, fg: '#ffffff', sh: RED },
  white: { bg: '#ffffff', bd: INK, fg: RED, sh: '#ffc9c6' }
}
export function textBitmap(text, style) {
  const k = style + '|' + text
  if (assets.textCache.has(k)) return assets.textCache.get(k)
  const fs = 44, st = TEXT_LOOK[style] || TEXT_LOOK.red, cv = document.createElement('canvas'), c = cv.getContext('2d')
  c.font = fs + 'px ' + PIX
  const tw = c.measureText(text).width, pad = fs * 0.6, u = fs / 5, strip = style === 'white' ? u * 2 : 0
  cv.width = Math.ceil(tw + pad * 2); cv.height = Math.ceil(fs + pad * 2 + strip)
  const W = cv.width, H = cv.height
  const p = new Path2D(); pixPath(p, 0, strip, W, H - strip, u * 1.4); c.fillStyle = st.bd; c.fill(p)
  const q = new Path2D(); pixPath(q, u * 0.9, strip + u * 0.9, W - u * 1.8, H - strip - u * 1.8, u); c.fillStyle = st.bg; c.fill(q)
  if (strip) { c.save(); const r = new Path2D(); pixPath(r, u * 2, 0, W - u * 4, u * 3, u * 0.8); c.clip(r); checker(c, u * 2, 0, W - u * 4, u * 3, u, INK, '#ffffff'); c.restore() }
  c.font = fs + 'px ' + PIX; c.textAlign = 'center'; c.textBaseline = 'middle'
  c.fillStyle = st.sh; c.fillText(text, W / 2 + u * 0.6, strip + (H - strip) / 2 + u * 0.6)
  c.fillStyle = st.fg; c.fillText(text, W / 2, strip + (H - strip) / 2 + u * 0.2)
  assets.textCache.set(k, cv)
  return cv
}

/* ---------- generic E1 badge (for fans without a team logo) ---------- */
export function makeGenericBadge() {
  const S = 480, cv = document.createElement('canvas'); cv.width = cv.height = S
  const c = cv.getContext('2d'); c.translate(S / 2, S / 2)
  c.save(); c.beginPath(); c.arc(0, 0, S / 2 - 4, 0, Math.PI * 2); c.clip(); checker(c, -S / 2, -S / 2, S, S, S / 16, '#ffffff', INK); c.restore()
  c.beginPath(); c.arc(0, 0, S / 2 - 6, 0, Math.PI * 2); c.lineWidth = 14; c.strokeStyle = RED; c.stroke()
  c.beginPath(); c.arc(0, 0, S * 0.36, 0, Math.PI * 2); c.fillStyle = '#ffffff'; c.fill(); c.lineWidth = 10; c.strokeStyle = INK; c.stroke()
  pixText(c, 'E1', 0, -S * 0.06, S * 0.42, S * 0.24, RED, INK)
  pixText(c, 'GRAND PRIX', 0, S * 0.14, S * 0.5, S * 0.06, INK)
  spr(c, 'star', -S * 0.2, -S * 0.2, S * 0.1); spr(c, 'heart', S * 0.21, -S * 0.2, S * 0.09)
  return cv
}

/* ---------- item painters ---------- */
function drawCover(c, it, w, h) {
  const t = teamOf(it.key), r = Math.min(w, h) * 0.07, p = new Path2D()
  if (p.roundRect) p.roundRect(-w / 2, -h / 2, w, h, r); else rectPath(p, -w / 2, -h / 2, w, h)
  c.save(); c.clip(p)
  const g = Math.max(w, h)
  const dots = (bg, dot, step, alpha) => {
    c.fillStyle = bg; c.fillRect(-w / 2, -h / 2, w, h); c.fillStyle = dot; c.globalAlpha = alpha
    for (let y = -h / 2 + step / 2, j = 0; y < h / 2; y += step, j++)
      for (let x = -w / 2 + step / 2 + (j % 2) * step / 2; x < w / 2; x += step) c.fillRect(x - step * 0.1, y - step * 0.1, step * 0.2, step * 0.2)
    c.globalAlpha = 1
  }
  if (it.bg === 'checker') checker(c, -w / 2, -h / 2, w, h, g / 10, '#ffffff', INK)
  else if (it.bg === 'race') dots(RED, '#ffffff', g / 9, 0.5)
  else if (it.bg === 'night') {
    c.fillStyle = INK; c.fillRect(-w / 2, -h / 2, w, h)
    const s = g / 7; let n = 0
    for (let y = -h / 2 + s / 2; y < h / 2; y += s) for (let x = -w / 2 + s / 2; x < w / 2; x += s) { n++; if (n % 3 === 0) spr(c, 'sparkle', x + (n % 2 ? s * 0.2 : -s * 0.2), y, s * 0.35) }
  } else dots(t.color, t.dot, g / 12, 0.35)
  const im = assets.logo(it.key)
  if (im) { const s = Math.min(w, h) * 0.9; c.drawImage(im, -s / 2, -s / 2, s, s) }
  c.restore()
}
function drawMosaic(c, it, src) {
  const { w, h } = it, cell = Math.max(3, h / 4), cols = Math.max(1, Math.ceil(w / cell)), rows = Math.max(1, Math.ceil(h / cell))
  const t = document.createElement('canvas'); t.width = cols; t.height = rows
  const tc = t.getContext('2d')
  if (src) { try { tc.drawImage(src, it.x - w / 2, it.y - h / 2, w, h, 0, 0, cols, rows) } catch { /* out of bounds */ } }
  else for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { tc.fillStyle = ['#ffd5d3', '#ffffff', '#e6e6ee', '#ff8a85'][(i * 3 + j) % 4]; tc.fillRect(i, j, 1, 1) }
  const u = h / 8, p = new Path2D(); pixPath(p, -w / 2, -h / 2, w, h, u)
  c.save(); c.clip(p); c.imageSmoothingEnabled = false; c.drawImage(t, -w / 2, -h / 2, cols * cell, rows * cell); c.restore()
  c.lineWidth = u * 0.5; c.strokeStyle = RED; c.stroke(p)
}
function drawBitmap(c, img, w, h, smooth) {
  c.save(); c.imageSmoothingEnabled = !!smooth
  if (smooth) c.imageSmoothingQuality = 'high'
  c.drawImage(img, -w / 2, -h / 2, w, h); c.restore()
}

// `src` is the certificate image (needed by the pixel blur). `now` animates the drop-in pop.
export function drawItem(c, it, src, now) {
  c.save(); c.translate(it.x, it.y); c.rotate(it.rot || 0)
  if (now && it.pop) {
    const t = (now - it.pop) / 380
    if (t < 1) { const k = 1 + 0.28 * Math.sin(Math.PI * t) * (1 - t * 0.4); c.scale(k, k) } else it.pop = 0
  }
  if (it.flip) c.scale(-1, 1)
  const { w, h } = it
  switch (it.type) {
    case 'cover': drawCover(c, it, w, h); break
    case 'frame': FRAMES[it.key].draw(c, w, h); break
    case 'id':
      if (IDS[it.key].mosaic) { if (it.flip) c.scale(-1, 1); drawMosaic(c, it, src) } else IDS[it.key].draw(c, w, h)
      break
    case 'sprite': drawBitmap(c, spriteCanvas(it.key), w, h, false); break
    case 'logo': { const im = assets.logo(it.key); if (im) drawBitmap(c, im, w, h, true); break }
    case 'text': drawBitmap(c, textBitmap(it.key.t, it.key.s), w, h, true); break
  }
  c.restore()
}
