import { useEffect, useState } from 'react'
import { Check, Cpu, Eye, EyeOff, KeyRound, Server, ShieldCheck, X } from 'lucide-react'
import { MODEL_OPTIONS, validateSettings } from '../lib/settings'

const CUSTOM_MODEL = '__custom__'

export function SettingsPanel({ open, settings, onSave, onClose }) {
  const [draft, setDraft] = useState(settings)
  const [modelChoice, setModelChoice] = useState(settings.model)
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    const isKnown = MODEL_OPTIONS.some((option) => option.value === settings.model)
    setDraft(settings)
    setModelChoice(isKnown ? settings.model : CUSTOM_MODEL)
    setShowKey(false)
    setError('')
  }, [open, settings])

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

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              <Cpu size={14} className="text-acid" /> Vision model
            </span>
            <select value={modelChoice} onChange={handleModelChange} className="field appearance-none">
              {MODEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
          </label>

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
