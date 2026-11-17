/* ========================================
   TRIM PRODUCT PHOTOS
   Product photos come with very different amounts of empty space
   around the item (white or transparent). This crops that space
   away in the browser so every product fills its frame the same way.

   - Works on Strapi /uploads and Cloudinary images (both send CORS headers).
   - Results are cached per URL for the whole visit.
   - On any failure the original URL is returned unchanged.
========================================= */

const cache = new Map<string, Promise<string>>()

// Longest side of the canvas used to find the item's edges (speed over precision)
const SCAN_SIZE = 320
// Longest side of the cropped image we hand back to <img>
const OUTPUT_MAX = 900
// A pixel counts as "background" if it is nearly white or nearly transparent
const WHITE_LEVEL = 244
const ALPHA_LEVEL = 16
// Breathing room kept around the item, as a share of its size
const MARGIN = 0.03

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Could not load ${url}`))
    img.src = url
  })
}

async function trim(url: string): Promise<string> {
  const img = await loadImage(url)
  const width = img.naturalWidth
  const height = img.naturalHeight
  if (!width || !height) return url

  // 1. Draw a small copy and find the bounding box of the non-background pixels
  const scale = Math.min(1, SCAN_SIZE / Math.max(width, height))
  const sw = Math.max(1, Math.round(width * scale))
  const sh = Math.max(1, Math.round(height * scale))
  const scan = document.createElement('canvas')
  scan.width = sw
  scan.height = sh
  const scanCtx = scan.getContext('2d', { willReadFrequently: true })
  if (!scanCtx) return url
  scanCtx.drawImage(img, 0, 0, sw, sh)
  const { data } = scanCtx.getImageData(0, 0, sw, sh) // throws if the image is not CORS-readable

  let top = sh
  let left = sw
  let right = -1
  let bottom = -1
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const i = (y * sw + x) * 4
      const isBackground =
        data[i + 3] < ALPHA_LEVEL ||
        (data[i] >= WHITE_LEVEL && data[i + 1] >= WHITE_LEVEL && data[i + 2] >= WHITE_LEVEL)
      if (isBackground) continue
      if (x < left) left = x
      if (x > right) right = x
      if (y < top) top = y
      if (y > bottom) bottom = y
    }
  }
  if (right < 0) return url // blank image

  // 2. Map the box back to full size and add a little margin
  const boxW = (right - left + 1) / scale
  const boxH = (bottom - top + 1) / scale
  const pad = Math.max(boxW, boxH) * MARGIN
  const cropX = Math.max(0, left / scale - pad)
  const cropY = Math.max(0, top / scale - pad)
  const cropW = Math.min(width - cropX, boxW + pad * 2)
  const cropH = Math.min(height - cropY, boxH + pad * 2)

  // Already tight: keep the original file
  if (cropW > width * 0.97 && cropH > height * 0.97) return url

  // 3. Draw the cropped area into a new image
  const outScale = Math.min(1, OUTPUT_MAX / Math.max(cropW, cropH))
  const out = document.createElement('canvas')
  out.width = Math.round(cropW * outScale)
  out.height = Math.round(cropH * outScale)
  const outCtx = out.getContext('2d')
  if (!outCtx) return url
  outCtx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, out.width, out.height)

  const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, 'image/png'))
  return blob ? URL.createObjectURL(blob) : url
}

export function trimImage(url: string): Promise<string> {
  if (!url || typeof document === 'undefined') return Promise.resolve(url)
  let pending = cache.get(url)
  if (!pending) {
    pending = trim(url).catch(() => url)
    cache.set(url, pending)
  }
  return pending
}
