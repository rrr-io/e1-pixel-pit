// Runtime assets: decoded team logos, your PNGs, the generated generic badge and the text-sticker cache.
import { TEAMS } from './catalog.js'
import { CUSTOM } from './custom.js'

export const assets = {
  logos: {},
  custom: {}, // 'png:<file stem>' → decoded Image
  generic: null,
  textCache: new Map(),
  logo(key) { return key === 'generic' ? this.generic : this.logos[key] },
  png(key) { return this.custom[key] || null }
}

async function decode(src) {
  const im = new Image()
  im.src = src
  try { await im.decode() } catch { /* drawn when it arrives */ }
  return im
}

// Waits for the pixel font (text drawn before it loads would bake in the fallback), the logos and your PNGs.
export async function loadAssets(makeGenericBadge) {
  const fonts = Promise.all([
    document.fonts.load('20px "Press Start 2P"'),
    document.fonts.load('16px "DotGothic16"')
  ]).catch(() => {})
  await Promise.race([fonts, new Promise(r => setTimeout(r, 2500))])
  await Promise.all([
    ...TEAMS.filter(t => t.src).map(async t => { assets.logos[t.key] = await decode(t.src) }),
    ...Object.values(CUSTOM).flat().map(async e => { assets.custom[e.key] = await decode(e.url) })
  ])
  assets.textCache.clear()
  assets.generic = makeGenericBadge()
}
