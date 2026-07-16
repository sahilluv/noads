import { useEffect, useRef } from 'react'
import { store } from '../../../store'
import { getPrice } from '../../../utils/pricing'

// Rotating dummy ad images shown on all cells for demo
const DUMMY_AD_URLS = [
  '/assets/ad1.jpg',
  '/assets/ad2.jpg',
  '/assets/ad3.jpg',
  '/assets/ad4.jpg',
  '/assets/ad5.jpg',
]

// ─── Helpers ────────────────────────────────────────────────────────────────

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

/** Draw an L-shaped corner bracket */
function drawBracket(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  armLen: number, lineW: number,
  flipX: boolean, flipY: boolean,
  color: string,
) {
  const sx = flipX ? -1 : 1
  const sy = flipY ? -1 : 1
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = lineW
  ctx.lineCap = 'square'
  ctx.beginPath()
  ctx.moveTo(x + sx * armLen, y)
  ctx.lineTo(x, y)
  ctx.lineTo(x, y + sy * armLen)
  ctx.stroke()
  ctx.restore()
}

/** Draw a subtle grid of lines + plus markers */
function drawGrid(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  cols: number, rows: number,
  color: string,
) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 0.5
  ctx.fillStyle = color

  const cellW = w / cols
  const cellH = h / rows

  // Vertical lines
  for (let c = 1; c < cols; c++) {
    ctx.beginPath()
    ctx.moveTo(x + c * cellW, y)
    ctx.lineTo(x + c * cellW, y + h)
    ctx.stroke()
  }
  // Horizontal lines
  for (let r = 1; r < rows; r++) {
    ctx.beginPath()
    ctx.moveTo(x, y + r * cellH)
    ctx.lineTo(x + w, y + r * cellH)
    ctx.stroke()
  }

  // Plus markers at intersections
  const plusSize = Math.min(cellW, cellH) * 0.12
  ctx.lineWidth = 0.6
  for (let c = 1; c < cols; c++) {
    for (let r = 1; r < rows; r++) {
      const px = x + c * cellW
      const py = y + r * cellH
      ctx.beginPath()
      ctx.moveTo(px - plusSize, py)
      ctx.lineTo(px + plusSize, py)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(px, py - plusSize)
      ctx.lineTo(px, py + plusSize)
      ctx.stroke()
    }
  }

  ctx.restore()
}

// ─── Main card drawing function ──────────────────────────────────────────────

