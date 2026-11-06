const REQUEST_TIMEOUT_MS = 120_000
const MODEL_REQUEST_TIMEOUT_MS = 20_000

export class AgentRouterError extends Error {
  constructor(message, code = 'API_ERROR', status = 0) {
    super(message)
    this.name = 'AgentRouterError'
    this.code = code
    this.status = status
  }
}

export async function enhanceImage({ image, prompt, apiKey, baseUrl, model, signal }) {
  const endpoint = `${baseUrl.replace(/\/+$/, '')}/responses`
  const controller = new AbortController()
  const abortFromCaller = () => controller.abort(signal?.reason)
  signal?.addEventListener('abort', abortFromCaller, { once: true })
  const timeout = window.setTimeout(() => controller.abort('timeout'), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        store: false,
        input: [
          {
            role: 'user',
            content: [
              { type: 'input_text', text: prompt },
              { type: 'input_image', image_url: image, detail: 'high' },
            ],
          },
        ],
        tools: [{ type: 'image_generation' }],
        tool_choice: { type: 'image_generation' },
      }),
      signal: controller.signal,
    })

    const payload = await readResponsePayload(response)
    if (!response.ok) throw createHttpError(response.status, payload)

    const outputImage = extractImage(payload)
    if (!outputImage) {
      throw new AgentRouterError(
        'The model completed the request but did not return an image. Select a route that supports the Responses API image_generation tool.',
        'NO_IMAGE_OUTPUT',
        response.status,
      )
    }

    return outputImage
  } catch (error) {
    if (controller.signal.aborted) {
      if (signal?.aborted) throw new DOMException('Enhancement cancelled.', 'AbortError')
      throw new AgentRouterError('Agent Router took too long to respond. Try again or use a smaller image.', 'TIMEOUT')
    }
    if (error instanceof AgentRouterError) throw error
    if (error instanceof TypeError) {
      throw new AgentRouterError(
        'Could not reach Agent Router. Check the Base URL, your connection, and whether the endpoint allows browser CORS requests.',
        'NETWORK_ERROR',
      )
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
    signal?.removeEventListener('abort', abortFromCaller)
  }
}

export async function discoverGptModels({ apiKey, baseUrl, signal }) {
  const endpoint = `${baseUrl.replace(/\/+$/, '')}/models`
  const controller = new AbortController()
  const abortFromCaller = () => controller.abort(signal?.reason)
  signal?.addEventListener('abort', abortFromCaller, { once: true })
  const timeout = window.setTimeout(() => controller.abort('timeout'), MODEL_REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    })
    const payload = await readResponsePayload(response)

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw createAuthenticationError(response.status, payload, 'loading models')
      }
      const serverMessage = getServerMessage(payload)
      const detail = serverMessage ? ` ${serverMessage.slice(0, 240)}` : ''
      throw new AgentRouterError(
        `Agent Router could not load the model catalog (${response.status}).${detail}`,
        'MODEL_LIST_ERROR',
        response.status,
      )
    }

    return extractSupportedGptModels(payload)
  } catch (error) {
    if (controller.signal.aborted) {
      if (signal?.aborted) throw new DOMException('Model discovery cancelled.', 'AbortError')
      throw new AgentRouterError('Loading Agent Router models timed out.', 'TIMEOUT')
    }
    if (error instanceof AgentRouterError) throw error
    if (error instanceof TypeError) {
      throw new AgentRouterError(
        'Could not load models. Check the Base URL, internet connection, and browser CORS access.',
        'NETWORK_ERROR',
      )
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
    signal?.removeEventListener('abort', abortFromCaller)
  }
}

export function extractSupportedGptModels(payload) {
  const source = Array.isArray(payload) ? payload : payload?.data || payload?.models || payload?.result || []
  const entries = Array.isArray(source)
    ? source
    : Object.entries(source).map(([key, value]) => (typeof value === 'string' ? value : value?.id || value?.model || value?.name || key))
  const ids = entries
    .map((entry) => (typeof entry === 'string' ? entry : entry?.id || entry?.model || entry?.name || ''))
    .map((id) => String(id).trim())
    .filter(isSupportedGptModel)

  return [...new Set(ids)].sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' }))
}

function isSupportedGptModel(id) {
  const modelName = id.split('/').pop().toLowerCase().replace(/\s+/g, '-')
  return /^gpt[-_.]?[56](?:$|[-_.a-z0-9])/.test(modelName)
}

