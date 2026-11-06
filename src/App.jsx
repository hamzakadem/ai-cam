import { useEffect, useRef, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { Directory, Filesystem } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { AppHeader } from './components/AppHeader'
import { CameraScreen } from './components/CameraScreen'
import { EditScreen } from './components/EditScreen'
import { ProcessingScreen } from './components/ProcessingScreen'
import { ResultScreen } from './components/ResultScreen'
import { SettingsPanel } from './components/SettingsPanel'
import { Toast } from './components/Toast'
import { useCamera } from './hooks/useCamera'
import { enhanceImage } from './lib/agent-router'
import { blobToBase64, imageSourceToBlob, normalizeImageFile } from './lib/image'
import { createEnhancementPrompt } from './lib/presets'
import { loadSettings, saveSettings, validateSettings } from './lib/settings'

export default function App() {
  const [screen, setScreen] = useState('camera')
  const [settings, setSettings] = useState(loadSettings)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [originalImage, setOriginalImage] = useState('')
  const [enhancedImage, setEnhancedImage] = useState('')
  const [preset, setPreset] = useState('auto')
  const [customPrompt, setCustomPrompt] = useState('')
  const [progress, setProgress] = useState(6)
  const [toast, setToast] = useState(null)
  const [online, setOnline] = useState(() => navigator.onLine)
  const [installPrompt, setInstallPrompt] = useState(null)
  const requestController = useRef(null)
  const progressTimer = useRef(null)
  const camera = useCamera(screen === 'camera')

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    const handleInstallPrompt = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
    }
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), toast.type === 'error' ? 7000 : 4200)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(
    () => () => {
      requestController.current?.abort()
      window.clearInterval(progressTimer.current)
    },
    [],
  )

  function notify(message, type = 'info') {
    setToast({ id: Date.now(), message, type })
  }

  function acceptImage(image) {
    setOriginalImage(image)
    setEnhancedImage('')
    setScreen('edit')
  }

  async function handleUpload(file) {
    try {
      const image = await normalizeImageFile(file)
      acceptImage(image)
    } catch (error) {
      notify(error.message, 'error')
    }
  }

  function handleSettingsSave(nextSettings) {
    try {
      const saved = saveSettings(nextSettings)
      setSettings(saved)
      setSettingsOpen(false)
      notify('Agent Router settings saved on this device.', 'success')
    } catch {
      notify('The browser could not save these settings. Check storage permissions.', 'error')
    }
  }

  async function handleInstall() {
    if (!installPrompt) return
    await installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  async function handleProcess() {
    const settingsError = validateSettings(settings)
    if (settingsError) {
      setSettingsOpen(true)
      notify(settingsError, 'error')
      return
    }
    if (!online) {
      notify('Connect to the internet before starting an AI enhancement.', 'error')
      return
    }

    const controller = new AbortController()
    requestController.current = controller
    setProgress(7)
    setScreen('processing')

    progressTimer.current = window.setInterval(() => {
      setProgress((current) => Math.min(93, current + Math.max(0.7, (94 - current) * 0.045)))
    }, 700)

    try {
      const result = await enhanceImage({
        image: originalImage,
        prompt: createEnhancementPrompt(preset, customPrompt),
        apiKey: settings.apiKey,
        baseUrl: settings.baseUrl,
        model: settings.model,
        signal: controller.signal,
      })
      window.clearInterval(progressTimer.current)
      setProgress(100)
      setEnhancedImage(result)
      await new Promise((resolve) => window.setTimeout(resolve, 350))
      setScreen('result')
    } catch (error) {
      window.clearInterval(progressTimer.current)
      if (error.name === 'AbortError') return
      setScreen('edit')
      notify(error.message || 'The image could not be enhanced.', 'error')
    } finally {
      if (requestController.current === controller) requestController.current = null
    }
  }

  function handleCancelProcess() {
    requestController.current?.abort()
    window.clearInterval(progressTimer.current)
    setScreen('edit')
    notify('Enhancement cancelled.', 'info')
  }

  function handleNewCapture() {
    requestController.current?.abort()
    setOriginalImage('')
    setEnhancedImage('')
    setPreset('auto')
    setCustomPrompt('')
    setScreen('camera')
  }

  async function handleDownload() {
    try {
      const blob = await imageSourceToBlob(enhancedImage)
      const extension = blob.type.includes('jpeg') ? 'jpg' : blob.type.includes('webp') ? 'webp' : 'png'
      const filename = `aperture-ai-${new Date().toISOString().replace(/[:.]/g, '-')}.${extension}`

      if (Capacitor.isNativePlatform()) {
        await Filesystem.requestPermissions()
        await Filesystem.writeFile({
          path: `ApertureAI/${filename}`,
          data: await blobToBase64(blob),
          directory: Directory.Documents,
          recursive: true,
        })
        notify(`Saved to Documents/ApertureAI/${filename}`, 'success')
        return
      }

      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
      notify('Enhanced image saved.', 'success')
    } catch (error) {
      if (/^https?:\/\//i.test(enhancedImage)) window.open(enhancedImage, '_blank', 'noopener,noreferrer')
      notify(error.message || 'The image could not be saved.', 'error')
    }
  }

  async function handleShare() {
    if (Capacitor.isNativePlatform()) {
      try {
        const blob = await imageSourceToBlob(enhancedImage)
        const extension = blob.type.includes('jpeg') ? 'jpg' : blob.type.includes('webp') ? 'webp' : 'png'
        const result = await Filesystem.writeFile({
          path: `aperture-ai-share.${extension}`,
          data: await blobToBase64(blob),
          directory: Directory.Cache,
        })
        await Share.share({
          title: 'Aperture AI photo',
          text: 'Enhanced with Aperture AI Camera',
          files: [result.uri],
          dialogTitle: 'Share enhanced photo',
        })
      } catch (error) {
        if (error.message !== 'Share canceled') notify(error.message || 'The image could not be shared.', 'error')
      }
      return
    }

    if (!navigator.share) {
      await handleDownload()
      notify('Sharing is not supported here, so the image was downloaded instead.', 'info')
      return
    }

    try {
      const blob = await imageSourceToBlob(enhancedImage)
      const extension = blob.type.includes('jpeg') ? 'jpg' : blob.type.includes('webp') ? 'webp' : 'png'
      const file = new File([blob], `aperture-ai-enhanced.${extension}`, { type: blob.type || 'image/png' })
      const shareData = { title: 'Aperture AI photo', text: 'Enhanced with Aperture AI Camera', files: [file] }

      if (!navigator.canShare?.(shareData)) {
        if (/^https?:\/\//i.test(enhancedImage)) {
          await navigator.share({ title: shareData.title, text: shareData.text, url: enhancedImage })
          return
        }
        await handleDownload()
        notify('File sharing is not supported here, so the image was downloaded instead.', 'info')
        return
      }

      await navigator.share(shareData)
    } catch (error) {
      if (error.name !== 'AbortError') notify(error.message || 'The image could not be shared.', 'error')
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden bg-ink text-white">
      <AppHeader
        online={online}
        installAvailable={Boolean(installPrompt)}
        onInstall={handleInstall}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {screen === 'camera' && (
        <CameraScreen camera={camera} onCapture={acceptImage} onUpload={handleUpload} onError={(message) => notify(message, 'error')} />
      )}
      {screen === 'edit' && (
        <EditScreen
          image={originalImage}
          preset={preset}
          prompt={customPrompt}
          online={online}
          onPresetChange={setPreset}
          onPromptChange={setCustomPrompt}
          onBack={handleNewCapture}
          onProcess={handleProcess}
        />
      )}
      {screen === 'processing' && <ProcessingScreen image={originalImage} progress={progress} onCancel={handleCancelProcess} />}
      {screen === 'result' && (
        <ResultScreen
          before={originalImage}
          after={enhancedImage}
          model={settings.model}
          onDownload={handleDownload}
          onShare={handleShare}
          onReprocess={() => setScreen('edit')}
          onNewCapture={handleNewCapture}
        />
      )}

      <SettingsPanel open={settingsOpen} settings={settings} onSave={handleSettingsSave} onClose={() => setSettingsOpen(false)} />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
