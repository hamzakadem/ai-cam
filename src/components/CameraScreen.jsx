import { Camera, ImagePlus, ScanLine, SwitchCamera, Upload, Zap, ZapOff } from 'lucide-react'

export function CameraScreen({ camera, onCapture, onUpload, onError }) {
  function handleCapture() {
    try {
      onCapture(camera.capture())
    } catch (error) {
      onError(error.message)
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (file) onUpload(file)
    event.target.value = ''
  }

  return (
    <main className="mx-auto grid w-full max-w-7xl flex-1 gap-5 px-3 py-3 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section className="relative min-h-[calc(100dvh-108px)] overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-2xl shadow-black/30 sm:min-h-0 sm:aspect-[4/3] lg:aspect-auto lg:h-[calc(100dvh-120px)]">
        <video
          ref={camera.videoRef}
          autoPlay
          muted
          playsInline
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            camera.ready ? 'opacity-100' : 'opacity-0'
          } ${camera.facingMode === 'user' ? '-scale-x-100' : ''}`}
        />

        <div className="camera-vignette pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-[12%] grid grid-cols-3 grid-rows-3 opacity-45">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="border-[0.5px] border-white/25" />
          ))}
        </div>

        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-5">
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white backdrop-blur-md">
            <span className={`h-1.5 w-1.5 rounded-full ${camera.ready ? 'bg-red-500' : 'bg-white/30'}`} />
            {camera.ready ? 'Live view' : 'Standby'}
          </div>
          <button
            type="button"
            onClick={camera.toggleTorch}
            disabled={!camera.torchSupported}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md transition hover:border-acid/60 hover:text-acid disabled:cursor-not-allowed disabled:opacity-35"
            aria-label={camera.torchOn ? 'Turn flash off' : 'Turn flash on'}
            title={camera.torchSupported ? 'Toggle flash' : 'Flash is unavailable on this camera'}
          >
            {camera.torchOn ? <Zap size={19} fill="currentColor" /> : <ZapOff size={19} />}
          </button>
        </div>

        {!camera.ready && (
          <div className="absolute inset-0 grid place-items-center bg-[#090a09] px-8 text-center">
            <div className="max-w-sm">
              <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-acid">
                {camera.error ? <Camera size={27} /> : <ScanLine size={27} className="animate-pulse-soft" />}
              </div>
              <h1 className="text-xl font-semibold text-white">{camera.error ? 'Camera unavailable' : 'Opening camera'}</h1>
              <p className="mt-3 text-sm leading-6 text-mist">
                {camera.error || 'Preparing the live viewfinder and exposure controls…'}
              </p>
              {camera.error && (
                <label className="secondary-button mx-auto mt-6 inline-flex cursor-pointer">
                  <Upload size={17} /> Upload a photo
                  <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                </label>
              )}
            </div>
          </div>
        )}

        <div className="safe-bottom absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black via-black/70 to-transparent px-6 pb-6 pt-16 sm:px-10 sm:pb-8">
          <label className="group grid h-[52px] w-[52px] cursor-pointer place-items-center rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:border-acid/60 hover:text-acid sm:h-14 sm:w-14" title="Upload from gallery">
            <ImagePlus size={21} />
            <span className="sr-only">Upload a photo from the gallery</span>
            <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
          </label>

          <button
            type="button"
            onClick={handleCapture}
            disabled={!camera.ready}
            className="group relative grid h-[82px] w-[82px] place-items-center rounded-full border border-white/80 transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Capture photo"
          >
            <span className="absolute inset-[6px] rounded-full bg-white transition group-active:scale-90" />
            <span className="relative h-3 w-3 rounded-full bg-ink" />
          </button>

          <button
            type="button"
            onClick={camera.switchCamera}
            className="grid h-[52px] w-[52px] place-items-center rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:border-acid/60 hover:text-acid sm:h-14 sm:w-14"
            aria-label="Switch between front and rear camera"
          >
            <SwitchCamera size={22} />
          </button>
        </div>
      </section>

      <aside className="hidden flex-col rounded-[28px] border border-white/10 bg-panel p-6 lg:flex">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-acid">Capture / 01</p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white">Frame the moment.</h1>
        <p className="mt-3 text-sm leading-6 text-mist">Capture with the live camera or bring in a photograph from your library.</p>

        <div className="my-8 h-px bg-white/10" />

        <dl className="space-y-5 font-mono text-[11px] uppercase tracking-[0.12em]">
          <div className="flex items-center justify-between">
            <dt className="text-mist">Lens</dt>
            <dd className="text-white">{camera.facingMode === 'environment' ? 'Rear / Wide' : 'Front / Wide'}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-mist">Flash</dt>
            <dd className={camera.torchOn ? 'text-acid' : 'text-white'}>
              {!camera.torchSupported ? 'Unavailable' : camera.torchOn ? 'On' : 'Off'}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-mist">Output</dt>
            <dd className="text-white">2048 PX / JPEG</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-mist">AI route</dt>
            <dd className="flex items-center gap-2 text-white"><span className="h-1.5 w-1.5 rounded-full bg-acid" /> Ready</dd>
          </div>
        </dl>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.025] p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-white">
            <Camera size={15} className="text-acid" /> Camera access
          </div>
          <p className="mt-2 text-xs leading-5 text-mist">Live capture requires HTTPS or localhost. Gallery upload works without camera permission.</p>
        </div>
      </aside>
    </main>
  )
}
