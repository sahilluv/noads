export const GRID_CENTER = { x: 0, y: 0 }
export const MAX_CENTER_PRICE = 1000 // ₹1,000 at (0,0)
export const MIN_OUTER_PRICE = 100   // ₹100 floor
export const DECAY_RATE = 0.0012     // Adjust to tweak price drop speed

/**
 * Calculates dynamic price based on Euclidean distance from center (0,0)
 */
export function calculateCellPrice(x: number, y: number): number {
  const distance = Math.hypot(x - GRID_CENTER.x, y - GRID_CENTER.y)
  
  // Exponential decay calculation
  const rawPrice = MAX_CENTER_PRICE * Math.exp(-DECAY_RATE * distance)
  
  // Clamp between min and max, then round to nearest 10
  const clampedPrice = Math.max(MIN_OUTER_PRICE, Math.min(MAX_CENTER_PRICE, rawPrice))
  return Math.round(clampedPrice / 10) * 10
}

/**
 * Normalizes proximity to a 0.0 - 1.0 factor for GLSL shader uniforms
 * 1.0 = Dead Center, 0.0 = Far Periphery
 */
export function calculateProximityFactor(x: number, y: number, maxRadius: number = 2000): number {
  const distance = Math.hypot(x - GRID_CENTER.x, y - GRID_CENTER.y)
  return Math.max(0.0, 1.0 - distance / maxRadius)
}
