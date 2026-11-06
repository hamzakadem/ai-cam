import { ArrowLeft, Film, Palette, Sparkles, Sun, WandSparkles } from 'lucide-react'
import { PRESETS } from '../lib/presets'

const presetIcons = {
  auto: WandSparkles,
  studio: Sun,
  color: Palette,
  cinematic: Film,
}

export function EditScreen({ image, preset, prompt, online, onPresetChange, onPromptChange, onBack, onProcess }) {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="flex items-start gap-4">
          <button type="button" onClick={onBack} className="icon-button mt-1" aria-label="Return to camera">
            <ArrowLeft size={19} />
          </button>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-acid">Enhance / 02</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Direct the edit.</h1>
          </div>
        </div>
        <p className="hidden max-w-sm text-right text-sm leading-6 text-mist md:block">Choose a calibrated starting point, then describe any precise adjustments.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,.85fr)]">
        <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black lg:sticky lg:top-6 lg:h-[calc(100dvh-160px)]">
          <img src={image} alt="Original photo to enhance" className="h-full max-h-[62dvh] w-full object-contain lg:max-h-none" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/80 to-transparent p-5 pt-16">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-acid">Source frame</p>
              <p className="mt-1 text-sm text-white/80">Original capture / full fidelity</p>
            </div>
            <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white backdrop-blur">Before</span>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-panel p-5 sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white">Enhancement preset</p>
              <p className="mt-1 text-xs text-mist">One look, fully adjustable</p>
            </div>
            <Sparkles size={19} className="text-acid" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {PRESETS.map((item) => {
              const Icon = presetIcons[item.id]
              const selected = preset === item.id
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => onPresetChange(item.id)}
                  className={`group min-h-40 rounded-2xl border p-4 text-left transition ${
                    selected
                      ? 'border-acid/60 bg-acid/[0.08] shadow-acid-glow'
                      : 'border-white/10 bg-white/[0.025] hover:border-white/25 hover:bg-white/[0.045]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`grid h-10 w-10 place-items-center rounded-xl ${selected ? 'bg-acid text-ink' : 'bg-white/5 text-white'}`}>
                      <Icon size={19} />
                    </div>
                    <span className={`font-mono text-[9px] uppercase tracking-[0.18em] ${selected ? 'text-acid' : 'text-mist'}`}>{item.tag}</span>
                  </div>
                  <h2 className="mt-5 text-sm font-semibold text-white">{item.title}</h2>
                  <p className="mt-1.5 text-xs leading-5 text-mist">{item.description}</p>
                </button>
              )
            })}
          </div>

          <label className="mt-7 block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-white/75">Custom direction</span>
            <textarea
              value={prompt}
              onChange={(event) => onPromptChange(event.target.value)}
              rows={4}
              maxLength={1200}
              placeholder="Example: Remove the glare from the glasses, warm the late-afternoon light, and keep the background unchanged."
              className="field min-h-28 resize-y py-3 leading-6"
            />
            <span className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-wider text-mist">
              <span>Optional / precise language works best</span>
              <span>{prompt.length}/1200</span>
            </span>
          </label>

          <button type="button" onClick={onProcess} disabled={!online} className="primary-button mt-7 w-full disabled:cursor-not-allowed disabled:opacity-45">
            <Sparkles size={18} /> {online ? 'Enhance with AI' : 'AI enhancement requires internet'}
          </button>
        </section>
      </div>
    </main>
  )
}
