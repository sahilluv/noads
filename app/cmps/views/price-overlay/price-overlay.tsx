import { useEffect, useRef } from 'react'
import { store } from '../../../store'
import { getPrice } from '../../../utils/pricing'

/**
 * Draw a rounded rectangle path.
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

/**
 * Draw the premium NOads card frame around a cell.
 * Mimics the neon-blue UI chrome with corner decorations.
 */
function drawAdCard(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cardW: number,
  cardH: number,
  img: HTMLImageElement | null,
  isOwned: boolean,
  price: number,
  now: number,
  cellIndex: number,
) {
  const bx = cx - cardW / 2
  const by = cy - cardH / 2
  const radius = cardW * 0.08

  ctx.save()

  // ── Outer glow ──────────────────────────────────────────────────────────
  const glowPulse = isOwned
    ? 0.55 + 0.15 * Math.sin(now * 1.2 + cellIndex * 0.5)
    : 0.35 + 0.10 * Math.sin(now * 2 + cellIndex * 0.7)
  ctx.shadowColor = isOwned
    ? `rgba(0, 200, 255, ${glowPulse})`
    : `rgba(30, 120, 255, ${glowPulse})`
  ctx.shadowBlur = isOwned ? 18 : 10

  // ── Card background ──────────────────────────────────────────────────────
  roundRect(ctx, bx, by, cardW, cardH, radius)

  if (img && img.complete && img.naturalWidth > 0) {
    // Clip to card shape, draw image
    ctx.clip()
    ctx.drawImage(img, bx, by, cardW, cardH)

    // Dark overlay at bottom for tagline area
    const overlayGrad = ctx.createLinearGradient(bx, by + cardH * 0.6, bx, by + cardH)
    overlayGrad.addColorStop(0, 'rgba(0,0,0,0)')
    overlayGrad.addColorStop(1, 'rgba(0,0,20,0.88)')
    ctx.fillStyle = overlayGrad
    ctx.fillRect(bx, by + cardH * 0.6, cardW, cardH * 0.4)
  } else {
    // Dark placeholder background
    const bg = ctx.createLinearGradient(bx, by, bx, by + cardH)
    bg.addColorStop(0, 'rgba(2, 8, 28, 0.96)')
    bg.addColorStop(1, 'rgba(4, 16, 48, 0.96)')
    ctx.fillStyle = bg
    ctx.fill()
  }

  ctx.restore()
  ctx.save()

  // ── Neon border ──────────────────────────────────────────────────────────
  ctx.shadowColor = isOwned ? 'rgba(0,220,255,0.9)' : 'rgba(30,130,255,0.7)'
  ctx.shadowBlur = isOwned ? 12 : 8
  roundRect(ctx, bx, by, cardW, cardH, radius)
  ctx.strokeStyle = isOwned
    ? `rgba(0, 220, 255, 0.9)`
    : `rgba(40, 140, 255, 0.75)`
  ctx.lineWidth = isOwned ? 1.5 : 1
  ctx.stroke()
  ctx.shadowBlur = 0

  // ── Corner decorations ───────────────────────────────────────────────────
  const pad = cardW * 0.07
  const dotR = cardW * 0.025
  const accentColor = isOwned ? 'rgba(0,220,255,0.9)' : 'rgba(40,160,255,0.85)'
  const dimColor = isOwned ? 'rgba(0,180,220,0.5)' : 'rgba(40,120,220,0.5)'

  // Top-left: filled dot
  ctx.beginPath()
  ctx.arc(bx + pad, by + pad, dotR, 0, Math.PI * 2)
  ctx.fillStyle = accentColor
  ctx.fill()

  // Top-right: 3x3 grid dots
  const gridDotR = dotR * 0.55
  const gridSpacing = gridDotR * 3.2
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      ctx.beginPath()
      ctx.arc(
        bx + cardW - pad - gridSpacing * (2 - col),
        by + pad - gridSpacing + gridSpacing * row,
        gridDotR,
        0,
        Math.PI * 2,
      )
      ctx.fillStyle = col === 2 && row === 0 ? accentColor : dimColor
      ctx.fill()
    }
  }

  // Left side: thin vertical accent line
  const lineX = bx + pad * 0.5
  ctx.beginPath()
  ctx.moveTo(lineX, by + cardH * 0.25)
  ctx.lineTo(lineX, by + cardH * 0.55)
  ctx.strokeStyle = dimColor
  ctx.lineWidth = 1
  ctx.stroke()

  // Right side: thin vertical accent line
  const lineXR = bx + cardW - pad * 0.5
  ctx.beginPath()
  ctx.moveTo(lineXR, by + cardH * 0.35)
  ctx.lineTo(lineXR, by + cardH * 0.65)
  ctx.strokeStyle = dimColor
  ctx.lineWidth = 1
  ctx.stroke()

  // Bottom-left: circle outline
  ctx.beginPath()
  ctx.arc(bx + pad, by + cardH - pad, dotR * 1.4, 0, Math.PI * 2)
  ctx.strokeStyle = dimColor
  ctx.lineWidth = 1
  ctx.stroke()

  // Bottom-left: small horizontal dash after circle
  ctx.beginPath()
  ctx.moveTo(bx + pad + dotR * 2.2, by + cardH - pad)
  ctx.lineTo(bx + pad + dotR * 5.5, by + cardH - pad)
  ctx.strokeStyle = dimColor
  ctx.lineWidth = 1
  ctx.stroke()

  // Bottom-right: 4 vertical bars
  const barW = dotR * 0.8
  const barH = dotR * 3
  const barGap = dotR * 1.5
  for (let b = 0; b < 4; b++) {
    const bBarX = bx + cardW - pad - barGap * (3 - b)
    const alpha = 0.3 + (b / 3) * 0.55
    ctx.fillStyle = isOwned
      ? `rgba(0,220,255,${alpha})`
      : `rgba(40,160,255,${alpha})`
    ctx.fillRect(bBarX, by + cardH - pad - barH / 2, barW, barH)
  }

  // ── Content (no image): placeholder text ─────────────────────────────────
  if (!img || !img.complete || img.naturalWidth === 0) {
    const centerY = by + cardH * 0.47
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // "PLACE YOUR AD" big text
    const bigFont = Math.max(7, cardW * 0.13)
    ctx.font = `900 ${bigFont}px Inter, system-ui, sans-serif`
    ctx.fillStyle = isOwned ? 'rgba(0,220,255,0.25)' : 'rgba(40,160,255,0.2)'
    ctx.fillText('PLACE YOUR', cx, centerY - bigFont * 0.7)
    ctx.fillText('AD HERE', cx, centerY + bigFont * 0.65)
  }

  // ── Bottom tagline text ───────────────────────────────────────────────────
  if (isOwned && (!img || !img.complete)) {
    const tagFont = Math.max(5, cardW * 0.07)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `500 ${tagFont}px Inter, system-ui, sans-serif`
    ctx.letterSpacing = '0.12em'
    ctx.fillStyle = 'rgba(0,200,255,0.55)'
    ctx.fillText('YOUR MESSAGE HERE', cx, by + cardH - pad * 1.8)
    ctx.letterSpacing = '0'
  }

  // ── Price badge (bottom centre, unowned) ──────────────────────────────────
  if (!isOwned) {
    const tier = (price - 100) / 900
    const badgeW = cardW * 0.55
    const badgeH = cardH * 0.14
    const bbx = cx - badgeW / 2
    const bby = by + cardH - badgeH - pad * 1.5

    // Badge bg
    const badgeBg = ctx.createLinearGradient(bbx, bby, bbx, bby + badgeH)
    badgeBg.addColorStop(0, `hsla(${210 + tier * 20}, 90%, 45%, 0.9)`)
    badgeBg.addColorStop(1, `hsla(${210 + tier * 20}, 90%, 28%, 0.9)`)
    roundRect(ctx, bbx, bby, badgeW, badgeH, badgeH * 0.3)
    ctx.fillStyle = badgeBg
    ctx.fill()

    // Badge border
    roundRect(ctx, bbx, bby, badgeW, badgeH, badgeH * 0.3)
    ctx.strokeStyle = 'rgba(80,180,255,0.6)'
    ctx.lineWidth = 0.8
    ctx.stroke()

    // Price text
    const priceFont = Math.max(5, badgeH * 0.52)
    ctx.font = `900 ${priceFont}px Inter, system-ui, sans-serif`
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`₹${price}`, cx, bby + badgeH / 2)
  }

  ctx.restore()
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

        // Skip cells outside visible area (with margin)
        if (cx < -100 || cx > W + 100 || cy < -100 || cy > H + 100) continue

        const price = getPrice(cx, cy, W, H)
        const isOwned = !!ownedCells[cell.index]
        const customImageUrl = ownedCells[cell.index]?.imageUrl

        // Load image into cache
        let img: HTMLImageElement | null = null
        if (customImageUrl) {
          if (!imageCache[customImageUrl]) {
            const el = new Image()
            el.src = customImageUrl
            imageCache[customImageUrl] = el
          }
          img = imageCache[customImageUrl]
        }

        // Scale card size based on price tier & viewport
        const tier = (price - 100) / 900
        const baseW = Math.min(W, H) * 0.065
        const cardW = baseW + tier * baseW * 0.35
        const cardH = cardW * 1.38 // portrait aspect ratio like the reference image

        drawAdCard(ctx, cx, cy, cardW, cardH, img, isOwned, price, now, i)
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
