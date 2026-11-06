import { ScanLine, X } from 'lucide-react'

function getStage(progress) {
  if (progress < 24) return 'Reading composition'
  if (progress < 46) return 'Balancing light and color'
  if (progress < 70) return 'Recovering fine detail'
  if (progress < 90) return 'Rendering enhancement'
  return 'Finalizing output'
}

export function ProcessingScreen({ image, progress, onCancel }) {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-8">
      <div className="absolute inset-0">
        <img src={image} alt="" className="h-full w-full scale-105 object-cover opacity-20 blur-2xl" />
        <div className="absolute inset-0 bg-ink/80" />
      </div>

      <section className="relative w-full max-w-3xl overflow-hidden rounded-[32px] border border-white/10 bg-panel/95 shadow-2xl shadow-black/60">
        <div className="grid md:grid-cols-[1fr_320px]">
          <div className="relative min-h-[340px] overflow-hidden bg-black sm:min-h-[440px]">
            <img src={image} alt="Photo being enhanced" className="absolute inset-0 h-full w-full object-contain opacity-55" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(217,255,67,.06),transparent)]" />
            <div className="absolute inset-x-0 top-0 h-14 animate-scan border-b border-acid/80 bg-gradient-to-b from-transparent to-acid/15 shadow-[0_16px_38px_rgba(217,255,67,.12)]" />
            <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-acid/20 bg-black/60 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-acid backdrop-blur">
              <ScanLine size={13} /> Neural pass active
            </div>
          </div>

          <div className="flex flex-col justify-center p-7 sm:p-9">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-acid">Processing / 03</p>
            <div className="relative my-7 grid h-28 w-28 place-items-center rounded-full" style={{ background: `conic-gradient(#d9ff43 ${progress * 3.6}deg, #292d28 0deg)` }}>
              <div className="grid h-[102px] w-[102px] place-items-center rounded-full bg-panel">
                <span className="font-mono text-2xl font-semibold text-white">{Math.round(progress)}<small className="text-sm text-mist">%</small></span>
              </div>
            </div>
            <h1 className="text-xl font-semibold text-white">{getStage(progress)}</h1>
            <p className="mt-2 text-sm leading-6 text-mist">Agent Router is creating the enhanced frame. Complex edits can take up to two minutes.</p>
            <div className="mt-7 h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-acid transition-[width] duration-700 ease-out" style={{ width: `${progress}%` }} />
            </div>
            <button type="button" onClick={onCancel} className="secondary-button mt-7 w-full">
              <X size={17} /> Cancel request
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
