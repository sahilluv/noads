import { useEffect, useRef } from 'react'
import { store } from '../../../store'
import { calculateCellPrice } from '../../../utils/pricing'

// getPrice imported from util

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

    // Cache for loaded HTML images
    const imageCache: Record<string, HTMLImageElement> = {}

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)

      const state = store.getState()
      const vf = state.voroforce
      const ownedCells = state.ownedCells

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

        const price = calculateCellPrice(cx, cy)

        const isOwned = !!ownedCells[cell.index]
        const customImage = ownedCells[cell.index]?.imageUrl

        // If custom image exists, draw it!
        if (customImage) {
          if (!imageCache[customImage]) {
            const img = new Image()
            img.src = customImage
            imageCache[customImage] = img
          }
          const img = imageCache[customImage]
          if (img.complete) {
            // Draw image covering the approx cell area (rect)
            const imgW = 120 // Adjust based on cell scale
            const imgH = 180
            ctx.save()
            // Optional: rounded rect clipping for the image
            ctx.beginPath()
            ctx.roundRect(cx - imgW/2, cy - imgH/2, imgW, imgH, 12)
            ctx.clip()
            ctx.drawImage(img, cx - imgW/2, cy - imgH/2, imgW, imgH)
            ctx.restore()
          }
        }

        // Badge size scales slightly with price tier
        const tier = (price - 100) / 900 // 0..1, centre = 1
        const badgeW = 54 + tier * 14
        const badgeH = 28 + tier * 6
        const bx = cx - badgeW / 2
        const by = cy - badgeH / 2 - 4

        // Animated pulse glow for the centre-most cells (high price)
        if (tier > 0.7 && !isOwned) {
          const pulse = 0.3 + 0.2 * Math.sin(now * 3 + i * 0.7)
          ctx.save()
          ctx.shadowColor = `hsla(${40 + tier * 20}, 100%, 60%, ${pulse})`
          ctx.shadowBlur = 12 + tier * 8
          ctx.restore()
        }

        ctx.save()
        
        let hue = 220 - tier * 180 // 220 = blue, 40 = gold
        if (isOwned) {
          hue = 140 // Emerald green for owned
        }

        // Badge background
        const grad = ctx.createLinearGradient(bx, by, bx, by + badgeH)
        grad.addColorStop(0, `hsla(${hue}, ${isOwned ? '60%' : '90%'}, ${isOwned ? '30%' : '55%'}, 0.92)`)
        grad.addColorStop(1, `hsla(${hue - (isOwned ? 0 : 20)}, ${isOwned ? '60%' : '85%'}, ${isOwned ? '15%' : '38%'}, 0.92)`)

        // Glow shadow
        ctx.shadowColor = `hsla(${hue}, 100%, 65%, ${isOwned ? 0.3 : 0.6})`
        ctx.shadowBlur = isOwned ? 4 : 8

        roundRect(ctx, bx, by, badgeW, badgeH, 6)
        ctx.fillStyle = grad
        ctx.fill()

        // Subtle bright border
        ctx.shadowBlur = 0
        roundRect(ctx, bx, by, badgeW, badgeH, 6)
        ctx.strokeStyle = `hsla(${hue + 30}, 100%, 80%, ${isOwned ? 0.3 : 0.5})`
        ctx.lineWidth = 1
        ctx.stroke()

        ctx.restore()

        // "BUY" or "SOLD" label
        const fontSize = 7 + tier * 2
        ctx.save()
        ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`
        ctx.fillStyle = isOwned ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.85)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(isOwned ? 'SOLD' : 'BUY', cx, by + badgeH * 0.28)
        ctx.restore()

        // Price label  ₹ XXX
        const priceFont = 8 + tier * 3
        ctx.save()
        ctx.font = `900 ${priceFont}px Inter, system-ui, sans-serif`
        ctx.fillStyle = isOwned ? 'rgba(255,255,255,0.6)' : '#ffffff'
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
