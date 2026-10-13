// The editor engine: owns the certificate, the decorations and the canvas.
// React only renders the controls around it and re-renders when `subscribe` fires.
import { PRESET, SINGLE, defaultSize } from './catalog.js'
import { drawItem, textBitmap, RED } from './draw.js'
import { toLocal, handles, hitHandle, hitItem, rescaleItems, snapAngle } from './geometry.js'
import { isPng } from './custom.js'
import { assets } from './assets.js'

export class Editor {
  constructor() {
    this.items = []
    this.sel = null
    this.base = null
    this.W = 930
    this.H = 1410
    this.isDemo = true
    this.coverBg = 'team'
    this.uid = 1
    this.canvas = null
    this.cssW = 300
    this.raf = 0
    this.ptrs = new Map()
    this.mode = null
    this.st = null
    this.listeners = new Set()
    this.render = this.render.bind(this)
  }

  /* ---- React bridge ---- */
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn) }
  emit() { for (const fn of this.listeners) fn() }
  current(type) { return this.items.find(i => i.type === type) || null }

  /* ---- certificate ---- */
  setBase(img, w, h, isDemo = false) {
    if (this.base) rescaleItems(this.items, { W: this.W, H: this.H }, { W: w, H: h })
    this.base = img; this.W = w; this.H = h; this.isDemo = isDemo
    this.layout(); this.emit()
  }

  /* ---- items ---- */
  sizeFor(type, key) {
    let aspect
    if (type === 'text') { const b = textBitmap(key.t, key.s); aspect = b.width / b.height }
    else if (isPng(key)) { const im = assets.png(key); aspect = im && im.naturalHeight ? im.naturalWidth / im.naturalHeight : 1 }
    return defaultSize(type, key, this.W, aspect)
  }

  addItem(type, key, opts = {}) {
    const now = typeof performance !== 'undefined' ? performance.now() : 0
    const existing = SINGLE.includes(type) ? this.current(type) : null
    if (existing) {
      existing.key = key
      if (type === 'cover') existing.bg = this.coverBg
      existing.pop = now
      this.select(existing)
      return existing
    }
    const size = this.sizeFor(type, key), pr = PRESET[type]
    const it = {
      id: this.uid++, type, key, w: size.w, h: size.h, rot: 0, flip: false,
      bg: type === 'cover' ? this.coverBg : undefined,
      x: pr ? pr.x * this.W : this.W * (0.3 + Math.random() * 0.4),
      y: pr ? pr.y * this.H : this.H * (0.18 + Math.random() * 0.5),
      pop: now, ...opts
    }
    this.items.push(it)
    this.select(it)
    return it
  }

  select(it) { this.sel = it; this.dirty(); this.emit() }
  remove() { if (!this.sel) return; this.items = this.items.filter(i => i !== this.sel); this.select(null) }
  clearAll() { this.items = []; this.select(null) }
  duplicate() {
    const s = this.sel
    if (!s || SINGLE.includes(s.type)) return false
    const copy = { ...s, id: this.uid++, x: s.x + this.W * 0.04, y: s.y + this.W * 0.04, pop: performance.now() }
    this.items.push(copy); this.select(copy)
    return true
  }
  flip() { if (this.sel) { this.sel.flip = !this.sel.flip; this.dirty() } }
  toFront() { if (this.sel) { this.items = this.items.filter(i => i !== this.sel); this.items.push(this.sel); this.dirty() } }
  toBack() { if (this.sel) { this.items = this.items.filter(i => i !== this.sel); this.items.unshift(this.sel); this.dirty() } }
  setCoverBg(bg) {
    this.coverBg = bg
    const c = this.current('cover')
    if (c) { c.bg = bg; c.pop = performance.now() }
    this.dirty(); this.emit()
  }

  /* ---- canvas ---- */
  attach(canvas) {
    if (this.canvas === canvas) return // StrictMode mounts effects twice
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    const on = (n, f) => canvas.addEventListener(n, f)
    on('pointerdown', e => this.down(e)); on('pointermove', e => this.move(e))
    on('pointerup', e => this.up(e)); on('pointercancel', e => this.up(e))
    on('keydown', e => this.key(e))
  }

  layout(availW, maxH) {
    if (!this.canvas) return
    if (availW) this.availW = availW
    if (maxH) this.maxH = maxH
    const aw = this.availW || 320, mh = this.maxH || 600
    this.cssW = Math.max(160, Math.min(aw, mh * this.W / this.H))
    const cssH = this.cssW * this.H / this.W, dpr = Math.min(3, window.devicePixelRatio || 1)
    this.canvas.style.width = this.cssW + 'px'
    this.canvas.style.height = cssH + 'px'
    this.canvas.width = Math.round(this.cssW * dpr)
    this.canvas.height = Math.round(cssH * dpr)
    this.dirty()
  }

  dirty() { if (this.canvas && !this.raf) this.raf = requestAnimationFrame(this.render) }

  render(now) {
    this.raf = 0
    const { ctx, canvas } = this, s = canvas.width / this.W
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.setTransform(s, 0, 0, s, 0, 0)
    if (this.base) ctx.drawImage(this.base, 0, 0, this.W, this.H)
    let animating = false
    for (const it of this.items) { drawItem(ctx, it, this.base, now); if (it.pop) animating = true }
    if (this.sel) this.drawSelection(this.sel)
    if (animating) this.dirty()
  }

  drawSelection(it) {
    const ctx = this.ctx, px = this.W / this.cssW
    ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.rot || 0)
    ctx.setLineDash([6 * px, 4 * px]); ctx.lineWidth = 2 * px
    ctx.strokeStyle = '#ffffff'; ctx.strokeRect(-it.w / 2, -it.h / 2, it.w, it.h)
    ctx.lineDashOffset = 5 * px; ctx.strokeStyle = RED; ctx.strokeRect(-it.w / 2, -it.h / 2, it.w, it.h)
    ctx.setLineDash([])
    for (const h of handles(it)) {
      ctx.beginPath()
      if (h.k === 'sw' || h.k === 'sh') {
        ctx.rect(h.x - 6 * px, h.y - 6 * px, 12 * px, 12 * px)
        ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 2 * px; ctx.strokeStyle = '#111114'; ctx.stroke()
        continue
      }
      ctx.arc(h.x, h.y, 12 * px, 0, Math.PI * 2)
      ctx.fillStyle = h.k === 'del' ? '#111114' : RED; ctx.fill()
      ctx.lineWidth = 2 * px; ctx.strokeStyle = '#ffffff'; ctx.stroke()
      ctx.fillStyle = '#ffffff'; ctx.font = `bold ${14 * px}px system-ui,sans-serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(h.k === 'del' ? '×' : '↻', h.x, h.y + px)
    }
    ctx.restore()
  }

  /* ---- pointer: move, scale+spin knob, stretch knobs, two-finger pinch ---- */
  toImg(e) {
    const r = this.canvas.getBoundingClientRect()
    return { x: (e.clientX - r.left) / r.width * this.W, y: (e.clientY - r.top) / r.height * this.H }
  }

  down(e) {
    this.canvas.setPointerCapture(e.pointerId)
    const p = this.toImg(e), sel = this.sel
    this.ptrs.set(e.pointerId, p)
    if (this.ptrs.size === 2 && sel) {
      const [a, b] = [...this.ptrs.values()]
      this.mode = 'pinch'
      this.st = { d: Math.hypot(b.x - a.x, b.y - a.y) || 1, a: Math.atan2(b.y - a.y, b.x - a.x), w: sel.w, h: sel.h, rot: sel.rot, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, x: sel.x, y: sel.y }
      return
    }
    if (this.ptrs.size > 1) return
    const px = this.W / this.cssW
    const knob = hitHandle(p, sel, 20 * px)
    if (knob === 'del') { this.remove(); this.mode = null; return }
    if (knob) {
      this.mode = knob
      this.st = { w: sel.w, h: sel.h, rot: sel.rot || 0, d: Math.hypot(p.x - sel.x, p.y - sel.y) || 1, a: Math.atan2(p.y - sel.y, p.x - sel.x) }
      return
    }
    const it = hitItem(p, this.items, 6 * px)
    if (it) {
      if (sel !== it) this.select(it)
      this.mode = 'move'; this.st = { ox: p.x - it.x, oy: p.y - it.y }
      this.canvas.classList.add('dragging')
    } else {
      if (sel) this.select(null)
      this.mode = null
    }
  }

  move(e) {
    if (!this.ptrs.has(e.pointerId)) return
    const p = this.toImg(e); this.ptrs.set(e.pointerId, p)
    const sel = this.sel, st = this.st
    if (!sel || !this.mode) return
    const min = this.W * 0.03
    if (this.mode === 'pinch' && this.ptrs.size >= 2) {
      const [a, b] = [...this.ptrs.values()], k = Math.hypot(b.x - a.x, b.y - a.y) / st.d
      sel.w = Math.max(min, st.w * k); sel.h = Math.max(min * 0.4, st.h * k)
      sel.rot = st.rot + Math.atan2(b.y - a.y, b.x - a.x) - st.a
      sel.x = st.x + (a.x + b.x) / 2 - st.mx; sel.y = st.y + (a.y + b.y) / 2 - st.my
    } else if (this.mode === 'move') {
      sel.x = p.x - st.ox; sel.y = p.y - st.oy
    } else if (this.mode === 'rot') {
      const k = Math.hypot(p.x - sel.x, p.y - sel.y) / st.d
      sel.w = Math.max(min, st.w * k); sel.h = Math.max(min * 0.4, st.h * k)
      sel.rot = snapAngle(st.rot + Math.atan2(p.y - sel.y, p.x - sel.x) - st.a)
    } else if (this.mode === 'sw') {
      sel.w = Math.max(min, Math.abs(toLocal(p, sel).x) * 2)
    } else if (this.mode === 'sh') {
      sel.h = Math.max(min * 0.4, Math.abs(toLocal(p, sel).y) * 2)
    }
    this.dirty()
  }

  up(e) {
    this.ptrs.delete(e.pointerId)
    if (this.ptrs.size === 0) { this.mode = null; this.canvas.classList.remove('dragging') }
    else if (this.mode === 'pinch') this.mode = null
  }

  key(e) {
    if (!this.sel) return
    const d = e.shiftKey ? 10 : 2
    const m = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] }[e.key]
    if (m) { this.sel.x += m[0]; this.sel.y += m[1]; this.dirty(); e.preventDefault() }
    if (e.key === 'Delete' || e.key === 'Backspace') { this.remove(); e.preventDefault() }
  }

  /* ---- export at the screenshot's own resolution ---- */
  exportPng() {
    const out = document.createElement('canvas'); out.width = this.W; out.height = this.H
    const c = out.getContext('2d')
    if (this.base) c.drawImage(this.base, 0, 0, this.W, this.H)
    for (const it of this.items) drawItem(c, { ...it, pop: 0 }, this.base, 0)
    return new Promise(res => out.toBlob(res, 'image/png'))
  }
}
