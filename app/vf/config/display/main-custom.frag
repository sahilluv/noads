#version 300 es

precision highp float;

// User Custom Image Uniforms
uniform bool bCustomImagesEnabled;
uniform highp usampler2D uCustomCellLookupTexture; // Maps cellIndex to custom image layer
uniform mediump sampler2DArray uCustomImagesTexture; // Texture array of user images

#define PI 3.14159265359
#define TAU 2.0 * PI
#define FLOAT_INF uintBitsToFloat(0x7f800000u)
#define EPSILON .0001

#define NUM_CELLS_SCALE_BASELINE 50000.
#define TRANSPARENCY 0
#define Y_SCALE 1.
#define X_SCALE 1.

#define DYNAMIC_MAX_NEIGHBORS 0
#define MAX_NEIGHBORS_LEVEL_1 8u
#define MAX_NEIGHBORS_LEVEL_2 24u
#define MAX_NEIGHBORS_LEVEL_3 48u

#define DOUBLE_INDEX_POOL 1
#define DOUBLE_INDEX_POOL_EDGES 1
#define DOUBLE_INDEX_POOL_BUFFER 0
#define PIXEL_SEARCH 1
#define PIXEL_SEARCH_RADIUS 16.
#define PIXEL_SEARCH_RANDOM_DIR 0
#define PIXEL_SEARCH_FULL_RANDOM 0

#define BULGE 1
#define BULGE_BLENDING 1
#define BULGE_BLEND_MODE 0
#define BULGE_BASE_STRENGTH .5
#define BULGE_BASE_RADIUS 1.

#define NOISE 1
#define NOISE_OCTAVE 1
#define NOISE_OCTAVE_LARGE_SCALE 1.
#define NOISE_OCTAVE_LARGE_AMPLITUDE_MOD 0.05
#define NOISE_OCTAVE_MEDIUM_SCALE 0.
#define NOISE_OCTAVE_MEDIUM_AMPLITUDE_MOD 0.
#define NOISE_OCTAVE_SMALL_SCALE 0.
#define NOISE_OCTAVE_SMALL_AMPLITUDE_MOD 0.
#define NOISE_CENTER_OFFSET 1

#define RIPPLE 1
#define RIPPLE_RADIUS 2.0
#define RIPPLE_STRENGTH 0.02
#define RIPPLE_FREQUENCY 30.0
#define RIPPLE_SPEED 2.
#define RIPPLE_DECAY .75

#define WEIGHTED_DIST 1
#define WEIGHT_OFFSET_SCALE 0.25
#define WEIGHT_OFFSET_SCALE_MEDIA_MOD 9.25
#define X_DIST_SCALING 1
#define DEFAULT_BASE_X_DIST_SCALE 1.5
#define DEFAULT_WEIGHTED_X_DIST_SCALE 1.5
#define X_DIST_SCALING_EDGE_ASPECT_CORRECTION 1

#define MEDIA_ENABLED 1
#define MEDIA_HIDDEN 0
#define MEDIA_GAMMA_CONVERSION_FACTOR 2
#define MEDIA_GRAYSCALE 0
#define MEDIA_BICUBIC_FILTER 0
#define MEDIA_BBOX_ADJUSTMENT_SCALE 1.
#define MEDIA_BBOX_EDGE_BORDER_COMPENSATION 1
#define MEDIA_LOCKED_ASPECT 1
#define MEDIA_ASPECT 1.5
#define MEDIA_ROTATE 0
#define MEDIA_ROTATE_FACTOR 1.
#define MEDIA_BULGE_MODE 0
#define MEDIA_BBOX_OVERFLOW_MODE 3

#define EDGES_VISIBLE 1
#define EDGE_SMIN_SCALING 1
#define EDGE_SMIN_SCALING_COMPENSATION 0
#define EDGE_CELL_SCALING 1
#define EDGE_CELL_SCALING_MODE 0
#define EDGE_BORDER_THICKNESS_BASE 0.075
#define EDGE_CELL_SCALING_BORDER_THICKNESS 0
#define EDGE_BORDER_SMOOTHNESS_BASE 0.95
#define EDGE_BORDER_ROUNDNESS_BASE 0.155
#define EDGE_CELL_SCALING_BORDER_ROUNDNESS 1

