import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Editor } from './editor/Editor.js'
import { loadAssets } from './editor/assets.js'
import { makeGenericBadge } from './editor/draw.js'
import { makeDemoCertificate } from './editor/demo.js'
import { detectLayout } from './editor/detect.js'
import { readPixels } from './editor/pixels.js'
import { TEAMS, TEXTS, SHOW_BUILTIN, BUILTIN_STICKERS } from './editor/catalog.js'
import { CUSTOM } from './editor/custom.js'
import Header from './components/Header.jsx'
import Stage from './components/Stage.jsx'
import Tabs from './components/Tabs.jsx'
import Tray from './components/Tray.jsx'
import Dock from './components/Dock.jsx'
import ResultModal from './components/ResultModal.jsx'

export default function App() {
  const editor = useMemo(() => new Editor(), [])
  const [, rerender] = useReducer(x => x + 1, 0)
  const [ready, setReady] = useState(false)
  // No tab open at first: the certificate gets the room. Tapping the open tab again closes it.
  const [tab, setTab] = useState(null)
  const pickTab = key => { setTab(t => (t === key ? null : key)); window.scrollTo(0, 0) }
  const [toast, setToast] = useState('')
  const [result, setResult] = useState(null)
  const toastTimer = useRef(0)

  useEffect(() => editor.subscribe(rerender), [editor])
  useEffect(() => { editor.onHint = msg => flash(msg) })

  useEffect(() => {
    let alive = true
    loadAssets(makeGenericBadge).then(() => {
      if (!alive) return
      const demo = makeDemoCertificate()
      editor.setBase(demo, demo.width, demo.height, true)
      editor.applyLayout(detectLayout(readPixels(demo)))
      const { W, H } = editor
      // A different cover at every visit: any team badge or photo cover.
      const coverPool = [...TEAMS.map(t => t.key), ...CUSTOM.cover.map(e => e.key)]
      editor.addItem('cover', coverPool[Math.floor(Math.random() * coverPool.length)])
      editor.addItem('frame', 'kerb')
      editor.addItem('id', 'plate') // ENGENE-26
      // Starter stickers: VOTE ENHYPEN above the first photo, EN on its bottom corner, EMGP26 and the heart in the empty top corners.
      const en = editor.addItem('sprite', 'png:0_en', { rot: -0.1, anchor: 'photo1' })
      Object.assign(en, editor.onFirstPhoto(en))
      editor.addItem('sprite', 'png:z_bremgp', { x: W * 0.2, y: H * 0.075, rot: -0.08 })
      editor.addItem('sprite', 'heart', { x: W * 0.86, y: H * 0.085, rot: 0.12 })
      editor.addItem('text', { t: 'VOTE ENHYPEN', s: 'red' }, { x: W * 0.3, y: H * 0.29, rot: -0.08 })
      editor.items.forEach(i => { i.pop = 0 })
      editor.select(null)
      setReady(true)
    })
    return () => { alive = false }
  }, [editor])

  const flash = msg => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 1600)
  }

  const loadFile = file => {
    if (!file) return
    const url = URL.createObjectURL(file)
    const im = new Image()
    im.onload = () => {
      editor.setBase(im, im.naturalWidth, im.naturalHeight, false)
      // Find the photo squares, the date and the certificate number, and move the decorations onto them.
      let found = null
      try { found = detectLayout(readPixels(im)) } catch { /* fall back to moving things proportionally */ }
      if (editor.applyLayout(found)) {
        const n = editor.slots.length
        flash(n === 1 ? 'Found 1 photo' : `Found ${n} photos · covered ${editor.covered.size}`)
      } else flash('Could not find the photos: place the cover by hand')
      editor.wiggle()
    }
    im.onerror = () => { URL.revokeObjectURL(url); flash('That file is not an image') }
    im.src = url
  }

  const gacha = () => {
    const pool = [
      ...CUSTOM.sprite.map(e => ['sprite', e.key]),
      ...CUSTOM.team.map(e => ['sprite', e.key]),
      ...(SHOW_BUILTIN.stickers ? BUILTIN_STICKERS : []).map(k => ['sprite', k]),
      ...TEAMS.map(t => ['logo', t.key]),
      ...TEXTS.map(([t, s]) => ['text', { t, s }])
    ]
    const [type, key] = pool[Math.floor(Math.random() * pool.length)]
    editor.addItem(type, key, { rot: (Math.random() - 0.5) * 0.5 })
  }

  const save = async () => {
    const blob = await editor.exportPng()
    if (!blob) { flash('Could not render, try again'); return }
    setResult(blob)
  }


  return (
    <>
      <div className="app">
        {!tab && <Header />}
        <Stage editor={editor} ready={ready} toast={toast} />
        <Tabs tab={tab} onChange={pickTab} />
        {ready && tab && <Tray editor={editor} tab={tab} onGacha={gacha} />}
      </div>
      <Dock onFile={loadFile} onSave={save} />
      {result && <ResultModal blob={result} isDemo={editor.isDemo} size={{ w: editor.W, h: editor.H }} onClose={() => setResult(null)} />}
    </>
  )
}
