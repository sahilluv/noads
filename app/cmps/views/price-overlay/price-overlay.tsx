import { useEffect, useRef } from 'react'
import { store } from '../../../store'
import { getPrice } from '../../../utils/pricing'


// ── Helpers ─────────────────────────────────────────────────────────────────

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  const clampedR = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + clampedR, y)
  ctx.lineTo(x + w - clampedR, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + clampedR)
  ctx.lineTo(x + w, y + h - clampedR)
  ctx.quadraticCurveTo(x + w, y + h, x + w - clampedR, y + h)
  ctx.lineTo(x + clampedR, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + clampedR)
  ctx.lineTo(x, y + clampedR)
  ctx.quadraticCurveTo(x, y, x + clampedR, y)
  ctx.closePath()
}

function loadImage(url: string, cache: Record<string, HTMLImageElement>): HTMLImageElement | null {
  if (!url) return null
  if (cache[url]) return cache[url]
  const img = new Image()
  img.src = url
  cache[url] = img
  return img
}

// ── Main card drawing function ──────────────────────────────────────────────



// ── Owned cell (ad placed) ──────────────────────────────────────────────────

function drawOwnedCard(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  cardW: number, cardH: number,
  img: HTMLImageElement | null,
  now: number,
  cellIndex: number,
  isActive: boolean,
) {
  const bx = cx - cardW / 2
  const by = cy - cardH / 2
  const cardR = cardW * 0.09
  
  const GOLD = 'hsl(45, 100%, 55%)'
  const GOLD_GLOW = `rgba(255, 180, 0, ${0.5 + 0.2 * Math.sin(now * 1.2 + cellIndex * 0.5)})`

  ctx.save()

  if (isActive) {
    ctx.shadowColor = GOLD_GLOW
    ctx.shadowBlur = 16
  }

  roundRect(ctx, bx, by, cardW, cardH, cardR)
  
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.save()
    ctx.clip()
    ctx.drawImage(img, bx, by, cardW, cardH)
    
    // Subtle dark gradient at bottom for text contrast
    const ov = ctx.createLinearGradient(bx, by + cardH * 0.6, bx, by + cardH)
    ov.addColorStop(0, 'rgba(0,0,0,0)')
    ov.addColorStop(1, 'rgba(20, 15, 0, 0.85)')
    ctx.fillStyle = ov
    ctx.fillRect(bx, by, cardW, cardH)
    ctx.restore()
  } else {
    ctx.fillStyle = 'rgba(18, 12, 6, 0.97)'
    ctx.fill()
  }

  roundRect(ctx, bx, by, cardW, cardH, cardR)
  ctx.strokeStyle = 'rgba(255, 190, 0, 0.85)'
  ctx.lineWidth = 1.2
  ctx.stroke()
  ctx.shadowBlur = 0

  // "SOLD" badge top-left
  const hPad = cardW * 0.07
  const badgeFont = Math.max(4, cardW * 0.085)
  
  // Badge background
  ctx.font = `700 ${badgeFont}px 'Space Grotesk', system-ui, sans-serif`
  const tw = ctx.measureText('SOLD').width
  
  ctx.fillStyle = 'rgba(20, 15, 0, 0.8)'
  roundRect(ctx, bx + hPad * 0.8, by + cardH * 0.06, tw + hPad * 1.2, badgeFont * 1.8, badgeFont * 0.4)
  ctx.fill()
  
  ctx.fillStyle = GOLD
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('SOLD', bx + hPad * 1.4, by + cardH * 0.06 + badgeFont * 0.9)

  ctx.restore()
}

// ── Main Component ──────────────────────────────────────────────────────────

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

    const imageCache: Record<string, HTMLImageElement> = {}
    const mosaicImg = loadImage('/assets/nike_ad.jpg', imageCache)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)

      const state = store.getState()
      const vf = state.voroforce
      const ownedCells = state.ownedCells

      if (!vf?.cells) return

      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      // @ts-ignore
      const activeCells = new Set<number>()
      // @ts-ignore
      if (vf.cells.focused) activeCells.add(vf.cells.focused.index)
      // @ts-ignore
      if (vf.cells.selected) activeCells.add(vf.cells.selected.index)

      const cells = vf.cells as Array<{ x: number; y: number; index: number }>
      const now = performance.now() / 1000

      const ownedCellsArr = []

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i]
        const cx = cell.x
        const cy = cell.y

        if (cx < -150 || cx > W + 150 || cy < -150 || cy > H + 150) continue

        const price = getPrice(cx, cy, W, H)
        const isOwned = !!ownedCells[cell.index]
        const isActive = activeCells.has(cell.index)
        
        const tier = (price - 100) / 900
        const base = Math.min(W, H) * 0.063
        const cardW = base + tier * base * 0.3
        const cardH = cardW * 1.42

        if (isOwned) {
          ownedCellsArr.push({ cell, cx, cy, price, cardW, cardH, index: i, isActive })
        }
      }

      // 2. Draw Translucent Ghost Mosaic
      if (mosaicImg?.complete) {
        ctx.save()
        ctx.globalAlpha = 0.7
        ctx.globalCompositeOperation = 'screen'
        ctx.drawImage(mosaicImg, 0, 0, W, H)
        ctx.restore()
      }

      // 3. Draw Owned Cards (on top of mosaic, untouched)
      for (const item of ownedCellsArr) {
        const customImageUrl = ownedCells[item.cell.index]?.business?.imageUrl
        const img = customImageUrl ? loadImage(customImageUrl, imageCache) : null
        drawOwnedCard(ctx, item.cx, item.cy, item.cardW, item.cardH, img, now, item.index, item.isActive)
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
