import { describe, it, expect } from 'vitest'
import { listFromGlob, isPng } from './custom.js'
import { defaultSize } from './catalog.js'

describe('your PNGs', () => {
  it('turns file names into ordered, readable entries', () => {
    const list = listFromGlob({
      '../assets/stickers/10-crown.png': '/a.png',
      '../assets/stickers/2-heart_big.png': '/b.png',
      '../assets/stickers/flag.webp': '/c.webp'
    })
    expect(list.map(e => e.key)).toEqual(['png:2-heart_big', 'png:10-crown', 'png:flag'])
    expect(list.map(e => e.name)).toEqual(['heart big', 'crown', 'flag'])
    expect(isPng(list[0].key)).toBe(true)
    expect(isPng('heart')).toBe(false)
  })

  it('sizes a PNG from its own proportions', () => {
    const frame = defaultSize('frame', 'png:kerb', 1000, 5)
    expect(frame.w).toBeCloseTo(400); expect(frame.h).toBeCloseTo(80)
    const tall = defaultSize('sprite', 'png:tower', 1000, 0.5)
    expect(tall.h).toBeCloseTo(180); expect(tall.w).toBeCloseTo(90)
  })
})

describe('title-song ID labels', () => {
  it('adds one ID cover per title song, in release order', async () => {
    const { IDS } = await import('./draw.js')
    const { TITLE_SONGS } = await import('./catalog.js')
    const songs = Object.entries(IDS).filter(([, f]) => f.song)
    expect(songs).toHaveLength(TITLE_SONGS.length)
    expect(songs[0]).toEqual(['song-1', expect.objectContaining({ name: 'Given-Taken' })])
    expect(songs.at(-1)[1].name).toBe(TITLE_SONGS.at(-1).title)
  })
})
