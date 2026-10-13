import hoonrari from '../assets/logos/hoonrari.webp'
import alpinoo from '../assets/logos/alpinoo.webp'
import meowcedes from '../assets/logos/meowcedes.webp'
import jaybull from '../assets/logos/jaybull.webp'
import mcjakey from '../assets/logos/mcjakey.webp'
import rikston from '../assets/logos/rikston.webp'
import { SPRITES } from './sprites.js'

// The E1 teams. `generic` has no file: its badge is drawn at runtime (assets.js).
export const TEAMS = [
  { key: 'hoonrari', name: 'Hoonrari', src: hoonrari, color: '#e10600', dot: '#ff7a7a' },
  { key: 'alpinoo', name: 'Alpinoo', src: alpinoo, color: '#ff8cc6', dot: '#2c9bff' },
  { key: 'meowcedes', name: 'Meowcedes', src: meowcedes, color: '#1c1c22', dot: '#9aa0ad' },
  { key: 'jaybull', name: 'Jaybull', src: jaybull, color: '#f6c400', dot: '#1b2a5a' },
  { key: 'mcjakey', name: 'McJakey', src: mcjakey, color: '#ff8a00', dot: '#ffd09a' },
  { key: 'rikston', name: 'Rikston', src: rikston, color: '#0e6b4f', dot: '#3fd18f' },
  { key: 'generic', name: 'E1 GP', src: null, color: '#111114', dot: '#e10600' }
]
export const teamOf = key => TEAMS.find(t => t.key === key) || TEAMS[TEAMS.length - 1]

export const COVER_BACKDROPS = [['team', 'TEAM'], ['checker', 'CHECKER'], ['race', 'RACE RED'], ['night', 'NIGHT']]

// ENHYPEN Korean title tracks, used as labels to cover the certificate number (ID tab › SONGS).
// Long titles use their usual short form. Add new ones at the end.
export const TITLE_SONGS = [
  { title: 'Given-Taken', year: 2020 },
  { title: 'Drunk-Dazed', year: 2021 },
  { title: 'Fever', year: 2021 },
  { title: 'Tamed-Dashed', year: 2022 },
  { title: 'Future Perfect', year: 2022 },
  { title: 'Bite Me', year: 2023 },
  { title: 'Sweet Venom', year: 2023 },
  { title: 'XO', year: 2024 },
  { title: 'No Doubt', year: 2024 },
  { title: 'Bad Desire', year: 2025 },
  { title: 'Knife', year: 2026 },
  { title: 'Bloody Paradise', year: 2026 }
]

// "Radio messages": text stickers. Kept short and on theme (F1 radio x MAMA voting).
export const TEXTS = [
  ['VOTE ENHYPEN', 'red'], ['LIGHTS OUT & VOTE', 'black'], ['BOX BOX: VOTE!', 'white'],
  ['P1 ENHYPEN', 'black'], ['NO PIT STOP TILL #1', 'red'], ['HIGH SCORE: ENGENE', 'black'],
  ['FASTEST VOTER', 'white'], ['+1 VOTE', 'red'], ['1UP', 'black'], ['PODIUM ONLY', 'white']
]
export const TEXT_STYLES = [['red', 'RED'], ['black', 'BLACK'], ['white', 'WHITE']]

// One of each per certificate: adding another replaces it.
export const SINGLE = ['cover', 'frame', 'id']
// Types with free width/height (stretch knobs); the rest only scale uniformly.
export const STRETCHY = ['cover', 'frame', 'id']

// Where each part sits on an MNET Plus certificate, as fractions of width/height.
// Averaged from the EN (930x1410) and JP (605x940) screenshots.
export const PRESET = {
  cover: { x: 0.703, y: 0.413 },
  frame: { x: 0.772, y: 0.778 },
  id: { x: 0.28, y: 0.95 }
}

// The drawn-in-code parts. Set one to false once your own PNGs (src/assets/…) replace that set.
export const SHOW_BUILTIN = { stickers: true, frames: true, ids: true }
// Built-in pixel stickers offered in the tray. The others stay defined in sprites.js for internal drawings.
export const BUILTIN_STICKERS = ['heart', 'flag', 'trophy']

// Default size in image pixels for an image `W` wide.
// `aspect` is width/height of the artwork when it comes from a bitmap: a text sticker or one of your PNGs.
export function defaultSize(type, key, W, aspect = 4) {
  if (typeof key === 'string' && key.startsWith('png:')) {
    if (type === 'frame') return { w: W * 0.4, h: W * 0.4 / aspect }
    if (type === 'id') return { w: W * 0.48, h: W * 0.48 / aspect }
    const big = W * 0.35
    return aspect >= 1 ? { w: big, h: big / aspect } : { w: big * aspect, h: big }
  }
  if (type === 'cover') return { w: W * 0.365, h: W * 0.365 }
  if (type === 'frame') return { w: W * 0.4, h: W * 0.078 }
  if (type === 'id') return { w: W * 0.48, h: W * 0.078 }
  if (type === 'logo') return { w: W * 0.24, h: W * 0.24 }
  if (type === 'text') { const h = W * 0.065; return { w: h * aspect, h } }
  const s = SPRITES[key]
  const big = key.startsWith('car') ? W * 0.26 : W * 0.15
  return s.cols >= s.nrows ? { w: big, h: big * s.nrows / s.cols } : { w: big * s.cols / s.nrows, h: big }
}
