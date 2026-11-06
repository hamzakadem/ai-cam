const MAX_IMAGE_BYTES = 25 * 1024 * 1024
const MAX_IMAGE_EDGE = 2048

export async function normalizeImageFile(file) {
  if (!file?.type?.startsWith('image/')) throw new Error('Choose a valid image file.')
  if (file.size > MAX_IMAGE_BYTES) throw new Error('That photo is larger than 25 MB. Choose a smaller image.')

  const objectUrl = URL.createObjectURL(file)
  try {
    const image = await loadImage(objectUrl)
    return renderImage(image, image.naturalWidth || image.width, image.naturalHeight || image.height)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export function captureVideoFrame(video, mirror = false) {
  if (!video?.videoWidth || !video?.videoHeight) throw new Error('The camera is still warming up. Try again in a moment.')

  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(video.videoWidth, video.videoHeight))
  const width = Math.round(video.videoWidth * scale)
  const height = Math.round(video.videoHeight * scale)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { alpha: false })

  canvas.width = width
  canvas.height = height
  if (mirror) {
    context.translate(width, 0)
    context.scale(-1, 1)
  }
  context.drawImage(video, 0, 0, width, height)

  return canvas.toDataURL('image/jpeg', 0.92)
}

function renderImage(image, sourceWidth, sourceHeight) {
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(sourceWidth, sourceHeight))
  const width = Math.round(sourceWidth * scale)
  const height = Math.round(sourceHeight * scale)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { alpha: false })

  canvas.width = width
  canvas.height = height
  context.fillStyle = '#000'
  context.fillRect(0, 0, width, height)
  context.drawImage(image, 0, 0, width, height)

  return canvas.toDataURL('image/jpeg', 0.92)
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('The selected image could not be opened.'))
    image.src = url
  })
}

export async function imageSourceToBlob(source) {
  if (source.startsWith('data:')) {
    const [header, base64] = source.split(',')
    const mime = header.match(/data:(.*?);/)?.[1] || 'image/png'
    const bytes = atob(base64)
    const array = new Uint8Array(bytes.length)
    for (let index = 0; index < bytes.length; index += 1) array[index] = bytes.charCodeAt(index)
    return new Blob([array], { type: mime })
  }

  const response = await fetch(source)
  if (!response.ok) throw new Error('The enhanced image could not be downloaded.')
  return response.blob()
}

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.onerror = () => reject(new Error('The image could not be prepared for native storage.'))
    reader.readAsDataURL(blob)
  })
}