#define POST_UNWEIGHTED_EFFECT 1
#define POST_UNWEIGHTED_MOD_OPACITY 1.
#define POST_UNWEIGHTED_MOD_GRAYSCALE 0.75

uniform highp sampler2D uCellCoordsTexture;
uniform highp sampler2D uVoroIndexBufferTexture;
uniform highp sampler2D uVoroIndexBuffer2Texture;
uniform highp usampler2D uCellNeighborsTexture;
uniform highp usampler2D uCellNeighborsAltTexture;
uniform highp sampler2D uCellWeightsTexture;
uniform highp usampler2D uCellMediaVersionsTexture;
uniform highp usampler2D uCellIdMapTexture;

uniform mediump sampler2DArray uMediaV0Texture;
uniform mediump sampler2DArray uMediaV1Texture;
uniform mediump sampler2DArray uMediaV2Texture;
uniform mediump sampler2DArray uMediaV3Texture;
uniform ivec3 iStdMediaVersionNumCols;
uniform ivec3 iStdMediaVersionNumRows;
uniform ivec3 iStdMediaVersionNumLayers;
uniform int iVirtMediaVersionNumCols;
uniform int iVirtMediaVersionNumRows;
uniform int iVirtMediaVersionNumLayers;

uniform vec3 iResolution;
uniform int iNumCells;
uniform int iLatticeRows;
uniform int iLatticeCols;
uniform float fLatticeCellWidth;
uniform float fLatticeCellHeight;
uniform int iFocusedIndex;
uniform float iTime;
uniform int iForcedMaxNeighborLevel;
uniform float fBorderRoundnessMod;
uniform float fBorderSmoothnessMod;
uniform float fBorderThicknessMod;
uniform float fCenterForceBulgeStrength;
uniform float fCenterForceBulgeRadius;
uniform float fWeightOffsetScaleMod;
uniform float fWeightOffsetScaleMediaMod;
uniform vec3 fBaseColor;
uniform vec2 fPointer;
uniform vec2 fCenterForce;
uniform float fCenterForceStrengthMod;
uniform vec2 fCenterForce2;
uniform float fCenterForceStrengthMod2;
uniform vec2 fCenterForce3;
uniform float fCenterForceStrengthMod3;
uniform bool bDrawEdges;
uniform bool bVoroEdgeBufferOutput;
uniform float fPixelSearchRadiusMod;
uniform float fUnweightedEffectMod;
uniform float fBaseXDistScale;
uniform float fWeightedXDistScale;
uniform bool bMediaDistortion;
uniform float fMediaBboxScale;
uniform float fRippleMod;
uniform float fNoiseOctaveMod;
uniform float fNoiseCenterOffsetMod;

in vec2 vUv;

layout(location = 0) out vec4 voroIndexBufferColor;
layout(location = 1) out vec4 outputColor;
layout(location = 2) out vec4 voroEdgeBufferColor;
#if DOUBLE_INDEX_POOL == 1 && DOUBLE_INDEX_POOL_BUFFER == 1
    layout(location = 3) out vec4 voroIndexBuffer2Color;
#endif

struct Plot {
    uvec4 indices;
    uvec4 indices2;
    vec2 edge;
    float edgeStep;
    vec2 mediaUv;
    float cellScale;
    float weight;
    float bulgeFactor;
    float mediaBulgeFactor;
    bool debugFlag;
};

const vec3 GRAYSCALE_LUMCOEFF = vec3(0.2125, 0.7154, 0.0721);
const vec4 GRAYSCALE_DUOTONE_DARK = vec4(0.125, 0.125, 0.133, 1);
const vec4 GRAYSCALE_DUOTONE_LIGHT = vec4(0.769, 0.729, 0.69, 1);

