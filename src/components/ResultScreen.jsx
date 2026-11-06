import { ArrowLeft, CheckCircle2, Download, RotateCcw, Share2, Sparkles } from 'lucide-react'
import { BeforeAfter } from './BeforeAfter'

export function ResultScreen({ before, after, model, onDownload, onShare, onReprocess, onNewCapture }) {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-start gap-4">
          <button type="button" onClick={onNewCapture} className="icon-button mt-1" aria-label="Start a new capture">
            <ArrowLeft size={19} />
          </button>
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-acid">
              <CheckCircle2 size={13} /> Complete / 04
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Your enhanced frame.</h1>
          </div>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mist">Rendered by <span className="text-white">{model}</span></p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="rounded-[30px] border border-white/10 bg-panel p-2 sm:p-3">
          <BeforeAfter before={before} after={after} />
          <p className="px-3 py-3 text-center text-xs text-mist sm:text-left">Drag across the image to compare the source and enhanced result.</p>
        </section>

        <aside className="flex flex-col rounded-[28px] border border-white/10 bg-panel p-5 sm:p-6">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-acid text-ink">
            <Sparkles size={22} />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-white">Ready to export</h2>
          <p className="mt-2 text-sm leading-6 text-mist">Save the full-resolution result, share it directly, or take another pass with new instructions.</p>

          <div className="mt-7 space-y-3">
            <button type="button" onClick={onDownload} className="primary-button w-full">
              <Download size={18} /> Save image
            </button>
            <button type="button" onClick={onShare} className="secondary-button w-full">
              <Share2 size={18} /> Share
            </button>
            <button type="button" onClick={onReprocess} className="secondary-button w-full">
              <RotateCcw size={18} /> Re-process
            </button>
          </div>

          <div className="mt-auto pt-8">
            <button type="button" onClick={onNewCapture} className="flex w-full items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-mist transition hover:text-white">
              <ArrowLeft size={15} /> New capture
            </button>
          </div>
        </aside>
      </div>
    </main>
  )
}