function drawAvailableCard(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  cardW: number, cardH: number,
  price: number,
  now: number,
  cellIndex: number,
) {
  const bx = cx - cardW / 2
  const by = cy - cardH / 2
  const cardR = cardW * 0.09

  const CYAN = 'rgba(0, 210, 255, 1)'
  const CYAN_MID = 'rgba(0, 210, 255, 0.55)'
  const CYAN_GRID = 'rgba(0, 180, 220, 0.10)'

  // Layout proportions
  const hPad = cardW * 0.07
  const headerH = cardH * 0.13
  const footerH = cardH * 0.20
  const gapH = cardH * 0.025
  const innerY = by + headerH + gapH
  const innerH = cardH - headerH - footerH - gapH * 2
  const innerX = bx + hPad * 0.6
  const innerW = cardW - hPad * 1.2

  // ── Outer glow pulse ──────────────────────────────────────────────────────
  const pulse = 0.4 + 0.15 * Math.sin(now * 1.8 + cellIndex * 0.6)
  ctx.save()
  ctx.shadowColor = `rgba(0, 200, 255, ${pulse})`
  ctx.shadowBlur = 14

  // ── Card background ───────────────────────────────────────────────────────
  roundRect(ctx, bx, by, cardW, cardH, cardR)
  const bg = ctx.createLinearGradient(bx, by, bx, by + cardH)
  bg.addColorStop(0, 'rgba(6, 14, 34, 0.97)')
  bg.addColorStop(1, 'rgba(8, 20, 50, 0.97)')
  ctx.fillStyle = bg
  ctx.fill()

  // ── Card border ───────────────────────────────────────────────────────────
  roundRect(ctx, bx, by, cardW, cardH, cardR)
  ctx.strokeStyle = 'rgba(20, 80, 160, 0.7)'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.shadowBlur = 0
  ctx.restore()

  ctx.save()

  // ── Header row ────────────────────────────────────────────────────────────
  // Tag icon (diamond/label shape) + "AVAILABLE"
  const headerMidY = by + headerH * 0.52
  const tagSize = Math.max(4, cardW * 0.065)
  const tagX = bx + hPad
  const tagY = headerMidY

  // Tag icon (rotated square = diamond shape)
  ctx.save()
  ctx.translate(tagX + tagSize * 0.55, tagY)
  ctx.rotate(Math.PI / 4)
  ctx.strokeStyle = CYAN
  ctx.lineWidth = 0.8
  const ts = tagSize * 0.38
  ctx.strokeRect(-ts, -ts, ts * 2, ts * 2)
  ctx.restore()

  // "AVAILABLE" text
  const lblFont = Math.max(4, cardW * 0.09)
  ctx.font = `700 ${lblFont}px Inter, system-ui, sans-serif`
  ctx.fillStyle = CYAN
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('AVAILABLE', bx + hPad + tagSize * 1.3, headerMidY)

  // Three-dot menu (top right)
  const dotSpacing = cardW * 0.038
  const dotMenuX = bx + cardW - hPad
  for (let d = 0; d < 3; d++) {
    ctx.beginPath()
    ctx.arc(dotMenuX - dotSpacing * (2 - d), headerMidY, cardW * 0.018, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(120, 160, 200, 0.6)'
    ctx.fill()
  }

  // Header divider line
  ctx.beginPath()
  ctx.moveTo(bx + hPad * 0.5, by + headerH)
  ctx.lineTo(bx + cardW - hPad * 0.5, by + headerH)
  ctx.strokeStyle = 'rgba(20, 60, 120, 0.5)'
  ctx.lineWidth = 0.6
  ctx.stroke()

  // ── Inner area background ─────────────────────────────────────────────────
  roundRect(ctx, innerX, innerY, innerW, innerH, cardR * 0.4)
  ctx.fillStyle = 'rgba(2, 8, 22, 0.85)'
  ctx.fill()

  // ── Grid pattern ──────────────────────────────────────────────────────────
  ctx.save()
  roundRect(ctx, innerX, innerY, innerW, innerH, cardR * 0.4)
  ctx.clip()
  drawGrid(ctx, innerX, innerY, innerW, innerH, 6, 8, CYAN_GRID)
  ctx.restore()

  // ── Corner brackets (L-shapes, neon glow) ─────────────────────────────────
  const bracketArm = Math.min(innerW, innerH) * 0.16
  const bLineW = Math.max(0.8, cardW * 0.018)
  const bracketPad = cardW * 0.03
  const bCyan = CYAN_MID

  // Top-left
  ctx.shadowColor = CYAN
  ctx.shadowBlur = 6
  drawBracket(ctx, innerX + bracketPad, innerY + bracketPad, bracketArm, bLineW, false, false, bCyan)
  // Top-right
  drawBracket(ctx, innerX + innerW - bracketPad, innerY + bracketPad, bracketArm, bLineW, true, false, bCyan)
  // Bottom-left
  drawBracket(ctx, innerX + bracketPad, innerY + innerH - bracketPad, bracketArm, bLineW, false, true, bCyan)
  // Bottom-right
  drawBracket(ctx, innerX + innerW - bracketPad, innerY + innerH - bracketPad, bracketArm, bLineW, true, true, bCyan)
  ctx.shadowBlur = 0

  // ── Center targeting reticle ──────────────────────────────────────────────
  const reticleCX = innerX + innerW / 2
  const reticleCY = innerY + innerH * 0.42
  const reticleSize = Math.min(innerW, innerH) * 0.22
  const reticleArm = reticleSize * 0.38

  // Reticle corner brackets (inner square)
  ctx.shadowColor = CYAN
  ctx.shadowBlur = 5
  const rLineW = bLineW * 0.85
  drawBracket(ctx, reticleCX - reticleSize, reticleCY - reticleSize * 0.85, reticleArm, rLineW, false, false, CYAN_MID)
  drawBracket(ctx, reticleCX + reticleSize, reticleCY - reticleSize * 0.85, reticleArm, rLineW, true, false, CYAN_MID)
  drawBracket(ctx, reticleCX - reticleSize, reticleCY + reticleSize * 0.85, reticleArm, rLineW, false, true, CYAN_MID)
  drawBracket(ctx, reticleCX + reticleSize, reticleCY + reticleSize * 0.85, reticleArm, rLineW, true, true, CYAN_MID)

  // Center "+" crosshair
  const plusSize = reticleSize * 0.28
  ctx.strokeStyle = CYAN_MID
  ctx.lineWidth = rLineW * 0.9
  ctx.beginPath()
  ctx.moveTo(reticleCX - plusSize, reticleCY)
  ctx.lineTo(reticleCX + plusSize, reticleCY)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(reticleCX, reticleCY - plusSize)
  ctx.lineTo(reticleCX, reticleCY + plusSize)
  ctx.stroke()
  ctx.shadowBlur = 0

  // ── "BUY THIS TILE" text ──────────────────────────────────────────────────
  const txtY = innerY + innerH * 0.72
  const titleFont = Math.max(5, cardW * 0.10)
  ctx.font = `700 ${titleFont}px Inter, system-ui, sans-serif`
  ctx.fillStyle = 'rgba(220, 230, 255, 0.9)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.letterSpacing = `${cardW * 0.012}px`
  ctx.fillText('BUY THIS TILE', reticleCX, txtY)
  ctx.letterSpacing = '0px'

  // Small dash below text
  const dashW = cardW * 0.1
  ctx.beginPath()
  ctx.moveTo(reticleCX - dashW / 2, txtY + titleFont * 0.95)
  ctx.lineTo(reticleCX + dashW / 2, txtY + titleFont * 0.95)
  ctx.strokeStyle = CYAN
  ctx.lineWidth = Math.max(0.8, cardW * 0.015)
  ctx.stroke()

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerY = innerY + innerH + gapH
  const footerActualH = cardH - (footerY - by) - gapH * 0.5
  const footerR = cardR * 0.6

  roundRect(ctx, bx + hPad * 0.4, footerY, cardW - hPad * 0.8, footerActualH, footerR)
  ctx.fillStyle = 'rgba(4, 12, 30, 0.95)'
  ctx.fill()
  roundRect(ctx, bx + hPad * 0.4, footerY, cardW - hPad * 0.8, footerActualH, footerR)
  ctx.strokeStyle = 'rgba(20, 70, 150, 0.55)'
  ctx.lineWidth = 0.7
  ctx.stroke()

  const footerMidY = footerY + footerActualH / 2
  const leftX = bx + hPad * 1.0
  const divX = bx + cardW * 0.42

  // "PRICE" label
  const priceFont = Math.max(4, cardW * 0.075)
  ctx.font = `500 ${priceFont}px Inter, system-ui, sans-serif`
  ctx.fillStyle = 'rgba(130, 160, 200, 0.75)'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('PRICE', leftX, footerMidY - priceFont * 0.9)

  // "₹100" price value
  const valFont = Math.max(7, cardW * 0.16)
  ctx.font = `800 ${valFont}px Inter, system-ui, sans-serif`
  ctx.fillStyle = 'rgba(235, 245, 255, 0.95)'
  ctx.fillText(`₹${price}`, leftX, footerMidY + priceFont * 0.3)

  // Vertical divider
  ctx.beginPath()
  ctx.moveTo(divX, footerY + footerActualH * 0.15)
  ctx.lineTo(divX, footerY + footerActualH * 0.85)
  ctx.strokeStyle = 'rgba(30, 80, 160, 0.5)'
  ctx.lineWidth = 0.7
  ctx.stroke()

  // "BUY TILE" button
  const btnX = divX + cardW * 0.04
  const btnW = cardW - (divX - bx) - hPad * 1.1
  const btnH = footerActualH * 0.72
  const btnY = footerY + (footerActualH - btnH) / 2
  const btnR = btnH / 2

  // Button glow
  ctx.shadowColor = `rgba(0, 160, 255, ${0.45 + 0.2 * Math.sin(now * 2.5 + cellIndex)})`
  ctx.shadowBlur = 10

  roundRect(ctx, btnX, btnY, btnW, btnH, btnR)
  const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnH)
  btnGrad.addColorStop(0, 'rgba(10, 80, 200, 0.95)')
  btnGrad.addColorStop(1, 'rgba(5, 50, 150, 0.95)')
  ctx.fillStyle = btnGrad
  ctx.fill()

  roundRect(ctx, btnX, btnY, btnW, btnH, btnR)
  ctx.strokeStyle = 'rgba(60, 180, 255, 0.8)'
  ctx.lineWidth = 0.9
  ctx.stroke()
  ctx.shadowBlur = 0

  // Cart icon + "BUY TILE" text
  const btnMidX = btnX + btnW / 2
  const btnMidY = btnY + btnH / 2
  const btnFont = Math.max(4, cardW * 0.082)
  const iconSize = btnFont * 1.1
  const totalBtnW = iconSize * 1.6 + btnFont * 3.5
  const iconX = btnMidX - totalBtnW / 2
  const textBtnX = iconX + iconSize * 1.8

  // Cart icon (simplified: body rect + wheels)
  ctx.strokeStyle = 'rgba(255,255,255,0.92)'
  ctx.lineWidth = Math.max(0.6, cardW * 0.012)
  // Cart body
  ctx.beginPath()
  ctx.moveTo(iconX, btnMidY - iconSize * 0.45)
  ctx.lineTo(iconX + iconSize * 0.15, btnMidY - iconSize * 0.45)
  ctx.lineTo(iconX + iconSize * 0.38, btnMidY + iconSize * 0.15)
  ctx.lineTo(iconX + iconSize * 1.1, btnMidY + iconSize * 0.15)
  ctx.lineTo(iconX + iconSize * 1.25, btnMidY - iconSize * 0.18)
  ctx.lineTo(iconX + iconSize * 0.3, btnMidY - iconSize * 0.18)
  ctx.stroke()
  // Wheels
  ctx.beginPath()
  ctx.arc(iconX + iconSize * 0.5, btnMidY + iconSize * 0.37, iconSize * 0.12, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(iconX + iconSize * 1.0, btnMidY + iconSize * 0.37, iconSize * 0.12, 0, Math.PI * 2)
  ctx.fill()

  ctx.font = `700 ${btnFont}px Inter, system-ui, sans-serif`
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('BUY TILE', textBtnX, btnMidY)

  ctx.restore()
}

// ─── Owned cell (ad placed) ──────────────────────────────────────────────────

function drawOwnedCard(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  cardW: number, cardH: number,
  img: HTMLImageElement | null,
  now: number,
  cellIndex: number,
) {
  const bx = cx - cardW / 2
  const by = cy - cardH / 2
  const cardR = cardW * 0.09

  ctx.save()

  // Glow
  const pulse = 0.5 + 0.15 * Math.sin(now * 1.2 + cellIndex * 0.5)
  ctx.shadowColor = `rgba(0, 220, 255, ${pulse})`
  ctx.shadowBlur = 16

  // Card bg
  roundRect(ctx, bx, by, cardW, cardH, cardR)
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.save()
    ctx.clip()
    ctx.drawImage(img, bx, by, cardW, cardH)
    // Dark overlay
    const ov = ctx.createLinearGradient(bx, by + cardH * 0.55, bx, by + cardH)
    ov.addColorStop(0, 'rgba(0,0,0,0)')
    ov.addColorStop(1, 'rgba(0,0,20,0.82)')
    ctx.fillStyle = ov
    ctx.fillRect(bx, by, cardW, cardH)
    ctx.restore()
  } else {
    ctx.fillStyle = 'rgba(6,14,34,0.97)'
    ctx.fill()
  }

  // Border
  roundRect(ctx, bx, by, cardW, cardH, cardR)
  ctx.strokeStyle = 'rgba(0,220,255,0.85)'
  ctx.lineWidth = 1.2
  ctx.stroke()
  ctx.shadowBlur = 0

  // "YOUR AD" badge top-left
  const hPad = cardW * 0.07
  const badgeFont = Math.max(4, cardW * 0.085)
  ctx.font = `700 ${badgeFont}px Inter, system-ui, sans-serif`
  ctx.fillStyle = 'rgba(0,220,255,0.9)'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('YOUR AD', bx + hPad, by + cardH * 0.08)

  ctx.restore()
}

