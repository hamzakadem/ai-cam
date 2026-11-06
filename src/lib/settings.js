export const DEFAULT_BASE_URL = 'https://agentrouter.org/v1'

export const MODEL_OPTIONS = [
  { value: 'gpt-5.6-sol', label: 'GPT-5.6 Sol' },
  { value: 'gpt-6-astra', label: 'GPT-6 Astra' },
]

const SETTINGS_KEY = 'aperture-ai.settings.v1'
const SESSION_KEY = 'aperture-ai.session-key.v1'

const defaults = {
  apiKey: '',
  baseUrl: DEFAULT_BASE_URL,
  model: 'gpt-6-astra',
  rememberApiKey: false,
}

export function loadSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
    const apiKey = stored.rememberApiKey ? stored.apiKey || '' : sessionStorage.getItem(SESSION_KEY) || ''
    return { ...defaults, ...stored, apiKey }
  } catch {
    return { ...defaults }
  }
}

export function saveSettings(settings) {
  const clean = {
    baseUrl: settings.baseUrl.trim().replace(/\/+$/, ''),
    model: settings.model.trim(),
    rememberApiKey: Boolean(settings.rememberApiKey),
  }

  if (clean.rememberApiKey) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...clean, apiKey: settings.apiKey.trim() }))
    sessionStorage.removeItem(SESSION_KEY)
  } else {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(clean))
    sessionStorage.setItem(SESSION_KEY, settings.apiKey.trim())
  }

  return { ...clean, apiKey: settings.apiKey.trim() }
}

export function validateSettings(settings) {
  if (!settings.apiKey.trim()) return 'Enter your Agent Router API key.'
  if (!settings.model.trim()) return 'Choose a model or enter a custom model name.'

  try {
    const url = new URL(settings.baseUrl)
    const isLocal = ['localhost', '127.0.0.1'].includes(url.hostname)
    if (url.protocol !== 'https:' && !isLocal) return 'Use an HTTPS Base URL (HTTP is allowed only for localhost).'
  } catch {
    return 'Enter a valid Agent Router Base URL.'
  }

  return ''
}
