import { Aperture, Download, Settings2, WifiOff } from 'lucide-react'

export function AppHeader({ online, installAvailable, onInstall, onOpenSettings }) {
  return (
    <header className="safe-top relative z-30 border-b border-white/10 bg-ink/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full border border-acid/50 bg-acid/10 text-acid">
            <Aperture size={22} strokeWidth={1.8} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold uppercase tracking-[0.22em] text-white">Aperture</span>
              <span className="font-mono text-[10px] tracking-wider text-acid">AI/01</span>
            </div>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-mist">Neural camera system</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider sm:flex ${
              online ? 'border-white/10 text-mist' : 'border-ember/30 bg-ember/10 text-ember'
            }`}
          >
            {online ? <span className="h-1.5 w-1.5 rounded-full bg-acid" /> : <WifiOff size={12} />}
            {online ? 'System online' : 'Offline'}
          </div>
          {installAvailable && (
            <button
              type="button"
              onClick={onInstall}
              className="hidden h-10 items-center gap-2 rounded-full border border-white/10 px-4 text-xs font-medium text-white transition hover:border-acid/50 hover:text-acid sm:flex"
            >
              <Download size={15} />
              Install
            </button>
          )}
          <button
            type="button"
            onClick={onOpenSettings}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-mist transition hover:border-acid/50 hover:bg-acid/10 hover:text-acid"
            aria-label="Open Agent Router settings"
          >
            <Settings2 size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