// ─── Main Component ──────────────────────────────────────────────────────────

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
    const mosaicImg = new Image()
    mosaicImg.src = '/assets/mosaic.jpg'

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

      const availableCells = []
      const ownedCellsArr = []

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i]
        const cx = cell.x
        const cy = cell.y

        if (cx < -150 || cx > W + 150 || cy < -150 || cy > H + 150) continue

        const price = getPrice(cx, cy, W, H)
        const isOwned = !!ownedCells[cell.index]
        
        // Scale card by price tier and viewport size
        const tier = (price - 100) / 900
        const base = Math.min(W, H) * 0.063
        const cardW = base + tier * base * 0.3
        const cardH = cardW * 1.42

        if (isOwned) {
          ownedCellsArr.push({ cell, cx, cy, price, cardW, cardH, index: i })
        } else {
          availableCells.push({ cell, cx, cy, price, cardW, cardH, index: i })
        }
      }

      // 1. Draw Available Cards
      for (const item of availableCells) {
        drawAvailableCard(ctx, item.cx, item.cy, item.cardW, item.cardH, item.price, now, item.index)
      }

      // 2. Draw Translucent Ghost Mosaic
      if (mosaicImg.complete) {
        ctx.save()
        ctx.globalAlpha = 0.3
        ctx.globalCompositeOperation = 'screen'
        // Draw the mosaic covering the whole screen
        ctx.drawImage(mosaicImg, 0, 0, W, H)
        ctx.restore()
      }

      // 3. Draw Owned Cards (so they remain completely untouched by the mosaic)
      for (const item of ownedCellsArr) {
        const customImageUrl = ownedCells[item.cell.index]?.business?.imageUrl
        // Fall back to rotating dummy ad if no real image uploaded yet
        const imageUrl = customImageUrl || DUMMY_AD_URLS[item.cell.index % DUMMY_AD_URLS.length]
        let img: HTMLImageElement | null = null
        if (imageUrl) {
          if (!imageCache[imageUrl]) {
            const el = new Image()
            el.src = imageUrl
            imageCache[imageUrl] = el
          }
          img = imageCache[imageUrl]
        }
        drawOwnedCard(ctx, item.cx, item.cy, item.cardW, item.cardH, img, now, item.index)
      }

      // Also render ALL unsold cells with dummy images as a background layer
      for (const item of availableCells) {
        const dummyUrl = DUMMY_AD_URLS[item.cell.index % DUMMY_AD_URLS.length]
        if (!imageCache[dummyUrl]) {
          const el = new Image()
          el.src = dummyUrl
          imageCache[dummyUrl] = el
        }
        const dummyImg = imageCache[dummyUrl]
        if (dummyImg?.complete && dummyImg.naturalWidth > 0) {
          // Draw the dummy image dimly behind the available card
          const bx = item.cx - item.cardW / 2
          const by = item.cy - item.cardH / 2
          ctx.save()
          ctx.globalAlpha = 0.35
          ctx.drawImage(dummyImg, bx, by, item.cardW, item.cardH)
          ctx.restore()
        }
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
