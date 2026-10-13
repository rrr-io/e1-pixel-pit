import { useRef } from 'react'

const FolderIcon = () => (
  <svg width="18" height="16" viewBox="0 0 9 8" aria-hidden="true" shapeRendering="crispEdges">
    <path d="M0 1h3v1h6v6H0z" fill="currentColor" /><path d="M1 3h7v4H1z" fill="#ffffff" />
  </svg>
)
const DiskIcon = () => (
  <svg width="16" height="16" viewBox="0 0 8 8" aria-hidden="true" shapeRendering="crispEdges">
    <path d="M0 0h7v1h1v7H0z" fill="#ffffff" /><path d="M2 0h4v3H2z" fill="#e10600" /><path d="M2 5h4v3H2z" fill="#141414" />
  </svg>
)

export default function Dock({ onFile, onSave }) {
  const fileRef = useRef(null)
  return (
    <div className="dock">
      <div className="dock-in">
        <button type="button" className="btn" onClick={() => fileRef.current.click()}><FolderIcon />OPEN…</button>
        <button type="button" className="btn red" onClick={onSave}><DiskIcon />SAVE AS PNG</button>
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
