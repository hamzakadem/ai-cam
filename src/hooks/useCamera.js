import { useEffect, useRef, useState } from 'react'
import { captureVideoFrame } from '../lib/image'

export function useCamera(active) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [facingMode, setFacingMode] = useState('environment')
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [torchSupported, setTorchSupported] = useState(false)
  const [torchOn, setTorchOn] = useState(false)

  useEffect(() => {
    let cancelled = false

    function stopCamera() {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      setReady(false)
      setTorchOn(false)
      setTorchSupported(false)
    }

    async function startCamera() {
      stopCamera()
      setError('')

      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Live camera is not supported in this browser. You can still upload a photo.')
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1440 },
          },
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream
        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          await video.play()
        }

        const track = stream.getVideoTracks()[0]
        const capabilities = track?.getCapabilities?.() || {}
        setTorchSupported(Boolean(capabilities.torch))
        setReady(true)
      } catch (cameraError) {
        const denied = cameraError?.name === 'NotAllowedError' || cameraError?.name === 'SecurityError'
        setError(
          denied
            ? 'Camera access is blocked. Allow camera permission in your browser, or upload a photo instead.'
            : 'The camera could not start. Close other camera apps or upload a photo instead.',
        )
      }
    }

    if (active) startCamera()
    else stopCamera()

    return () => {
      cancelled = true
      stopCamera()
    }
  }, [active, facingMode])

  async function toggleTorch() {
    const track = streamRef.current?.getVideoTracks()?.[0]
    if (!track || !torchSupported) return
    const next = !torchOn
    try {
      await track.applyConstraints({ advanced: [{ torch: next }] })
      setTorchOn(next)
    } catch {
      setError('This camera could not change the flash setting.')
    }
  }

  function switchCamera() {
    setFacingMode((mode) => (mode === 'environment' ? 'user' : 'environment'))
  }

  function capture() {
    return captureVideoFrame(videoRef.current, facingMode === 'user')
  }

  return {
    videoRef,
    facingMode,
    ready,
    error,
    torchSupported,
    torchOn,
    toggleTorch,
    switchCamera,
    capture,
  }
}
