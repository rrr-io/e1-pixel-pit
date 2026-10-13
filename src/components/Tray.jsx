import { useState } from 'react'
import Thumb from './Thumb.jsx'
import { SPRITES } from '../editor/sprites.js'
import { FRAMES, IDS } from '../editor/draw.js'
import { TEAMS, TEXTS, TEXT_STYLES } from '../editor/catalog.js'

const TITLES = { cover: 'COVERS.EXE', frame: 'DATES.EXE', id: 'IDS.EXE', sticker: 'STICKERS.EXE' }
const BACKDROPS = [['team', 'TEAM'], ['checker', 'CHECKER'], ['race', 'RED'], ['night', 'NIGHT']]
const FILTERS = [['pixel', 'PIXEL'], ['teams', 'TEAMS'], ['radio', 'RADIO'], ['abc', 'ABC']]

function Tile({ editor, type, itemKey, label, showLabel, on, bg, wide }) {
  return (
    <button
      type="button"
      className={'tile' + (on ? ' on' : '') + (wide ? ' wide' : '')}
      onClick={() => editor.addItem(type, itemKey)}
      aria-label={'Add ' + label}
    >
      <Thumb type={type} itemKey={itemKey} size={editor.sizeFor(type, itemKey)} bg={bg} wide={wide} />
      {showLabel && <small>{label}</small>}
    </button>
  )
}

function CustomText({ editor }) {
  const [text, setText] = useState('')
  const [style, setStyle] = useState('red')
  const submit = e => {
    e.preventDefault()
    const t = text.trim().toUpperCase()
    if (!t) return
    editor.addItem('text', { t, s: style })
    setText('')
  }
  return (
    <form className="custom" onSubmit={submit}>
      <input id="ctext" maxLength={22} placeholder="YOUR OWN TEXT" aria-label="Custom sticker text" value={text} onChange={e => setText(e.target.value)} />
      <select id="cstyle" aria-label="Sticker style" value={style} onChange={e => setStyle(e.target.value)}>
        {TEXT_STYLES.map(([k, n]) => <option key={k} value={k}>{n}</option>)}
      </select>
      <button type="submit">ADD</button>
    </form>
  )
}

export default function Tray({ editor, tab, onGacha }) {
  const [filter, setFilter] = useState('pixel')
  const current = editor.current(tab)

  let chips = null
  if (tab === 'cover') {
    chips = BACKDROPS.map(([k, n]) => (
      <button key={k} type="button" className="chip" aria-pressed={editor.coverBg === k} onClick={() => editor.setCoverBg(k)}>{n}</button>
    ))
  } else if (tab === 'sticker') {
    chips = FILTERS.map(([k, n]) => (
      <button key={k} type="button" className="chip" aria-pressed={filter === k} onClick={() => setFilter(k)}>{n}</button>
    ))
  }

  let body
  if (tab === 'cover') {
    body = TEAMS.map(t => <Tile key={t.key} editor={editor} type="cover" itemKey={t.key} label={t.name} bg={editor.coverBg} on={current?.key === t.key} />)
  } else if (tab === 'frame' || tab === 'id') {
    body = Object.entries(tab === 'frame' ? FRAMES : IDS).map(([k, f]) => (
      <Tile key={k} editor={editor} type={tab} itemKey={k} label={f.name} showLabel on={current?.key === k} wide />
    ))
  } else if (filter === 'pixel') {
    body = Object.entries(SPRITES).map(([k, s]) => <Tile key={k} editor={editor} type="sprite" itemKey={k} label={s.name} />)
  } else if (filter === 'teams') {
    body = TEAMS.map(t => <Tile key={t.key} editor={editor} type="logo" itemKey={t.key} label={t.name + ' badge'} />)
  } else if (filter === 'radio') {
    body = TEXTS.map(([t, s]) => <Tile key={t} editor={editor} type="text" itemKey={{ t, s }} label={t} wide />)
  }

  return (
    <section className="win" aria-label="Decorations">
      <div className="win-bar black">
        <span className="win-title">{TITLES[tab]}</span>
        {chips && <div className="chips">{chips}</div>}
      </div>
      {tab === 'sticker' && filter === 'abc'
        ? <CustomText editor={editor} />
        : (
          <div className="tiles">
            {tab === 'sticker' && (
              <button type="button" className="tile gacha" onClick={onGacha} aria-label="Gacha: add a random sticker">
                <span className="capsule" aria-hidden="true" />GACHA
              </button>
            )}
            {body}
          </div>
        )}
    </section>
  )
}
