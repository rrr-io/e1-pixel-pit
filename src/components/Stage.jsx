import { useEffect, useRef } from 'react'

export default function Stage({ editor, ready, toast }) {
  const screenRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    editor.attach(canvasRef.current)
    const fit = () => editor.layout(screenRef.current.clientWidth, Math.min(window.innerHeight * 0.62, 760))
    const ro = new ResizeObserver(fit)
    ro.observe(screenRef.current)
    window.addEventListener('resize', fit)
    fit()
    return () => { ro.disconnect(); window.removeEventListener('resize', fit) }
  }, [editor])

  const tag = toast || (editor.isDemo ? 'SAMPLE · INSERT COIN TO LOAD YOURS' : '')

  return (
    <section aria-label="Editor">
      <div className="cabinet">
        <div className="screen" ref={screenRef}>
          <canvas
            ref={canvasRef}
            id="cv"
            tabIndex={0}
            aria-label="Certificate preview. Tap a decoration to select it."
          />
          {!ready && <div className="loading">WARMING UP TYRES…</div>}
          {tag && ready && <div className="tag" role="status">{tag.toUpperCase()}</div>}
        </div>
      </div>
      <p className="hint">Drag to move · red knob = size + spin · white knobs = stretch · pinch works too</p>
    </section>
  )
}
