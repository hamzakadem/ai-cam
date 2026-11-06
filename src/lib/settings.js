export const DEFAULT_BASE_URL = 'https://agentrouter.org/v1'

export const MODEL_OPTIONS = [
  { value: 'gpt-5', label: 'GPT-5' },
  { value: 'gpt-5-mini', label: 'GPT-5 Mini' },
  { value: 'gpt-5-nano', label: 'GPT-5 Nano' },
  { value: 'gpt-5-pro', label: 'GPT-5 Pro' },
  { value: 'gpt-5-turbo', label: 'GPT-5 Turbo' },
  { value: 'gpt-5-vision', label: 'GPT-5 Vision' },
  { value: 'gpt-5.1', label: 'GPT-5.1' },
  { value: 'gpt-5.1-codex', label: 'GPT-5.1 Codex' },
  { value: 'gpt-5.2', label: 'GPT-5.2' },
  { value: 'gpt-5.2-pro', label: 'GPT-5.2 Pro' },
  { value: 'gpt-5.2-codex', label: 'GPT-5.2 Codex' },
  { value: 'gpt-5.3', label: 'GPT-5.3' },
  { value: 'gpt-5.4', label: 'GPT-5.4' },
  { value: 'gpt-5.5', label: 'GPT-5.5' },
  { value: 'gpt-5.6', label: 'GPT-5.6' },
  { value: 'gpt-6', label: 'GPT-6' },
  { value: 'gpt-6-mini', label: 'GPT-6 Mini' },
  { value: 'gpt-6-pro', label: 'GPT-6 Pro' },
  { value: 'gpt-6-turbo', label: 'GPT-6 Turbo' },
  { value: 'gpt-6-vision', label: 'GPT-6 Vision' },
  { value: 'gpt-6-astra', label: 'GPT-6 Astra' },
]

const SETTINGS_KEY = 'aperture-ai.settings.v1'
const SESSION_KEY = 'aperture-ai.session-key.v1'

const defaults = {
  apiKey: '',
  baseUrl: DEFAULT_BASE_URL,
  model: 'gpt-5',
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
