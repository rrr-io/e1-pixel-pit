import { useEffect, useRef } from 'react'
import StatusBar from './StatusBar.jsx'

// The CERTIFICATE.PNG window: title bar with the start lights, the canvas, and a status bar
// that turns into the selection tools when a decoration is selected.
export default function Stage({ editor, ready, toast }) {
  const screenRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    editor.attach(canvasRef.current)
    const fit = () => {
      const el = screenRef.current
      const pad = 24 // .screen padding, both sides
      editor.layout(el.clientWidth - pad, Math.min(window.innerHeight * 0.47, 560))
    }
    const ro = new ResizeObserver(fit)
    ro.observe(screenRef.current)
    window.addEventListener('resize', fit)
    fit()
    return () => { ro.disconnect(); window.removeEventListener('resize', fit) }
  }, [editor])

  return (
    <section className="win" aria-label="Certificate editor">
      <div className="win-bar red">
        <span className="win-title">CERTIFICATE.PNG</span>
        <div className="lights" role="img" aria-label="Start lights"><i /><i /><i /><i /><i /></div>
      </div>
      <div className="screen" ref={screenRef}>
        <canvas ref={canvasRef} id="cv" tabIndex={0} aria-label="Certificate preview. Tap a decoration to select it." />
        {!ready && <div className="loading">WARMING UP TYRES…</div>}
        {!editor.sel && <StatusBar editor={editor} toast={toast} />}
      </div>
      {editor.sel && <StatusBar editor={editor} toast={toast} />}
    </section>
  )
}
