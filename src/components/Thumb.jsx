import { useEffect, useRef } from 'react'
import { drawItem } from '../editor/draw.js'

// A tray preview drawn with the same painter as the certificate. Wide thumbs suit frames, ID covers and text.
export default function Thumb({ type, itemKey, size, bg, wide }) {
  const ref = useRef(null)
  const W = wide ? 208 : 108, H = 108
  useEffect(() => {
    const c = ref.current.getContext('2d')
    c.clearRect(0, 0, W, H)
    const pad = type === 'frame' ? 0.72 : 0.84
    const k = Math.min(W * pad / size.w, H * pad / size.h)
    const yOff = type === 'frame' ? H * 0.1 : 0
    const it = { type, key: itemKey, w: size.w * k, h: size.h * k, x: W / 2, y: H / 2 + yOff, rot: 0, bg }
    if (type === 'frame') {
      c.fillStyle = '#f4f4f6'
      c.fillRect(W / 2 - it.w / 2 + 4, H / 2 - it.h / 2 + yOff + 4, it.w - 8, it.h - 8)
      c.fillStyle = '#555555'; c.font = `${Math.round(it.h * 0.4)}px system-ui`; c.textAlign = 'center'; c.textBaseline = 'middle'
      c.fillText('10.12 12:31', W / 2, H / 2 + yOff)
    }
    drawItem(c, it, null, 0)
  }, [type, itemKey, size.w, size.h, bg, W])
  return <canvas ref={ref} width={W} height={H} aria-hidden="true" />
}