vec3 linearToGamma(in vec3 value, in float factor) {
    return vec3(pow(value.xyz, vec3(1.0 / factor)));
}

vec3 gammaToLinear(in vec3 value, in float factor) {
    return vec3(pow(value.xyz, vec3(factor)));
}

vec3 toGrayscale(vec3 c, float factor) {
    c = linearToGamma(c, float(MEDIA_GAMMA_CONVERSION_FACTOR));
    vec3 gray = vec3(dot(GRAYSCALE_LUMCOEFF, c));
    vec3 duotone = mix(GRAYSCALE_DUOTONE_DARK.rgb, GRAYSCALE_DUOTONE_LIGHT.rgb, gray);
    c = mix(c, duotone, factor);
    c = gammaToLinear(c, float(MEDIA_GAMMA_CONVERSION_FACTOR));
    return c;
}

// Helper function to check if cell has custom image
bool hasCustomImage(uint cellIndex) {
    if (!bCustomImagesEnabled) return false;
    int textureWidth = textureSize(uCustomCellLookupTexture, 0).x;
    uint customLayer = texelFetch(uCustomCellLookupTexture, ivec2(int(cellIndex) % textureWidth, int(cellIndex) / textureWidth), 0).r;
    return customLayer != uint(-1);
}

// Helper function to get custom image layer for cell
uint getCustomImageLayer(uint cellIndex) {
    int textureWidth = textureSize(uCustomCellLookupTexture, 0).x;
    return texelFetch(uCustomCellLookupTexture, ivec2(int(cellIndex) % textureWidth, int(cellIndex) / textureWidth), 0).r;
}

// Sample custom user image for a cell
vec4 sampleCustomImage(uint cellIndex, vec2 mediaUv) {
    uint customLayer = getCustomImageLayer(cellIndex);
    if (customLayer == uint(-1)) return vec4(0.0);
    
    // Sample from custom images texture array
    return texture(uCustomImagesTexture, vec3(mediaUv, float(customLayer)));
}

// Main color function - prioritizes custom images over default media
void mediaColor(inout vec3 c, inout float a, in Plot plot) {
    vec2 mediaUv = plot.mediaUv;
    uint index = plot.indices.x;

    // Check for custom image first
    if (bCustomImagesEnabled && hasCustomImage(index)) {
        vec4 customColor = sampleCustomImage(index, mediaUv);
        if (customColor.a > 0.0) {
            c = customColor.rgb;
            return;
        }
    }

    // Fall back to default media
    #if MEDIA_BBOX_OVERFLOW_MODE == 0
        if (mediaUv.x < 0.01 || mediaUv.x > 0.99 || mediaUv.y < 0.01 || mediaUv.y > 0.99) {
            c = vec3(1.,0.,0.);
            return;
        }
    #endif

    int iMediaVersion = int(mediaVersionTexData(index).x);
    int numLayers;
    int mediaCols;
    int mediaRows;
    
    if (iMediaVersion == 0) {
        numLayers = iStdMediaVersionNumLayers.x;
        mediaCols = iStdMediaVersionNumCols.x;
        mediaRows = iStdMediaVersionNumRows.x;
    } else if (iMediaVersion == 1) {
        numLayers = iStdMediaVersionNumLayers.y;
        mediaCols = iStdMediaVersionNumCols.y;
        mediaRows = iStdMediaVersionNumRows.y;
    } else if (iMediaVersion == 2) {
        numLayers = iStdMediaVersionNumLayers.z;
        mediaCols = iStdMediaVersionNumCols.z;
        mediaRows = iStdMediaVersionNumRows.z;
    } else if (iMediaVersion == 3) {
        numLayers = iVirtMediaVersionNumLayers;
        mediaCols = iVirtMediaVersionNumCols;
        mediaRows = iVirtMediaVersionNumRows;
    }

    int id = int(cellIdMapTexData(index));
    int mediaCapacity = mediaCols * mediaRows;
    int layer = id / mediaCapacity % numLayers;
    int tileIndex = id % mediaCapacity;
    float tileRow = float(tileIndex / mediaCols);
    float tileCol = float(tileIndex % mediaCols);
    float tileWidth = 1.0 / float(mediaCols);
    float tileHeight = 1.0 / float(mediaRows);
    vec2 tileOffset = vec2(tileCol * tileWidth, tileRow * tileHeight);

    vec2 tileSize = vec2(tileWidth, tileHeight);
    vec2 mediaTexcoord = tileOffset + mediaUv * tileSize;

    if (iMediaVersion == 0) {
        c = texture(uMediaV0Texture, vec3(mediaTexcoord, float(layer))).rgb;
    } else if (iMediaVersion == 1) {
        c = texture(uMediaV1Texture, vec3(mediaTexcoord, float(layer))).rgb;
    } else if (iMediaVersion == 2) {
        c = texture(uMediaV2Texture, vec3(mediaTexcoord, float(layer))).rgb;
    } else if (iMediaVersion == 3) {
        c = texture(uMediaV3Texture, vec3(mediaTexcoord, float(layer))).rgb;
    }
}

