import { describe, it, expect } from 'vitest'
import { Editor } from './Editor.js'
import { PRESET } from './catalog.js'

describe('Editor', () => {
  it('drops the cover where the second photo sits on the certificate', () => {
    const ed = new Editor()
    const c = ed.addItem('cover', 'hoonrari')
    expect(c.x).toBeCloseTo(PRESET.cover.x * ed.W)
    expect(c.y).toBeCloseTo(PRESET.cover.y * ed.H)
    expect(ed.sel).toBe(c)
  })

  it('keeps one cover, one date frame and one ID cover: a new pick replaces the old', () => {
    const ed = new Editor()
    const first = ed.addItem('frame', 'kerb')
    first.x = 10
    const second = ed.addItem('frame', 'checker')
    expect(second).toBe(first)
    expect(second.key).toBe('checker')
    expect(second.x).toBe(10)
    expect(ed.items.filter(i => i.type === 'frame')).toHaveLength(1)
  })

  it('stacks stickers and copies them', () => {
    const ed = new Editor()
    ed.addItem('sprite', 'star'); ed.addItem('sprite', 'star')
    expect(ed.duplicate()).toBe(true)
    expect(ed.items).toHaveLength(3)
  })

  it('refuses to copy single parts', () => {
    const ed = new Editor()
    ed.addItem('id', 'plate')
    expect(ed.duplicate()).toBe(false)
  })

  it('applies the chosen backdrop to the current cover', () => {
    const ed = new Editor()
    const c = ed.addItem('cover', 'alpinoo')
    ed.setCoverBg('checker')
    expect(c.bg).toBe('checker')
  })

  it('reorders and removes the selection', () => {
    const ed = new Editor()
    const a = ed.addItem('sprite', 'heart'); const b = ed.addItem('sprite', 'coin')
    ed.select(a); ed.toFront()
    expect(ed.items.at(-1)).toBe(a)
    ed.remove()
    expect(ed.items).toEqual([b])
    expect(ed.sel).toBeNull()
  })

  it('clears every decoration', () => {
    const ed = new Editor()
    const a = ed.addItem('sprite', 'heart'); ed.addItem('sprite', 'flag')
    ed.select(a); ed.clearAll()
    expect(ed.items).toEqual([])
    expect(ed.sel).toBeNull()
  })
})

describe('Editor on a detected certificate', () => {
  const found = n => ({
    slots: Array.from({ length: n }, (_, i) => ({ x: (i + 0.5) / n, y: 0.4, w: 0.8 / n, h: 0.8 / n * (930 / 1410) })),
    date: { x: 0.77, y: 0.78, w: 0.3, h: 0.02 },
    id: { x: 0.3, y: 0.94, w: 0.45, h: 0.015 }
  })

  it('covers every photo but the first, all on the same row', () => {
    const ed = new Editor()
    ed.applyLayout(found(4))
    const covers = ed.items.filter(i => i.type === 'cover')
    expect(covers.map(c => c.slot).sort()).toEqual([1, 2, 3])
    expect(new Set(covers.map(c => c.y)).size).toBe(1)
  })

  it('restyles all covers when a team is picked, and toggles single photos', () => {
    const ed = new Editor()
    ed.applyLayout(found(3))
    ed.addItem('cover', 'alpinoo')
    expect(ed.items.filter(i => i.type === 'cover').every(c => c.key === 'alpinoo')).toBe(true)
    ed.toggleSlot(2)
    expect(ed.covered.has(2)).toBe(false)
    expect(ed.items.some(i => i.slot === 2)).toBe(false)
    ed.toggleSlot(0)
    expect(ed.items.find(i => i.slot === 0).key).toBe('alpinoo')
  })

  it('puts the date frame and the ID cover on what was found', () => {
    const ed = new Editor()
    ed.applyLayout(found(2))
    const f = ed.addItem('frame', 'kerb'), id = ed.addItem('id', 'plate')
    expect(f.x).toBeCloseTo(0.77 * ed.W); expect(f.y).toBeCloseTo(0.78 * ed.H)
    expect(id.x).toBeCloseTo(0.3 * ed.W); expect(id.w).toBeGreaterThan(0.45 * ed.W)
  })

  it('keeps the old behaviour when nothing is found', () => {
    const ed = new Editor()
    expect(ed.applyLayout(null)).toBe(false)
    expect(ed.addItem('cover', 'hoonrari').slot).toBeUndefined()
  })
})
