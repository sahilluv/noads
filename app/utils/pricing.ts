export function getPrice(
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
