import { Texture } from 'ogl'
import BaseScene from './base-scene'
import swap from './utils/swap'
import CustomCellImageManager from '../../utils/custom-cell-image-manager'

export default class Scene extends BaseScene {
  initCustom() {
    // Initialize custom image manager
    this.customImageManager = new CustomCellImageManager()
    
    this.initCustomDataTextures()
    this.initCustomImageTextures()

    this.mainRenderTargets = this.initRenderTargets(2, {
      attachments: [
        {
          name: 'voroIndexBuffer',
          textureOptions: {
            format: this.gl.RGBA,
            internalFormat: this.gl.RGBA32F,
            type: this.gl.FLOAT,
            minFilter: this.gl.NEAREST,
          },
        },
        {
          name: 'output',
        },
        ...(this.config.post?.enabled
          ? [
              {
                name: 'voroEdgeBuffer',
                textureOptions: {
                  format: this.gl.RGBA,
                  internalFormat: this.gl.RGBA32F,
                  type: this.gl.FLOAT,
                },
              },
            ]
          : []),
      ],
    })
    this.activeMainRenderTarget = this.mainRenderTargets[0]
    this.inactiveMainRenderTarget = this.mainRenderTargets[1]

    if (this.config.post?.enabled && this.config.post.voroIndexBuffer) {
      this.postRenderTargets = this.initRenderTargets(1, {
        attachments: [
          {
            name: 'output',
          },
          {
            name: 'voroIndexBuffer',
            textureOptions: {
              format: this.gl.RGBA,
              internalFormat: this.gl.RGBA32F,
              type: this.gl.FLOAT,
              minFilter: this.gl.NEAREST,
            },
          },
        ],
      })
      this.activePostRenderTarget = this.postRenderTargets[0]
      this.inactivePostRenderTarget = this.postRenderTargets[0]
    }
  }

  /**
   * Initialize textures for custom cell images
   * Creates:
   * 1. uCustomCellLookupTexture - Maps cellIndex to custom image layer (uint)
   * 2. uCustomImagesTexture - Texture array of custom user images (sampler2DArray)
   */
  initCustomImageTextures() {
    // Maximum number of custom images we can store
    const MAX_CUSTOM_IMAGES = 256
    const IMAGE_SIZE = 512

    // Create lookup texture: cellIndex -> custom image layer
    // Each cell can have a value from 0-255 (layer index) or -1 (no custom image)
    const lookupData = new Uint32Array(this.store.get('sharedCellIdsTextureWidth') * this.store.get('sharedCellIdsTextureHeight'))
    lookupData.fill(0xFFFFFFFF) // Initialize all to -1 (no custom image)

    this.customCellLookupTexture = new Texture(this.gl, {
      width: this.store.get('sharedCellIdsTextureWidth'),
      height: this.store.get('sharedCellIdsTextureHeight'),
      image: lookupData,
      format: this.gl.RED_INTEGER,
      internalFormat: this.gl.R32UI,
      type: this.gl.UNSIGNED_INT,
      wrapS: this.gl.CLAMP_TO_EDGE,
      wrapT: this.gl.CLAMP_TO_EDGE,
      minFilter: this.gl.NEAREST,
      magFilter: this.gl.NEAREST,
      generateMipmaps: false,
      flipY: false,
    })

    // Create texture array for custom images
    // Start with empty texture array that can be updated dynamically
    this.customImagesTexture = new Texture(this.gl, {
      width: IMAGE_SIZE,
      height: IMAGE_SIZE,
      depth: MAX_CUSTOM_IMAGES,
      format: this.gl.RGBA,
      internalFormat: this.gl.RGBA8,
      type: this.gl.UNSIGNED_BYTE,
      wrapS: this.gl.CLAMP_TO_EDGE,
      wrapT: this.gl.CLAMP_TO_EDGE,
      minFilter: this.gl.LINEAR,
      magFilter: this.gl.LINEAR,
      generateMipmaps: false,
      flipY: true,
    })

    // Initialize with transparent pixels
    const emptyData = new Uint8Array(IMAGE_SIZE * IMAGE_SIZE * 4 * MAX_CUSTOM_IMAGES)
    this.gl.bindTexture(this.gl.TEXTURE_2D_ARRAY, this.customImagesTexture.texture)
    this.gl.texImage3D(
      this.gl.TEXTURE_2D_ARRAY,
      0,
      this.gl.RGBA8,
      IMAGE_SIZE,
      IMAGE_SIZE,
      MAX_CUSTOM_IMAGES,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      emptyData
    )
    this.gl.bindTexture(this.gl.TEXTURE_2D_ARRAY, null)
  }