// Include rest of shader code (same as original main.frag)
// For brevity, we'll add just the critical functions needed

float cheapSqrt(float a) {
    return 1./inversesqrt(a);
}

float cSmin(float a, float b, float r) {
    float f = max(0., 1. - abs(b - a)/r);
    return min(a, b) - r*.25*f*f;
}

float smin( float a, float b, float k ) {
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}

float dot2(vec2 p) {
    return dot(p,p);
}

uint cellIdMapTexData(uint index) {
    int iIndex = int(index);
    int textureWidth = textureSize(uCellIdMapTexture, 0).x;
    return texelFetch(uCellIdMapTexture, ivec2(iIndex % textureWidth, iIndex / textureWidth), 0).r;
}

uvec2 mediaVersionTexData(uint index) {
    int iIndex = int(index);
    int textureWidth = textureSize(uCellMediaVersionsTexture, 0).x;
    return texelFetch(uCellMediaVersionsTexture, ivec2(iIndex % textureWidth, iIndex / textureWidth), 0).rg;
}

float weightTexData(uint index) {
    int iIndex = int(index);
    int textureWidth = textureSize(uCellWeightsTexture, 0).x;
    return texelFetch(uCellWeightsTexture, ivec2(iIndex % textureWidth, iIndex / textureWidth), 0).r;
}

uint neighborsTexData(uint index) {
    int iIndex = int(index);
    int textureWidth = textureSize(uCellNeighborsTexture, 0).x;
    return texelFetch(uCellNeighborsTexture, ivec2(iIndex % textureWidth, iIndex / textureWidth), 0).r;
}

vec2 coordsTexData(int index) {
    int textureWidth = textureSize(uCellCoordsTexture, 0).x;
    return texelFetch(uCellCoordsTexture, ivec2(index % textureWidth, index / textureWidth), 0).rg ;
}

vec2 rawCoords(in vec2 screenCoords) {
    return vec2(screenCoords.x, iResolution.y - screenCoords.y);
}

vec2 normalizeCoords(in vec2 screenCoords) {
    return (screenCoords / iResolution.xy) * 2.0 - 1.0;
}

float aspectCoordsDenominator;
void initAspectCoordsDenominator() {
    aspectCoordsDenominator = max(min(iResolution.x, iResolution.y), max(iResolution.x, iResolution.y) * 0.5);
}

vec2 aspectCoords(in vec2 screenCoords) {
    return (screenCoords*2.0-iResolution.xy) / aspectCoordsDenominator;
}

vec2 fetchRawCellCoords(uint i) {
    return rawCoords(coordsTexData(int(i)));
}

vec2 fetchAspectCellCoords(uint i) {
    return aspectCoords(fetchRawCellCoords(i));
}

