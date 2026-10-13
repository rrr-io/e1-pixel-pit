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