  /**
   * Update a cell with a custom image
   * @param {number} cellIndex - The cell to update
   * @param {string} dataUrl - Base64 data URL of the image
   */
  updateCustomCellImage(cellIndex, dataUrl) {
    if (!this.customImageManager) return

    // Store the image in manager
    this.customImageManager.setCustomImage(cellIndex, dataUrl, this.gl)

    // Update lookup texture to point to a layer
    // For now, we'll use a simple mapping: cellIndex % MAX_CUSTOM_IMAGES
    const layerIndex = this.getOrAllocateCustomImageLayer(cellIndex)
    this.updateCustomLookupTexture(cellIndex, layerIndex)

    // Upload image to texture array
    this.uploadCustomImageToTextureArray(cellIndex, layerIndex, dataUrl)
  }

  /**
   * Get or allocate a layer for a custom image
   */
  private getOrAllocateCustomImageLayer(cellIndex) {
    // Simple allocation: use cellIndex mod MAX_LAYERS
    // In production, you'd want a more sophisticated pool allocator
    return cellIndex % 256
  }

  /**
   * Update the lookup texture to map a cell to its custom image layer
   */
  private updateCustomLookupTexture(cellIndex, layerIndex) {
    const textureWidth = this.store.get('sharedCellIdsTextureWidth')
    const lookupX = cellIndex % textureWidth
    const lookupY = Math.floor(cellIndex / textureWidth)

    // Update the lookup texture
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.customCellLookupTexture.texture)
    this.gl.texSubImage2D(
      this.gl.TEXTURE_2D,
      0,
      lookupX,
      lookupY,
      1,
      1,
      this.gl.RED_INTEGER,
      this.gl.UNSIGNED_INT,
      new Uint32Array([layerIndex])
    )
    this.gl.bindTexture(this.gl.TEXTURE_2D, null)

