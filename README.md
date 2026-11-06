# Aperture AI Camera

A mobile-first Progressive Web App for live camera capture, gallery upload, GPT-5+ photo enhancement through Agent Router, before/after comparison, download, and native sharing.

## Run locally

Requirements: Node.js 20 or newer and a modern browser.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`. Camera access works on `localhost`; a deployed copy must use HTTPS.

If PowerShell blocks `npm.ps1`, use the Windows executable directly:

```powershell
npm.cmd install
npm.cmd run dev
```

## Configure Agent Router

1. Open the app and select the settings icon in the top-right corner.
2. Enter the Agent Router API key.
3. Confirm the Base URL. The default is `https://agentrouter.org/v1`.
4. Select a GPT-5+ model, or choose **Custom model name** and enter the model ID exposed by your route.
5. Select **Remember API key** only on a trusted device, then save the connection.

The app sends requests to `<Base URL>/responses` using the OpenAI Responses API format with an `input_image` and the `image_generation` tool. The selected Agent Router route/model must support that tool and return an image. A text-only vision route can analyze a photo but cannot produce the enhanced image required by this app.

API keys are never bundled into the source or build. With **Remember API key** off, the key is kept in `sessionStorage` for the current browser tab. With it on, the key is kept in browser `localStorage`. Browser storage is not a hardware-backed secret vault; for a public or multi-user deployment, proxy requests through a server-side endpoint instead.

## Production build

```bash
npm run lint
npm run build
npm run preview
```

Deploy the generated `dist` directory to any static HTTPS host. The included manifest and service worker make the app installable and cache the application shell. AI processing still requires a network connection and an Agent Router endpoint that allows browser CORS requests.

## Android APK

The Capacitor Android project is in `android`. Sync web changes into it with:

```bash
npm run android:sync
```

Every push to `main` also runs `.github/workflows/build-android-apk.yml`. The workflow validates the web app, builds an installable debug APK, records its SHA-256 checksum, and uploads both files in the `aperture-ai-camera-apk` GitHub Actions artifact.

The Android package ID is `com.aperture.aicamera`. The native wrapper requests camera permission at runtime and uses Capacitor plugins for Android document storage and sharing.

## Browser permissions

- Allow camera access when prompted for the live viewfinder.
- Flash control appears only when the active device camera exposes torch support.
- Gallery upload remains available when camera access is unavailable or denied.
- Native file sharing depends on Web Share API support; unsupported browsers download the image instead.
