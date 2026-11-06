import { useState } from 'react'
import { MoveHorizontal } from 'lucide-react'

export function BeforeAfter({ before, after }) {
  const [position, setPosition] = useState(50)

  return (
    <div className="group relative aspect-[4/5] max-h-[72dvh] w-full overflow-hidden rounded-[26px] bg-black sm:aspect-[16/11]">
      <img src={after} alt="AI-enhanced result" className="absolute inset-0 h-full w-full select-none object-contain" draggable="false" />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <img src={before} alt="Original photo" className="absolute inset-0 h-full w-full max-w-none select-none object-contain" draggable="false" />
      </div>

      <div className="pointer-events-none absolute inset-y-0 w-px bg-white shadow-[0_0_0_1px_rgba(0,0,0,.25),0_0_18px_rgba(0,0,0,.45)]" style={{ left: `${position}%` }}>
        <span className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-black/70 text-white shadow-xl backdrop-blur">
          <MoveHorizontal size={19} />
        </span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-4 sm:p-5">
        <span className="rounded-full border border-white/15 bg-black/55 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-white backdrop-blur">Before</span>
        <span className="rounded-full border border-acid/30 bg-black/55 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-acid backdrop-blur">After / AI</span>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        className="comparison-range absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        aria-label="Move the before and after comparison slider"
      />
    </div>
  )
}
