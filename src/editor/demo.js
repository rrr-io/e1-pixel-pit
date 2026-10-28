// A neutral sample certificate, laid out like the MNET Plus one, so the editor opens in a working state.
export function makeDemoCertificate() {
  const c = document.createElement('canvas'); c.width = 930; c.height = 1410
  const x = c.getContext('2d')
  const g = x.createLinearGradient(0, 0, 930, 1410)
  g.addColorStop(0, '#efe6ff'); g.addColorStop(0.55, '#f7f9ff'); g.addColorStop(1, '#dff6f6')
  x.fillStyle = g; x.fillRect(0, 0, 930, 1410)
  const rr = (a, b, w, h, r) => { x.beginPath(); if (x.roundRect) x.roundRect(a, b, w, h, r); else x.rect(a, b, w, h) }
  x.textAlign = 'center'
  x.fillStyle = '#1d1d24'; x.font = 'bold 64px system-ui,sans-serif'; x.fillText('VOTING CERTIFICATE', 465, 270)
  x.fillStyle = '#ff4f8b'; x.font = '40px system-ui,sans-serif'; x.fillText('✔ Sample Certificate', 465, 345)
  // Round 2 layout: three photos, the other artist in the middle.
  const side = 228, gap = 22, x0 = 465 - side * 1.5 - gap, top = 430
  const cols = [['#111', '#2b2b33', 'GROUP', '#8a8699'], ['#c7c3d6', null, 'OTHER', '#fff'], ['#2b2b33', '#3a3a44', 'GROUP', '#8a8699']]
  cols.forEach(([bg, band, label, fg], i) => {
    const px = x0 + i * (side + gap)
    x.fillStyle = bg; rr(px, top, side, side, 18); x.fill()
    if (band) { x.fillStyle = band; rr(px, top + 26, side, side - 52, 0); x.fill() }
    x.fillStyle = fg; x.font = '26px system-ui,sans-serif'; x.fillText(label, px + side / 2, top + side / 2 + 9)
  })
  x.fillStyle = '#777'; x.font = '40px system-ui,sans-serif'; x.fillText('2026 MAMA AWARDS', 465, 800)
  x.fillStyle = '#111'; x.font = 'bold 50px system-ui,sans-serif'; x.fillText("FANS' CHOICE · 1st VOTE", 465, 880)
  x.fillStyle = '#d6d4e4'; x.fillRect(66, 1022, 798, 3)
  x.textAlign = 'left'; x.fillStyle = '#777'; x.font = '36px system-ui,sans-serif'; x.fillText('Participation Date', 66, 1110)
  x.textAlign = 'right'; x.fillStyle = '#333'; x.font = '38px system-ui,sans-serif'; x.fillText('2026.10.12 12:31', 862, 1110)
  x.textAlign = 'left'; x.fillStyle = '#888'; x.font = '32px system-ui,sans-serif'; x.fillText('This sample shows where things land.', 66, 1205)
  x.font = 'bold 36px system-ui,sans-serif'; x.fillText('No. 00000SAMPLE00', 66, 1345)
  return c
}
