import { useState } from 'react'
import Thumb from './Thumb.jsx'
import { SPRITES } from '../editor/sprites.js'
import { FRAMES, IDS } from '../editor/draw.js'
import { TEAMS, TEXTS, TEXT_STYLES, COVER_BACKDROPS } from '../editor/catalog.js'

const INFO = {
  cover: ['COVER THE OTHER PHOTO', 'Pick a team badge to sit over the non-ENHYPEN picture. Choose a backdrop before or after.'],
  frame: ['FRAME THE DATE', 'One frame around your participation date. Use the white knobs to stretch it to fit.'],
  id: ['HIDE THE CERT NUMBER', 'Cover the certificate No. before you post it.'],
  sticker: ['STICKER GARAGE', 'Tap to drop a sticker, then drag it anywhere. Pinch or use the red knob to size and spin.']
}

function Tile({ editor, type, itemKey, label, on, bg }) {
  return (
    <button type="button" className={'tile' + (on ? ' on' : '')} onClick={() => editor.addItem(type, itemKey)} aria-label={'Add ' + label}>
      <Thumb type={type} itemKey={itemKey} size={editor.sizeFor(type, itemKey)} bg={bg} />
      <small>{label}</small>
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

export default function Tray({ editor, tab }) {
  const [title, lead] = INFO[tab]
  const current = editor.current(tab)

  return (
    <section className="tray" role="tabpanel">
      <h2>{title}</h2>
      <p className="lead">{lead}</p>

      {tab === 'cover' && (
        <>
          <div className="chips">
            <span className="chips-label">BACKDROP</span>
            {COVER_BACKDROPS.map(([k, n]) => (
              <button key={k} type="button" className="chip" aria-pressed={editor.coverBg === k} onClick={() => editor.setCoverBg(k)}>{n}</button>
            ))}
          </div>
          <div className="tiles">
            {TEAMS.map(t => <Tile key={t.key} editor={editor} type="cover" itemKey={t.key} label={t.name} bg={editor.coverBg} on={current?.key === t.key} />)}
          </div>
        </>
      )}

      {(tab === 'frame' || tab === 'id') && (
        <div className="tiles">
          {Object.entries(tab === 'frame' ? FRAMES : IDS).map(([k, f]) => (
            <Tile key={k} editor={editor} type={tab} itemKey={k} label={f.name} on={current?.key === k} />
          ))}
        </div>
      )}

      {tab === 'sticker' && (
        <>
          <h3>PIXEL PARTS</h3>
          <div className="tiles">
            {Object.entries(SPRITES).map(([k, s]) => <Tile key={k} editor={editor} type="sprite" itemKey={k} label={s.name} />)}
          </div>
          <h3>TEAM BADGES</h3>
          <div className="tiles">
            {TEAMS.map(t => <Tile key={t.key} editor={editor} type="logo" itemKey={t.key} label={t.name} />)}
          </div>
          <h3>RADIO MESSAGES</h3>
          <div className="tiles">
            {TEXTS.map(([t, s]) => <Tile key={t} editor={editor} type="text" itemKey={{ t, s }} label={t} />)}
          </div>
          <CustomText editor={editor} />
        </>
      )}
    </section>
  )
}