async function readResponsePayload(response) {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

function createHttpError(status, payload) {
  const serverMessage = getServerMessage(payload)

  if (status === 401 || status === 403) {
    return createAuthenticationError(status, payload, 'processing the image')
  }
  if (status === 404 || status === 405) {
    return new AgentRouterError(
      'The configured route does not expose /responses. Verify that the Base URL ends in /v1 and supports the OpenAI Responses API.',
      'UNSUPPORTED_ENDPOINT',
      status,
    )
  }
  if (status === 408 || status === 504) {
    return new AgentRouterError('Agent Router timed out while processing the photo.', 'TIMEOUT', status)
  }
  if (status === 413) {
    return new AgentRouterError('The photo is too large for this Agent Router route.', 'IMAGE_TOO_LARGE', status)
  }
  if (status === 429) {
    return new AgentRouterError('This Agent Router key has reached its rate or usage limit. Try again shortly.', 'RATE_LIMIT', status)
  }

  const suffix = serverMessage ? ` ${String(serverMessage).slice(0, 240)}` : ''
  return new AgentRouterError(`Agent Router returned an error (${status}).${suffix}`, 'API_ERROR', status)
}

function createAuthenticationError(status, payload, action) {
  const serverMessage = getServerMessage(payload)
  const errorType = String(payload?.type || payload?.error?.type || '').toLowerCase()
  const isBlockedClient = errorType === 'unauthorized_client_error' || serverMessage.toLowerCase().includes('unauthorized client')

  if (isBlockedClient) {
    return new AgentRouterError(
      'Agent Router blocked this app as an unauthorized client. Your API key may still be valid; this service currently limits access to approved coding clients. Ask Agent Router to authorize this app, or use an image API that permits mobile clients.',
      'UNAUTHORIZED_CLIENT',
      status,
    )
  }

  const detail = serverMessage ? ` Server: ${serverMessage.slice(0, 180)}` : ''
  if (status === 403) {
    return new AgentRouterError(`Agent Router forbids this client from ${action}.${detail}`, 'FORBIDDEN', status)
  }
  return new AgentRouterError(`Agent Router rejected the API key while ${action}.${detail}`, 'AUTH_ERROR', status)
}

function getServerMessage(payload) {
  const message = payload?.error?.message || payload?.error || payload?.message || (typeof payload?.raw === 'string' ? payload.raw : '')
  return typeof message === 'string' ? message.trim() : ''
}

function extractImage(payload) {
  const directCandidates = [
    payload?.image,
    payload?.result,
    payload?.data?.[0]?.b64_json,
    payload?.data?.[0]?.url,
    payload?.output?.image,
  ]

  for (const candidate of directCandidates) {
    const image = normalizeImage(candidate)
    if (image) return image
  }

  for (const item of payload?.output || []) {
    const candidates = [item?.result, item?.image, item?.image_url, item?.b64_json]
    for (const candidate of candidates) {
      const image = normalizeImage(candidate)
      if (image) return image
    }

    for (const content of item?.content || []) {
      const image = normalizeImage(content?.image_url?.url || content?.image_url || content?.b64_json || content?.data)
      if (image) return image
    }
  }

  for (const choice of payload?.choices || []) {
    const message = choice?.message || {}
    for (const item of message?.images || []) {
      const image = normalizeImage(item?.image_url?.url || item?.image_url || item?.url || item?.b64_json)
      if (image) return image
    }
    for (const content of Array.isArray(message.content) ? message.content : []) {
      const image = normalizeImage(content?.image_url?.url || content?.image_url || content?.url || content?.b64_json)
      if (image) return image
    }
    if (typeof message.content === 'string') {
      const image = extractImageFromText(message.content)
      if (image) return image
    }
  }

  return extractImageFromText(payload?.output_text || payload?.raw || '')
}

function normalizeImage(candidate) {
  if (!candidate || typeof candidate !== 'string') return ''
  if (candidate.startsWith('data:image/')) return candidate
  if (/^https?:\/\//i.test(candidate)) return candidate
  if (candidate.length > 256 && /^[A-Za-z0-9+/\s]+=*$/.test(candidate)) {
    return `data:image/png;base64,${candidate.replace(/\s/g, '')}`
  }
  return ''
}

function extractImageFromText(text) {
  if (typeof text !== 'string') return ''
  const dataUrl = text.match(/data:image\/[a-zA-Z+.-]+;base64,[A-Za-z0-9+/=\s]+/)?.[0]
  if (dataUrl) return dataUrl.replace(/\s/g, '')
  const markdownUrl = text.match(/!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/)?.[1]
  return markdownUrl || ''
}
