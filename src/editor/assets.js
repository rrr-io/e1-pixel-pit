// Runtime assets: decoded team logos, the generated generic badge and the text-sticker cache.
import { TEAMS } from './catalog.js'

export const assets = {
  logos: {},
  generic: null,
  textCache: new Map(),
  logo(key) { return key === 'generic' ? this.generic : this.logos[key] }
}

// Waits for the pixel font (text drawn before it loads would bake in the fallback) and the logos.
export async function loadAssets(makeGenericBadge) {
  const fonts = Promise.all([
    document.fonts.load('20px "Press Start 2P"'),
    document.fonts.load('16px "DotGothic16"')
  ]).catch(() => {})
  await Promise.race([fonts, new Promise(r => setTimeout(r, 2500))])
  await Promise.all(TEAMS.filter(t => t.src).map(async t => {
    const im = new Image()
    im.src = t.src
    try { await im.decode() } catch { /* drawn when it arrives */ }
    assets.logos[t.key] = im
  }))
  assets.textCache.clear()
  assets.generic = makeGenericBadge()
}
