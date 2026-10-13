import { useEffect, useRef } from 'react'
import { drawItem } from '../editor/draw.js'

const S = 124 // canvas px, shown at 62 CSS px

// A tray preview drawn with the same painter as the certificate.
export default function Thumb({ type, itemKey, size, bg }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current.getContext('2d')
    c.clearRect(0, 0, S, S)
    const pad = type === 'frame' ? 0.8 : type === 'id' ? 0.86 : 0.82
    const k = Math.min(S * pad / size.w, S * pad / size.h)
    const yOff = type === 'frame' ? S * 0.08 : 0
    const it = { type, key: itemKey, w: size.w * k, h: size.h * k, x: S / 2, y: S / 2 + yOff, rot: 0, bg }
    if (type === 'frame') {
      c.fillStyle = '#2a2a30'
      c.fillRect(S / 2 - it.w / 2 + 6, S / 2 - it.h / 2 + yOff + 6, it.w - 12, it.h - 12)
      c.fillStyle = '#d6d6dc'; c.font = `${Math.round(it.h * 0.42)}px system-ui`; c.textAlign = 'center'; c.textBaseline = 'middle'
      c.fillText('10.12 12:31', S / 2, S / 2 + yOff)
    }
    drawItem(c, it, null, 0)
  }, [type, itemKey, size.w, size.h, bg])
  return <canvas ref={ref} width={S} height={S} aria-hidden="true" />
}
