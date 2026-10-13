export default function SelTools({ editor, onDuplicate }) {
  const off = !editor.sel
  const tools = [
    ['⧉', 'COPY', onDuplicate],
    ['⇋', 'FLIP', () => editor.flip()],
    ['▲', 'FRONT', () => editor.toFront()],
    ['▼', 'BACK', () => editor.toBack()],
    ['✕', 'DEL', () => editor.remove(), 'danger']
  ]
  return (
    <div className="seltools" aria-label="Selected decoration">
      {tools.map(([icon, label, fn, cls]) => (
        <button key={label} type="button" className={'tool ' + (cls || '')} disabled={off} onClick={fn}>
          <b aria-hidden="true">{icon}</b>{label}
        </button>
      ))}
    </div>
  )
}
