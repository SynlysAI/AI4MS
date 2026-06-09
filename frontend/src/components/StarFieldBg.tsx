import { useEffect, useRef } from 'react'

/** Deep space particle background using Canvas. */
export default function StarFieldBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const particles: { x: number; y: number; r: number; vx: number; vy: number; alpha: number }[] = []

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        alpha: Math.random() * 0.4 + 0.1,
      })
    }

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      for (const p of particles) {
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(148, 163, 184, ${p.alpha})`
        ctx!.fill()
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas!.width
        if (p.x > canvas!.width) p.x = 0
        if (p.y < 0) p.y = canvas!.height
        if (p.y > canvas!.height) p.y = 0
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
  )
}
