import { useEffect, useRef } from 'react'
import StatusBar from './StatusBar.jsx'

const TOOLS_H = 42 // .status min-height

// The CERTIFICATE.PNG window: title bar with the start lights, the canvas, and a status bar
// that turns into the selection tools when a decoration is selected.
export default function Stage({ editor, ready, toast }) {
  const screenRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    editor.attach(canvasRef.current)
    // The canvas gets the height the rest of the page leaves free, so the whole editor fits on one
    // screen: big while no tab is open, smaller once the title goes and an item window opens.
    // Room for the selection tools is always kept, so selecting never resizes the canvas mid-drag.
    const fit = () => {
      const el = screenRef.current, app = el.closest('.app')
      const pad = 24 // .screen padding, both sides
      const tools = app.querySelector('.status.tools')
      const others = app.offsetHeight - el.offsetHeight - (tools ? tools.offsetHeight : 0) + TOOLS_H
      const free = window.innerHeight - others - pad - 4 // 4: canvas border
      editor.layout(el.clientWidth - pad, Math.max(220, Math.min(free, 900)))
    }
    const ro = new ResizeObserver(fit)
    ro.observe(screenRef.current.closest('.app'))
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
