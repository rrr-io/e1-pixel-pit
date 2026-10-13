import SpriteIcon from './SpriteIcon.jsx'

export default function Header() {
  return (
    <header className="marquee">
      <SpriteIcon name="flag" className="marquee-flag" size={40} />
      <h1>E1 PIXEL PIT</h1>
      <p>Pit stop for your MAMA vote certificate. Load it, deck it out, save it.</p>
      <div className="lights" aria-hidden="true"><i /><i /><i /><i /><i /></div>
    </header>
  )
}