    this.customCellLookupTexture.needsUpdate = true
  }

  /**
   * Upload a custom image to the texture array
   */
  private uploadCustomImageToTextureArray(cellIndex, layerIndex, dataUrl) {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 512
      const ctx = canvas.getContext('2d')

      // Draw image to canvas with proper scaling
      const aspect = img.width / img.height
      let drawWidth = canvas.width
      let drawHeight = canvas.height
      let offsetX = 0
      let offsetY = 0

      if (aspect > 1) {
        drawHeight = canvas.width / aspect
        offsetY = (canvas.height - drawHeight) / 2
      } else {
        drawWidth = canvas.height * aspect
        offsetX = (canvas.width - drawWidth) / 2
      }

      ctx.fillStyle = 'transparent'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      // Upload to texture array
      this.gl.bindTexture(this.gl.TEXTURE_2D_ARRAY, this.customImagesTexture.texture)
      this.gl.texSubImage3D(
        this.gl.TEXTURE_2D_ARRAY,
        0,
        0,
        0,
        layerIndex,
        512,
        512,
        1,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        imageData.data
      )
      this.gl.bindTexture(this.gl.TEXTURE_2D_ARRAY, null)

      this.customImagesTexture.needsUpdate = true
    }

    img.src = dataUrl
  }

  initCustomDataTextures() {
    this.initCellCoordsTexture()
    this.initCellNeighborsTexture()
    this.initCellWeightsTexture()
    this.initCellMediaVersionsTexture()
    this.initCellIdsTexture()
  }

  beforeUpdateCustom() {
    this.cellCoordsTexture.needsUpdate = true
    this.cellWeightsTexture.needsUpdate = true
    this.cellMediaVersionsTexture.needsUpdate = true
  }

  afterUpdateCustom() {
    if (!this.config.main?.enabled) return

    this.swapMainRenderTargets()

    this.mainCustomUniforms.uVoroIndexBufferTexture.value =
      this.inactiveMainRenderTarget.voroIndexBuffer.texture

    if (this.config.post?.enabled) {
      this.postCustomUniforms.uMainOutputTexture.value =
        this.inactiveMainRenderTarget.output.texture

      this.postCustomUniforms.uVoroEdgeBufferTexture.value =
        this.inactiveMainRenderTarget.voroEdgeBuffer.texture

      if (this.config.post.voroIndexBuffer) {
        this.postCustomUniforms.uVoroIndexBufferTexture.value =
          this.inactiveMainRenderTarget.voroIndexBuffer.texture
      }
    }
  }

  swapMainRenderTargets() {
    swap(this.mainRenderTargets)
    this.activeMainRenderTarget = this.mainRenderTargets[0]
    this.inactiveMainRenderTarget = this.mainRenderTargets[1]
  }

  refreshCustom() {
    this.cellNeighborsTexture.needsUpdate = true
  }

  initMainCustomUniforms() {
    this.mainCustomUniforms = {
      uCellCoordsTexture: {
        value: this.cellCoordsTexture,
      },
      uCellNeighborsTexture: {
        value: this.cellNeighborsTexture,
      },
      uCellWeightsTexture: {
        value: this.cellWeightsTexture,
      },
      uCellMediaVersionsTexture: {
        value: this.cellMediaVersionsTexture,
      },
      uCellIdMapTexture: {
        value: this.cellIdsTexture,
      },
      uVoroIndexBufferTexture: {
        value: this.inactiveMainRenderTarget.voroIndexBuffer.texture,
      },
      // Custom image uniforms
      bCustomImagesEnabled: {
        value: true,
      },
      uCustomCellLookupTexture: {
        value: this.customCellLookupTexture,
      },
      uCustomImagesTexture: {
        value: this.customImagesTexture,
      },
    }
    return {
      ...this.initCustomUniforms(),
      ...this.mainCustomUniforms,
    }
  }

  initPostCustomUniforms() {
    this.postCustomUniforms = {
      uVoroEdgeBufferTexture: {
        value: this.inactiveMainRenderTarget.voroEdgeBuffer.texture,
      },
      uMainOutputTexture: {
        value: this.inactiveMainRenderTarget.output.texture,
      },
      ...(this.config.post.voroIndexBuffer
        ? {
            uVoroIndexBufferTexture: {
              value: this.inactiveMainRenderTarget.voroIndexBuffer.texture,
            },
          }
        : {}),
    }
    return {
      ...this.initCustomUniforms(),
      ...this.postCustomUniforms,
    }
  }

  initCustomUniforms() {
    this.customUniforms = {}
    return this.customUniforms
  }

  getPositionRenderTarget() {
    if (this.config.post?.enabled && this.config.post.voroIndexBuffer) {
      return this.inactivePostRenderTarget
    }

    return this.inactiveMainRenderTarget
  }

  initCellNeighborsTexture() {
    this.cellNeighborsTexture = new Texture(this.gl, {
      width: this.store.get('sharedCellNeighborsTextureWidth'),
      height: this.store.get('sharedCellNeighborsTextureHeight'),
      image: this.store.get('sharedCellNeighbors'),
      format: this.gl.RED_INTEGER,
      internalFormat: this.gl.R32UI,
      type: this.gl.UNSIGNED_INT,
      wrapS: this.gl.CLAMP_TO_EDGE,
      wrapT: this.gl.CLAMP_TO_EDGE,
      minFilter: this.gl.NEAREST,
      magFilter: this.gl.NEAREST,
      generateMipmaps: false,
      flipY: false,
    })
  }

  initCellWeightsTexture() {
    this.cellWeightsTexture = new Texture(this.gl, {
      width: this.store.get('sharedCellWeightsTextureWidth'),
      height: this.store.get('sharedCellWeightsTextureHeight'),
      image: this.store.get('sharedCellWeights'),
      format: this.gl.RED,
      internalFormat: this.gl.R32F,
      type: this.gl.FLOAT,
      wrapS: this.gl.CLAMP_TO_EDGE,
      wrapT: this.gl.CLAMP_TO_EDGE,
      minFilter: this.gl.NEAREST,
      magFilter: this.gl.NEAREST,
      generateMipmaps: false,
      flipY: false,
    })
  }

  initCellMediaVersionsTexture() {
    this.cellMediaVersionsTexture = new Texture(this.gl, {
      width: this.store.get('sharedCellMediaVersionsTextureWidth'),
      height: this.store.get('sharedCellMediaVersionsTextureHeight'),
      image: this.store.get('sharedCellMediaVersions'),
      format: this.gl.RG_INTEGER,
      internalFormat: this.gl.RG16UI,
      type: this.gl.UNSIGNED_SHORT,
      wrapS: this.gl.CLAMP_TO_EDGE,
      wrapT: this.gl.CLAMP_TO_EDGE,
      minFilter: this.gl.NEAREST,
      magFilter: this.gl.NEAREST,
      generateMipmaps: false,
      flipY: false,
    })
  }

  initCellIdsTexture() {
    this.cellIdsTexture = new Texture(this.gl, {
      width: this.store.get('sharedCellIdsTextureWidth'),
      height: this.store.get('sharedCellIdsTextureHeight'),
      image: this.store.get('sharedCellIds'),
      format: this.gl.RED_INTEGER,
      internalFormat: this.gl.R32UI,
      type: this.gl.UNSIGNED_INT,
      wrapS: this.gl.CLAMP_TO_EDGE,
      wrapT: this.gl.CLAMP_TO_EDGE,
      minFilter: this.gl.NEAREST,
      magFilter: this.gl.NEAREST,
      generateMipmaps: false,
      flipY: false,
    })
  }

  initCellCoordsTexture() {
    this.cellCoordsTexture = new Texture(this.gl, {
      width: this.store.get('sharedCellCoordsTextureWidth'),
      height: this.store.get('sharedCellCoordsTextureHeight'),
      image: this.store.get('sharedCellCoords'),
      format: this.gl.RG,
      internalFormat: this.gl.RG32F,
      type: this.gl.FLOAT,
      wrapS: this.gl.CLAMP_TO_EDGE,
      wrapT: this.gl.CLAMP_TO_EDGE,
      minFilter: this.gl.NEAREST,
      magFilter: this.gl.NEAREST,
      generateMipmaps: false,
      flipY: false,
    })
  }
}
