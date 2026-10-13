// Browser side of detect.js: the certificate's pixels, scaled down to 360 px wide (plenty to find
// photos and text lines, and fast on a phone).
export function readPixels(img, w = 360) {
  const W = img.naturalWidth || img.width, H = img.naturalHeight || img.height
  const h = Math.max(1, Math.round(H * w / W))
  const c = document.createElement('canvas'); c.width = w; c.height = h
  const x = c.getContext('2d', { willReadFrequently: true })
  x.drawImage(img, 0, 0, w, h)
  return x.getImageData(0, 0, w, h)
}
