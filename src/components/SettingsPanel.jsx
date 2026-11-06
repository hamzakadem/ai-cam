import { useEffect, useRef, useState } from 'react'
import { Check, Cpu, Eye, EyeOff, KeyRound, RefreshCw, Server, ShieldCheck, X } from 'lucide-react'
import { discoverGptModels } from '../lib/agent-router'
import { MODEL_OPTIONS, validateSettings } from '../lib/settings'

const CUSTOM_MODEL = '__custom__'

export function SettingsPanel({ open, settings, onSave, onClose }) {
  const [draft, setDraft] = useState(settings)
  const [modelChoice, setModelChoice] = useState(settings.model)
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState('')
  const [routerModels, setRouterModels] = useState([])
  const [modelsLoading, setModelsLoading] = useState(false)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [modelError, setModelError] = useState('')
  const modelRequest = useRef(null)

  useEffect(() => {
    if (!open) return
    const isKnown = MODEL_OPTIONS.some((option) => option.value === settings.model)
    setDraft(settings)
    setModelChoice(isKnown ? settings.model : CUSTOM_MODEL)
    setShowKey(false)
    setError('')
    setRouterModels([])
    setModelsLoaded(false)
    setModelError('')
  }, [open, settings])

  useEffect(() => {
    if (!open || !settings.apiKey.trim() || !settings.baseUrl.trim()) return undefined
    const controller = new AbortController()
    modelRequest.current = controller
    setModelsLoading(true)

    discoverGptModels({ apiKey: settings.apiKey, baseUrl: settings.baseUrl, signal: controller.signal })
      .then((models) => {
        setRouterModels(models)
        setModelsLoaded(true)
        if (models.includes(settings.model)) setModelChoice(settings.model)
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setModelError(requestError.message)
      })
      .finally(() => {
        if (modelRequest.current === controller) {
          modelRequest.current = null
          setModelsLoading(false)
        }
      })

    return () => controller.abort()
  }, [open, settings.apiKey, settings.baseUrl, settings.model])

  useEffect(() => {
    if (!open) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  function handleSubmit(event) {
    event.preventDefault()
    const next = { ...draft, model: draft.model.trim() }
    const validationError = validateSettings(next)
    if (validationError) {
      setError(validationError)
      return
    }
    onSave(next)
  }

  function handleModelChange(event) {
    const value = event.target.value
    setModelChoice(value)
    if (value !== CUSTOM_MODEL) setDraft((current) => ({ ...current, model: value }))
    else setDraft((current) => ({ ...current, model: '' }))
  }

  async function handleDiscoverModels() {
    if (!draft.apiKey.trim()) {
      setModelError('Enter your Agent Router API key before loading models.')
      return
    }
    if (!draft.baseUrl.trim()) {
      setModelError('Enter the Agent Router Base URL before loading models.')
      return
    }

    modelRequest.current?.abort()
    const controller = new AbortController()
    modelRequest.current = controller
    setModelsLoading(true)
    setModelsLoaded(false)
    setModelError('')

    try {
      const models = await discoverGptModels({
        apiKey: draft.apiKey.trim(),
        baseUrl: draft.baseUrl.trim(),
        signal: controller.signal,
      })
      setRouterModels(models)
      setModelsLoaded(true)
      if (models.includes(draft.model)) setModelChoice(draft.model)
    } catch (requestError) {
      if (requestError.name !== 'AbortError') setModelError(requestError.message)
    } finally {
      if (modelRequest.current === controller) {
        modelRequest.current = null
        setModelsLoading(false)
      }
    }
  }

  const liveModelIds = new Set(routerModels)
  const fallbackModels = MODEL_OPTIONS.filter((option) => !liveModelIds.has(option.value))

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Agent Router settings">
      <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close settings" />
      <form
        onSubmit={handleSubmit}
        className="safe-bottom relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-white/10 bg-panel px-5 pb-6 pt-[calc(20px+env(safe-area-inset-top))] shadow-2xl shadow-black sm:px-7"
      >
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-acid">Connection / 01</p>
            <h2 className="text-2xl font-semibold tracking-tight text-white">Agent Router</h2>
            <p className="mt-2 text-sm leading-6 text-mist">Connect the camera to your OpenAI-compatible route.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-mist transition hover:text-white"
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              <KeyRound size={14} className="text-acid" /> API key
            </span>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={draft.apiKey}
                onChange={(event) => setDraft((current) => ({ ...current, apiKey: event.target.value }))}
                placeholder="ar-••••••••••••••••"
                autoComplete="off"
                spellCheck="false"
                className="field pr-12 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey((visible) => !visible)}
                className="absolute right-1 top-1 grid h-10 w-10 place-items-center text-mist transition hover:text-white"
                aria-label={showKey ? 'Hide API key' : 'Show API key'}
              >
                {showKey ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              <Server size={14} className="text-acid" /> Base URL
            </span>
            <input
              type="url"
              value={draft.baseUrl}
              onChange={(event) => setDraft((current) => ({ ...current, baseUrl: event.target.value }))}
              placeholder="https://agentrouter.org/v1"
              spellCheck="false"
              className="field font-mono text-xs"
            />
            <span className="mt-2 block text-xs leading-5 text-mist">Include the API version, usually <code>/v1</code>. The app calls <code>/responses</code>.</span>
          </label>

          <div>
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              <Cpu size={14} className="text-acid" /> GPT-5 to GPT-6 Astra model
            </span>
            <select value={modelChoice} onChange={handleModelChange} className="field appearance-none">
              {routerModels.length > 0 && (
                <optgroup label={`Available from Agent Router (${routerModels.length})`}>
                  {routerModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="Built-in GPT-5 to GPT-6 Astra catalog">
                {fallbackModels.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.value})
                  </option>
                ))}
              </optgroup>
              <option value={CUSTOM_MODEL}>Custom model name…</option>
            </select>
            {modelChoice === CUSTOM_MODEL && (
              <input
                type="text"
                value={draft.model}
                onChange={(event) => setDraft((current) => ({ ...current, model: event.target.value }))}
                placeholder="provider/model-name"
                spellCheck="false"
                className="field mt-3 font-mono text-xs"
                autoFocus
              />
            )}
            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleDiscoverModels}
                disabled={modelsLoading}
                className="inline-flex items-center gap-2 text-xs font-semibold text-white transition hover:text-acid disabled:cursor-wait disabled:text-mist"
              >
                <RefreshCw size={14} className={modelsLoading ? 'animate-spin' : ''} />
                {modelsLoading ? 'Loading models…' : 'Refresh available models'}
              </button>
              {modelsLoaded && !modelError && (
                <span className="font-mono text-[9px] uppercase tracking-wider text-acid">
                  {routerModels.length} live {routerModels.length === 1 ? 'model' : 'models'}
                </span>
              )}
            </div>
            {modelError && <p className="mt-2 text-xs leading-5 text-[#ff9a74]">{modelError}</p>}
            {modelsLoaded && routerModels.length === 0 && !modelError && (
              <p className="mt-2 text-xs leading-5 text-mist">No GPT-5 or GPT-6 IDs were reported by this route. The built-in and custom options remain available.</p>
            )}
          </div>

          <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <span>
              <span className="flex items-center gap-2 text-sm font-medium text-white">
                <ShieldCheck size={16} className="text-acid" /> Remember API key
              </span>
              <span className="mt-1.5 block text-xs leading-5 text-mist">
                Off keeps the key only for this browser tab. On stores it in this browser’s local storage.
              </span>
            </span>
            <input
              type="checkbox"
              checked={draft.rememberApiKey}
              onChange={(event) => setDraft((current) => ({ ...current, rememberApiKey: event.target.checked }))}
              className="peer sr-only"
            />
            <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-white/10 transition peer-checked:bg-acid after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5 peer-checked:after:bg-ink" />
          </label>
        </div>

        <div className="mt-auto pt-8">
          {error && (
            <p className="mb-4 rounded-xl border border-ember/25 bg-ember/10 px-4 py-3 text-sm leading-5 text-[#ff9a74]" role="alert">
              {error}
            </p>
          )}
          <div className="mb-4 flex items-start gap-2 text-[11px] leading-5 text-mist">
            <ShieldCheck size={14} className="mt-0.5 shrink-0" />
            Your key is sent only to the Base URL above. Browser storage is not a hardware-backed secret vault.
          </div>
          <button type="submit" className="primary-button w-full">
            <Check size={18} /> Save connection
          </button>
        </div>
      </form>
    </div>
  )
}
