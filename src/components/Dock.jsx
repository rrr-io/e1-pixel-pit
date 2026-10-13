import { useRef, useState } from 'react'

export default function Dock({ onFile, onGacha, onSave }) {
  const fileRef = useRef(null)
  const [shake, setShake] = useState(0)
  return (
    <div className="dock">
      <div className="dock-in">
        <button type="button" className="coin up" onClick={() => fileRef.current.click()}>
          INSERT COIN<small>load screenshot</small>
        </button>
        <button
          type="button"
          key={shake}
          className={'coin gacha' + (shake ? ' shake' : '')}
          onClick={() => { setShake(s => s + 1); onGacha() }}
        >
          GACHA!<small>random sticker</small>
        </button>
        <button type="button" className="coin save" onClick={onSave}>
          SAVE PNG<small>finish line</small>
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={e => { onFile(e.target.files?.[0]); e.target.value = '' }}
      />
    </div>
  )
}
