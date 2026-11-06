import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

const icons = {
  error: AlertTriangle,
  success: CheckCircle2,
  info: Info,
}

export function Toast({ toast, onClose }) {
  if (!toast) return null
  const Icon = icons[toast.type] || Info

  return (
    <div className="pointer-events-none fixed inset-x-4 top-[calc(84px+env(safe-area-inset-top))] z-[70] flex justify-center" aria-live="polite">
      <div className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border border-white/10 bg-[#171a17] p-4 shadow-2xl shadow-black/50">
        <Icon className={toast.type === 'error' ? 'mt-0.5 text-ember' : 'mt-0.5 text-acid'} size={18} />
        <p className="min-w-0 flex-1 text-sm leading-6 text-white/85">{toast.message}</p>
        <button type="button" onClick={onClose} className="text-mist transition hover:text-white" aria-label="Dismiss message">
          <X size={17} />
        </button>
      </div>
    </div>
  )
}
