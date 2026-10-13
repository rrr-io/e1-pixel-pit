import { describe, it, expect } from 'vitest'
import { toLocal, handles, hitItem, hitHandle, rescaleItems, snapAngle } from './geometry.js'

const near = (a, b) => expect(a).toBeCloseTo(b, 6)

describe('toLocal', () => {
  it('undoes the item rotation', () => {
    const it = { x: 100, y: 100, rot: Math.PI / 2 }
    const l = toLocal({ x: 100, y: 110 }, it) // 10px below the centre, item turned a quarter
    near(l.x, 10); near(l.y, 0)
  })
})

describe('handles', () => {
  it('gives stretch knobs only to covers, frames and ID covers', () => {
    expect(handles({ type: 'frame', w: 10, h: 4 }).map(h => h.k)).toEqual(['del', 'rot', 'sw', 'sh'])
    expect(handles({ type: 'sprite', w: 10, h: 4 }).map(h => h.k)).toEqual(['del', 'rot'])
  })
  it('finds the knob under the finger', () => {
    const it = { type: 'cover', x: 50, y: 50, w: 20, h: 20, rot: 0 }
    expect(hitHandle({ x: 60, y: 60 }, it, 3)).toBe('rot')
    expect(hitHandle({ x: 40, y: 40 }, it, 3)).toBe('del')
    expect(hitHandle({ x: 50, y: 50 }, it, 3)).toBeNull()
  })
})

describe('hitItem', () => {
  it('picks the topmost item', () => {
    const a = { x: 50, y: 50, w: 40, h: 40, rot: 0 }, b = { x: 55, y: 55, w: 20, h: 20, rot: 0 }
    expect(hitItem({ x: 56, y: 56 }, [a, b])).toBe(b)
    expect(hitItem({ x: 35, y: 35 }, [a, b])).toBe(a)
    expect(hitItem({ x: 0, y: 0 }, [a, b])).toBeNull()
  })
})

describe('rescaleItems', () => {
  it('keeps decorations in the same relative spot on a new screenshot', () => {
    const items = [{ x: 465, y: 705, w: 93, h: 93 }]
    rescaleItems(items, { W: 930, H: 1410 }, { W: 605, H: 940 })
    near(items[0].x, 302.5); near(items[0].y, 470); near(items[0].w, 60.5); near(items[0].h, 60.5)
  })
})

describe('snapAngle', () => {
  it('snaps near quarter turns only', () => {
    near(snapAngle(Math.PI / 2 + 0.03), Math.PI / 2)
    near(snapAngle(0.3), 0.3)
  })
})
