import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Editor } from './editor/Editor.js'
import { loadAssets } from './editor/assets.js'
import { makeGenericBadge } from './editor/draw.js'
import { makeDemoCertificate } from './editor/demo.js'
import { SPRITES } from './editor/sprites.js'
import { TEAMS, TEXTS } from './editor/catalog.js'
import Header from './components/Header.jsx'
import Stage from './components/Stage.jsx'
import SelTools from './components/SelTools.jsx'
import Tabs from './components/Tabs.jsx'
import Tray from './components/Tray.jsx'
import Dock from './components/Dock.jsx'
import ResultModal from './components/ResultModal.jsx'

export default function App() {
  const editor = useMemo(() => new Editor(), [])
  const [, rerender] = useReducer(x => x + 1, 0)
  const [ready, setReady] = useState(false)
  const [tab, setTab] = useState('cover')
  const [toast, setToast] = useState('')
  const [result, setResult] = useState(null)
  const toastTimer = useRef(0)

  useEffect(() => editor.subscribe(rerender), [editor])

  useEffect(() => {
    let alive = true
    loadAssets(makeGenericBadge).then(() => {
      if (!alive) return
      const demo = makeDemoCertificate()
      editor.setBase(demo, demo.width, demo.height, true)
      const { W, H } = editor
      editor.addItem('cover', 'hoonrari')
      editor.addItem('frame', 'kerb')
      editor.addItem('id', 'hazard')
      editor.addItem('sprite', 'carRed', { x: W * 0.2, y: H * 0.6, rot: -0.12 })
      editor.addItem('sprite', 'star', { x: W * 0.9, y: H * 0.2 })
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
    im.onload = () => { editor.setBase(im, im.naturalWidth, im.naturalHeight, false); flash('Loaded! Nudge things into place') }
    im.onerror = () => { URL.revokeObjectURL(url); flash('That file is not an image') }
    im.src = url
  }

  const gacha = () => {
    const pool = [
      ...Object.keys(SPRITES).map(k => ['sprite', k]),
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

  const duplicate = () => { if (!editor.duplicate()) flash('One per certificate') }

  return (
    <>
      <div className="app">
        <Header />
        <Stage editor={editor} ready={ready} toast={toast} />
        <SelTools editor={editor} onDuplicate={duplicate} />
        <Tabs tab={tab} onChange={setTab} />
        {ready && <Tray editor={editor} tab={tab} />}
      </div>
      <Dock onFile={loadFile} onGacha={gacha} onSave={save} />
      {result && <ResultModal blob={result} isDemo={editor.isDemo} onClose={() => setResult(null)} />}
    </>
  )
}
