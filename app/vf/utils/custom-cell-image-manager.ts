/**
 * Manages custom user-uploaded images for cells
 * Converts data URLs to WebGL textures and provides efficient lookup
 */

export class CustomCellImageManager {
  constructor() {
    this.images = new Map() // cellIndex -> { dataUrl, texture, isLoading }
    this.textureCache = new Map() // dataUrl -> texture
  }

  /**
   * Store a custom image for a cell
   * @param {number} cellIndex - The cell to update
   * @param {string} dataUrl - Base64 data URL of the image
   * @param {WebGLRenderingContext} gl - WebGL context
   */
  setCustomImage(cellIndex, dataUrl, gl) {
    if (!gl) return

    this.images.set(cellIndex, {
      dataUrl,
      texture: null,
      isLoading: true,
    })

    // Load image asynchronously
    this.loadImageToTexture(cellIndex, dataUrl, gl)
  }

  /**
   * Load an image data URL into a WebGL texture
   */
  private loadImageToTexture(cellIndex, dataUrl, gl) {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      const texture = this.createTexture(gl, img)
      const entry = this.images.get(cellIndex)
      if (entry) {
        entry.texture = texture
        entry.isLoading = false
      }
      this.textureCache.set(dataUrl, texture)
    }

    img.onerror = () => {
      console.error(`Failed to load image for cell ${cellIndex}`)
      const entry = this.images.get(cellIndex)
      if (entry) {
        entry.isLoading = false
      }
    }

    img.src = dataUrl
  }

  /**
   * Create a WebGL texture from an image element
   */
  private createTexture(gl, img) {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    
    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    
    // Upload image data
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      img
    )

    gl.bindTexture(gl.TEXTURE_2D, null)
    return texture
  }

  /**
   * Get custom image data for a cell
   */
  getCustomImage(cellIndex) {
    return this.images.get(cellIndex)
  }

  /**
   * Check if a cell has a custom image
   */
  hasCustomImage(cellIndex) {
    const entry = this.images.get(cellIndex)
    return entry && entry.texture && !entry.isLoading
  }

  /**
   * Get all cells with custom images
   */
  getCustomImageCellIndices() {
    return Array.from(this.images.entries())
      .filter(([_, entry]) => entry.texture && !entry.isLoading)
      .map(([cellIndex]) => cellIndex)
  }

  /**
   * Remove a custom image for a cell
   */
  removeCustomImage(cellIndex) {
    const entry = this.images.get(cellIndex)
    if (entry?.texture) {
      // Note: In real WebGL code, you'd need gl reference to delete texture
      // gl.deleteTexture(entry.texture)
    }
    this.images.delete(cellIndex)
  }

  /**
   * Clear all custom images
   */
  clear() {
    this.images.clear()
    this.textureCache.clear()
  }
}

export default CustomCellImageManager
