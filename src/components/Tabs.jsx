export const TABS = [
  ['cover', 'PHOTO'],
  ['frame', 'DATE'],
  ['id', 'ID'],
  ['sticker', 'STICKERS']
]

export default function Tabs({ tab, onChange }) {
  return (
    <nav className="tabs" role="tablist" aria-label="Decoration category">
      {TABS.map(([key, label]) => (
        <button key={key} type="button" role="tab" className="tab" aria-selected={tab === key} onClick={() => onChange(key)}>
          {label}
        </button>
      ))}
    </nav>
  )
}
