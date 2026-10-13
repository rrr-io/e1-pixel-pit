// Finds the parts of an MNET Plus voting certificate in a screenshot: the row of artist photos
// (any number of squares), the participation date and the certificate number.
// Pure function on raw RGBA pixels so it runs in tests; the browser side only provides the pixels.
//
// How it reads the certificate:
// - The card background is a pale pastel gradient. Each row's background colour is taken from its
//   left and right margins; a pixel "stands out" when it is far enough from that colour.
// - The photo row is the tallest band of rows where a large share of pixels stand out.
//   Inside it, columns that stand out form one segment per photo; empty gaps separate them.
// - Text is dark pixels. Below the photos, the date is the first line with text on the right and
//   nothing in the middle. The certificate number is the lowest line that starts on the left.
//
// Returns fractions of the image size (0..1), so callers multiply by their own width and height:
// { slots: [{ x, y, w, h }], date: { x, y, w, h } | null, id: { x, y, w, h } | null }
// x and y are box centres. Returns null when no photo row is found.

const STANDS_OUT = 34      // colour distance from the row background
const DARK = 140           // luminance below this counts as text

export function detectLayout({ width: w, height: h, data }) {
  if (!w || !h) return null
  const at = (x, y) => (y * w + x) * 4

  // Row background from the margins (4%–7% in from each side, clear of the card's outer edge).
  const m0 = Math.max(1, Math.round(w * 0.04)), m1 = Math.max(m0 + 1, Math.round(w * 0.07))
  const bg = new Float32Array(h * 3)
  for (let y = 0; y < h; y++) {
    let r = 0, g = 0, b = 0, n = 0
    for (const x0 of [m0, w - m1]) {
      for (let x = x0; x < x0 + (m1 - m0); x++) { const i = at(x, y); r += data[i]; g += data[i + 1]; b += data[i + 2]; n++ }
    }
    bg[y * 3] = r / n; bg[y * 3 + 1] = g / n; bg[y * 3 + 2] = b / n
  }

  const out = new Uint8Array(w * h), dark = new Uint8Array(w * h)
  for (let y = 0; y < h; y++) {
    const br = bg[y * 3], bgc = bg[y * 3 + 1], bb = bg[y * 3 + 2]
    for (let x = 0; x < w; x++) {
      const i = at(x, y), r = data[i], g = data[i + 1], b = data[i + 2]
      const d = Math.abs(r - br) + Math.abs(g - bgc) + Math.abs(b - bb)
      if (d > STANDS_OUT * 1.6) out[y * w + x] = 1
      if (0.299 * r + 0.587 * g + 0.114 * b < DARK) dark[y * w + x] = 1
    }
  }

  // 1. Photo band: the longest run of rows where at least 30% of the inner width stands out.
  const xa = Math.round(w * 0.05), xb = Math.round(w * 0.95)
  const rowCov = new Float32Array(h)
  for (let y = 0; y < h; y++) { let n = 0; for (let x = xa; x < xb; x++) n += out[y * w + x]; rowCov[y] = n / (xb - xa) }
  let best = null
  for (let y = 0; y < h;) {
    if (rowCov[y] < 0.3) { y++; continue }
    let e = y; while (e + 1 < h && rowCov[e + 1] >= 0.3) e++
    if (!best || e - y > best[1] - best[0]) best = [y, e]
    y = e + 1
  }
  if (!best || best[1] - best[0] < w * 0.08) return null
  const [b0, b1] = best, bandH = b1 - b0 + 1

  // 2. Photos: column segments inside the band, small gaps merged, slivers dropped.
  const colCov = new Float32Array(w)
  for (let x = 0; x < w; x++) { let n = 0; for (let y = b0; y <= b1; y++) n += out[y * w + x]; colCov[x] = n / bandH }
  let segs = []
  for (let x = xa; x < xb;) {
    if (colCov[x] < 0.15) { x++; continue }
    let e = x; while (e + 1 < xb && colCov[e + 1] >= 0.15) e++
    segs.push([x, e]); x = e + 1
  }
  const merged = []
  for (const s of segs) {
    const last = merged[merged.length - 1]
    if (last && s[0] - last[1] <= w * 0.008) last[1] = s[1]; else merged.push([...s])
  }
  segs = merged.filter(([a, b]) => b - a + 1 >= w * 0.08)
  if (!segs.length) return null

  // Photos in a row share size and baseline: use the median width, centred on the band.
  const widths = segs.map(([a, b]) => b - a + 1).sort((p, q) => p - q)
  const side = widths[Math.floor(widths.length / 2)]
  const cy = (b0 + b1) / 2
  const sz = Math.max(side, bandH) // rounded corners shave a little off whichever is measured
  const slots = segs.map(([a, b]) => ({ x: (a + b) / 2 / w, y: cy / h, w: sz / w, h: sz / h }))

  // 3. Text lines below the photos.
  const minDark = Math.max(2, Math.round(w * 0.004))
  const lines = []
  for (let y = b1 + Math.round(h * 0.01); y < h - 1;) {
    let n = 0; for (let x = xa; x < xb; x++) n += dark[y * w + x]
    if (n < minDark) { y++; continue }
    let e = y
    for (;;) {
      let k = e + 1, gap = 0, found = false
      while (k < h && gap <= 1) {
        let c = 0; for (let x = xa; x < xb; x++) c += dark[k * w + x]
        if (c >= minDark) { found = true; break }
        gap++; k++
      }
      if (!found) break
      e = k
    }
    lines.push([y, e]); y = e + 1
  }
  const darkIn = (y0, y1, fx0, fx1) => {
    let n = 0, minX = w, maxX = -1
    const x0 = Math.round(w * fx0), x1 = Math.round(w * fx1)
    for (let y = y0; y <= y1; y++) for (let x = x0; x < x1; x++) if (dark[y * w + x]) { n++; if (x < minX) minX = x; if (x > maxX) maxX = x }
    return { n, minX, maxX }
  }
  const box = (x0, x1, y0, y1) => ({ x: (x0 + x1) / 2 / w, y: (y0 + y1) / 2 / h, w: (x1 - x0 + 1) / w, h: (y1 - y0 + 1) / h })

  // The date line: text on the right, nothing across the middle (the label on its left is light grey
  // on real certificates, so it may or may not count as text). Centred lines always cross the middle.
  let date = null, dateLine = -1
  for (let i = 0; i < lines.length; i++) {
    const [y0, y1] = lines[i]
    const mid = darkIn(y0, y1, 0.45, 0.55), right = darkIn(y0, y1, 0.55, 0.97)
    if (y1 - y0 >= 2 && mid.n <= 1 && right.n >= 10 && right.minX >= w * 0.5) {
      date = box(right.minX, right.maxX, y0, y1); dateLine = i; break
    }
  }

  // The certificate number: the lowest text line that starts on the left and stops well before the
  // right edge (the card's own bottom border runs the full width and is skipped).
  let id = null
  for (let i = lines.length - 1; i > dateLine; i--) {
    const [y0, y1] = lines[i]
    const all = darkIn(y0, y1, 0.02, 0.98)
    if (y1 - y0 >= 2 && all.n >= 10 && all.minX < w * 0.2 && all.maxX < w * 0.75) {
      id = box(all.minX, all.maxX, y0, y1); break
    }
  }

  return { slots, date, id }
}
