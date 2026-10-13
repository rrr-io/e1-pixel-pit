import { describe, it, expect } from 'vitest'
import { detectLayout } from './detect.js'

// A synthetic certificate: pastel card, a row of N photo squares, text lines like the real one.
function fakeCertificate({ w = 360, h = 546, photos = 2 } = {}) {
  const data = new Uint8ClampedArray(w * h * 4)
  const fill = (x0, y0, x1, y1, [r, g, b]) => {
    for (let y = Math.round(y0); y < Math.round(y1); y++) for (let x = Math.round(x0); x < Math.round(x1); x++) {
      const i = (y * w + x) * 4; data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = 255
    }
  }
  for (let y = 0; y < h; y++) fill(0, y, w, y + 1, [238 - y * 0.02, 236, 250 - y * 0.03]) // soft gradient
  fill(w * 0.2, h * 0.16, w * 0.8, h * 0.19, [30, 30, 36]) // VOTING CERTIFICATE
  // photo row: N squares, same size, evenly spread inside 7%..93%
  const gap = w * 0.03, inner = w * 0.86, side = (inner - gap * (photos - 1)) / photos
  const top = h * 0.29
  for (let i = 0; i < photos; i++) {
    const x0 = w * 0.07 + i * (side + gap)
    fill(x0, top, x0 + side, top + side, i % 2 ? [200, 120, 150] : [40, 40, 48])
    fill(x0 + side * 0.3, top + side * 0.3, x0 + side * 0.6, top + side * 0.7, [235, 230, 225]) // light patch inside
  }
  const below = top + side + h * 0.04
  fill(w * 0.3, below, w * 0.7, below + 9, [110, 110, 116])          // 2026 MAMA AWARDS
  fill(w * 0.15, below + 22, w * 0.85, below + 34, [20, 20, 20])     // FANS' CHOICE...
  fill(w * 0.07, h * 0.775, w * 0.4, h * 0.79, [110, 110, 116])      // Participation Date
  fill(w * 0.61, h * 0.775, w * 0.93, h * 0.79, [50, 50, 56])        // 2026.10.13 21:42
  fill(w * 0.07, h * 0.83, w * 0.66, h * 0.842, [120, 120, 126])     // This Certificate verifies...
  fill(w * 0.07, h * 0.86, w * 0.33, h * 0.872, [120, 120, 126])     // issued by Mnet Plus.
  fill(w * 0.07, h * 0.93, w * 0.53, h * 0.945, [110, 110, 116])     // No. 61013P5EM74JDMJZ
  return { width: w, height: h, data, expected: { side: side / w, top: top / h } }
}

describe('detectLayout', () => {
  for (const photos of [1, 2, 3, 4]) {
    it(`finds ${photos} photo square(s) on one baseline`, () => {
      const cert = fakeCertificate({ photos })
      const r = detectLayout(cert)
      expect(r.slots).toHaveLength(photos)
      const ys = r.slots.map(s => s.y)
      expect(Math.max(...ys) - Math.min(...ys)).toBeLessThan(0.001)          // not staggered
      for (const s of r.slots) expect(s.w).toBeCloseTo(cert.expected.side, 1)
      for (let i = 1; i < photos; i++) expect(r.slots[i].x).toBeGreaterThan(r.slots[i - 1].x)
    })
  }

  it('finds the date on the right of its line and the certificate number on the left', () => {
    const r = detectLayout(fakeCertificate())
    expect(r.date.x).toBeGreaterThan(0.7); expect(r.date.y).toBeCloseTo(0.78, 1)
    expect(r.id.x).toBeLessThan(0.35); expect(r.id.y).toBeCloseTo(0.94, 1)
  })

  it('gives up on an image without a photo row', () => {
    const w = 100, h = 150, data = new Uint8ClampedArray(w * h * 4).fill(240)
    expect(detectLayout({ width: w, height: h, data })).toBeNull()
  })
})
