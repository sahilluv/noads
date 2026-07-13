import { useEffect, useRef } from 'react'
import { store } from '../../../store'

/**
 * Maps a cell's screen distance from the viewport centre
 * to a price in the range [minPrice, maxPrice].
 * Cells closest to centre → highest price.
 */
function getPrice(
  cx: number,
  cy: number,
  vw: number,
  vh: number,
  minPrice = 100,
  maxPrice = 1000,
  step = 100,
): number {
  const maxDist = Math.sqrt((vw / 2) ** 2 + (vh / 2) ** 2)
  const dist = Math.sqrt((cx - vw / 2) ** 2 + (cy - vh / 2) ** 2)
  const t = Math.max(0, Math.min(1, dist / maxDist)) // 0 = centre, 1 = edge
  const raw = maxPrice - t * (maxPrice - minPrice)
  return Math.round(raw / step) * step
}

/**
 * Draw a rounded rectangle.
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export const PriceOverlay = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)

      const vf = store.getState().voroforce
      if (!vf?.cells) return

      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      const cells = vf.cells as Array<{ x: number; y: number; index: number }>
      const now = performance.now() / 1000

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i]
        const cx = cell.x
        const cy = cell.y

        // Skip cells outside visible area
        if (cx < 0 || cx > W || cy < 0 || cy > H) continue

        const price = getPrice(cx, cy, W, H)

        // Badge size scales slightly with price tier
        const tier = (price - 100) / 900 // 0..1, centre = 1
        const badgeW = 54 + tier * 14
        const badgeH = 28 + tier * 6
        const bx = cx - badgeW / 2
        const by = cy - badgeH / 2 - 4

        // Animated pulse glow for the centre-most cells (high price)
        if (tier > 0.7) {
          const pulse = 0.3 + 0.2 * Math.sin(now * 3 + i * 0.7)
          ctx.save()
          ctx.shadowColor = `hsla(${40 + tier * 20}, 100%, 60%, ${pulse})`
          ctx.shadowBlur = 12 + tier * 8
          ctx.restore()
        }

        // Badge background — gradient from cool blue (cheap) to warm gold (expensive)
        const hue = 220 - tier * 180 // 220 = blue, 40 = gold
        const grad = ctx.createLinearGradient(bx, by, bx, by + badgeH)
        grad.addColorStop(0, `hsla(${hue}, 90%, 55%, 0.92)`)
        grad.addColorStop(1, `hsla(${hue - 20}, 85%, 38%, 0.92)`)

        ctx.save()

        // Glow shadow
        ctx.shadowColor = `hsla(${hue}, 100%, 65%, 0.6)`
        ctx.shadowBlur = 8

        roundRect(ctx, bx, by, badgeW, badgeH, 6)
        ctx.fillStyle = grad
        ctx.fill()

        // Subtle bright border
        ctx.shadowBlur = 0
        roundRect(ctx, bx, by, badgeW, badgeH, 6)
        ctx.strokeStyle = `hsla(${hue + 30}, 100%, 80%, 0.5)`
        ctx.lineWidth = 1
        ctx.stroke()

        ctx.restore()

        // "BUY" label
        const fontSize = 7 + tier * 2
        ctx.save()
        ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`
        ctx.fillStyle = 'rgba(255,255,255,0.85)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('BUY', cx, by + badgeH * 0.28)
        ctx.restore()

        // Price label  ₹ XXX
        const priceFont = 8 + tier * 3
        ctx.save()
        ctx.font = `900 ${priceFont}px Inter, system-ui, sans-serif`
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`₹${price}`, cx, by + badgeH * 0.72)
        ctx.restore()
      }
    }

    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  )
}
