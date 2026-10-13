import SpriteIcon from './SpriteIcon.jsx'

export const TABS = [
  ['cover', 'PHOTO', 'capsule'],
  ['frame', 'DATE', 'trophy'],
  ['id', 'ID', 'coin'],
  ['sticker', 'STICKER', 'star']
]

export default function Tabs({ tab, onChange }) {
  return (
    <nav className="tabs" role="tablist" aria-label="Decoration category">
      {TABS.map(([key, label, icon]) => (
        <button
          key={key}
          type="button"
          role="tab"
          className="tab"
          aria-selected={tab === key}
          onClick={() => onChange(key)}
        >
          <SpriteIcon name={icon} size={34} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
