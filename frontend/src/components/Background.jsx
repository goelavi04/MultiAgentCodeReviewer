import { useEffect, useRef } from 'react'

export default function Background() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let W, H, raf

    function resize() {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const orbs = [
      { x: 0.18, y: 0.12, r: 0.5, h: 240, s: 0.6, ph: 0 },
      { x: 0.85, y: 0.75, r: 0.45, h: 270, s: 0.4, ph: 2 },
      { x: 0.55, y: 0.35, r: 0.3, h: 255, s: 0.8, ph: 1 },
    ]

    const pts = Array.from({ length: 110 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0005,
      vy: (Math.random() - 0.5) * 0.0005,
      o: Math.random() * 0.45 + 0.08,
      r: Math.random() * 1.3 + 0.3,
    }))

    const beams = Array.from({ length: 8 }, () => ({
      x: Math.random(),
      y: Math.random(),
      tx: Math.random(),
      ty: Math.random(),
      prog: Math.random(),
      spd: Math.random() * 0.0025 + 0.001,
      o: Math.random() * 0.3 + 0.08,
    }))

    const rings = Array.from({ length: 3 }, (_, i) => ({
      x: 0.15 + i * 0.35,
      y: 0.5,
      r: 0,
      maxR: Math.random() * 200 + 120,
      spd: Math.random() * 0.5 + 0.3,
      o: 0.12,
      active: i === 0,
    }))

    let t = 0
    let rt = 0

    function draw() {
      ctx.clearRect(0, 0, W, H)
      t += 0.01
      rt += 0.01

      orbs.forEach((o) => {
        const p = Math.sin(t * o.s + o.ph) * 0.025
        const gx = o.x * W
        const gy = o.y * H
        const gr = o.r * Math.max(W, H) * (1 + p)
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr)
        g.addColorStop(0, `hsla(${o.h},70%,45%,${0.09 + p * 1.5})`)
        g.addColorStop(0.4, `hsla(${o.h},60%,35%,0.04)`)
        g.addColorStop(1, 'rgba(8,8,16,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, W, H)
      })

      if (rt > 2) {
        rings.forEach((r) => {
          r.r = 0
          r.active = true
        })
        rt = 0
      }

      rings.forEach((r) => {
        if (!r.active) return
        r.r += r.spd * 3
        const a = Math.max(0, r.o * (1 - r.r / r.maxR))
        ctx.beginPath()
        ctx.arc(r.x * W, r.y * H, r.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(129,140,248,${a})`
        ctx.lineWidth = 0.6
        ctx.stroke()
        if (r.r >= r.maxR) r.active = false
      })

      beams.forEach((b) => {
        b.prog += b.spd
        if (b.prog > 1) {
          b.x = b.tx
          b.y = b.ty
          b.tx = Math.random()
          b.ty = Math.random()
          b.prog = 0
          b.o = Math.random() * 0.25 + 0.06
        }
        const tail = Math.max(0, b.prog - 0.18)
        const sx = b.x * W + (b.tx - b.x) * W * tail
        const sy = b.y * H + (b.ty - b.y) * H * tail
        const ex = b.x * W + (b.tx - b.x) * W * b.prog
        const ey = b.y * H + (b.ty - b.y) * H * b.prog
        const gr = ctx.createLinearGradient(sx, sy, ex, ey)
        gr.addColorStop(0, 'rgba(129,140,248,0)')
        gr.addColorStop(1, `rgba(167,139,250,${b.o})`)
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(ex, ey)
        ctx.strokeStyle = gr
        ctx.lineWidth = 0.7
        ctx.stroke()
      })

      pts.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = 1
        if (p.x > 1) p.x = 0
        if (p.y < 0) p.y = 1
        if (p.y > 1) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(129,140,248,${p.o * 0.55})`
        ctx.fill()
      })

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = (pts[i].x - pts[j].x) * W
          const dy = (pts[i].y - pts[j].y) * H
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 95) {
            ctx.beginPath()
            ctx.moveTo(pts[i].x * W, pts[i].y * H)
            ctx.lineTo(pts[j].x * W, pts[j].y * H)
            ctx.strokeStyle = `rgba(99,102,241,${(1 - d / 95) * 0.1})`
            ctx.lineWidth = 0.4
            ctx.stroke()
          }
        }
      }

      raf = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
    />
  )
}