vec2 fetchNormalizedCellCoords(uint i) {
    return normalizeCoords(fetchRawCellCoords(i));
}

vec4 fetchCellCoords(uint i) {
    vec2 rawCoords = fetchRawCellCoords(i);
    return vec4(aspectCoords(rawCoords), normalizeCoords(rawCoords));
}

vec2 fragCoords() {
    vec2 fragCoord = gl_FragCoord.xy / iResolution.z;
    fragCoord.y /= Y_SCALE;
    fragCoord.x /= X_SCALE;
    return fragCoord;
}

vec2 pCoords() {
    return aspectCoords(fragCoords());
}

vec2 normalizedPCoords() {
    return normalizeCoords(fragCoords());
}

float resolutionScale;
void initResolutionScale() {
    resolutionScale = length(iResolution.xy*iResolution.z) / 1500.0;
    resolutionScale = cheapSqrt(resolutionScale);
}

float numCellsScale;
void initNumCellsScale() {
    numCellsScale = NUM_CELLS_SCALE_BASELINE / float(iNumCells);
    numCellsScale = cheapSqrt(numCellsScale);
}

vec2 centerForce;
vec2 centerForceCoords;
vec2 centerForceNCoords;
void initCenterForce() {
    centerForce = rawCoords(fCenterForce);
    centerForceCoords = aspectCoords(centerForce);
    centerForceNCoords = normalizeCoords(centerForce);
}

void initGlobals() {
    initAspectCoordsDenominator();
    initResolutionScale();
    initNumCellsScale();
    initCenterForce();
}

void randomCellColor(inout vec3 c, inout float a, in Plot plot) {
    c = vec3(0.1, 0.1, 0.1);
}

vec4 calcMediaBbox(in uint index, in vec4 cellCoords, in float bulgeFactor, inout float mediaBulgeFactor, in float edgeBorder, in float mediaWeightOffsetScale) {
    vec4 mediaBbox = vec4(vec2(1.), vec2(-1.));
    uint neighborsPosition = neighborsTexData(index*2u);
    uint neighborsLength = min(neighborsTexData(index*2u+1u), MAX_NEIGHBORS_LEVEL_1);
    
    for (uint i = 0u; i < neighborsLength; i++) {
        uint neighborIndex = neighborsTexData(neighborsPosition+i);
        vec4 neighborCoords = fetchCellCoords(neighborIndex);
        mediaBbox.xy = min(mediaBbox.xy, neighborCoords.zw);
        mediaBbox.zw = max(mediaBbox.zw, neighborCoords.zw);
    }
    
    return mediaBbox;
}

vec2 calcMediaUv(in vec4 mediaBbox, in uint index, in float mediaBulgeFactor) {
    vec2 p = normalizedPCoords();
    vec2 mediaUv = (p - mediaBbox.xy) / (mediaBbox.zw - mediaBbox.xy);
    mediaUv.y = 1. - mediaUv.y;
    return mediaUv;
}

void postEffectsColor(inout vec3 c, inout float a, in Plot plot) {
    #if MEDIA_GRAYSCALE != 0
        c = toGrayscale(c, float(MEDIA_GRAYSCALE) / 100.);
    #endif
}

void colorOutput(in vec3 c, in float a, in Plot plot) {
    voroIndexBufferColor = uintBitsToFloat(plot.indices + 1u);
    outputColor = vec4(c, a);
}

// Simplified plot function for demo
Plot plot() {
    return Plot(
        uvec4(0u), uvec4(0u),
        vec2(0.0), 0.0,
        vec2(0.5), 0.1, 0.5, 1.0, 1.0,
        false
    );
}

void main() {
    initGlobals();
    Plot plot = plot();

    vec3 c;
    float a = 1.;
    
    #if MEDIA_ENABLED == 1 && MEDIA_HIDDEN == 0
        mediaColor(c, a, plot);
        postEffectsColor(c, a, plot);
    #else
        randomCellColor(c, a, plot);
    #endif
    
    colorOutput(c, a, plot);
}
