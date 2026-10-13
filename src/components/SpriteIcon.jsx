import { useEffect, useRef } from 'react'
import { SPRITES, spriteCanvas } from '../editor/sprites.js'

// A pixel sprite drawn 1:1 and scaled up with CSS (image-rendering: pixelated).
export default function SpriteIcon({ name, size = 34, className = '' }) {
  const ref = useRef(null)
  const s = SPRITES[name]
  useEffect(() => {
    const c = ref.current
    c.getContext('2d').drawImage(spriteCanvas(name), 0, 0)
  }, [name])
  return (
    <canvas
      ref={ref}
      className={'pixel ' + className}
      width={s.cols}
      height={s.nrows}
      style={{ width: size, height: size * s.nrows / s.cols }}
      aria-hidden="true"
    />
  )
}
