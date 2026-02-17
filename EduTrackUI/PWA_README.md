# Progressive Web App (PWA) Setup - EduTrack

The EduTrack application is now configured as a Progressive Web App (PWA), allowing users to install it on their devices and use it offline.

## Features

### ✅ Implemented PWA Features

1. **Installable**: Users can install the app on their mobile devices and desktop
2. **Offline Support**: Core app functionality works offline
3. **Fast Loading**: Assets are cached for quick loading
4. **App-like Experience**: Runs in standalone mode without browser UI
5. **Auto-updates**: Service worker automatically updates when new version is deployed
6. **Network-first API**: API calls use network first, with cache fallback

## Configuration Files

### 1. `vite.config.ts`
- Added `vite-plugin-pwa` configuration
- Configured workbox for caching strategies
- Set up runtime caching for:
  - Google Fonts (CacheFirst, 365 days)
  - API calls (NetworkFirst, 5 minutes)
  - Static assets (automatic)

### 2. `public/manifest.json`
- App name and branding
- Icons in multiple sizes (72px to 512px)
- Display mode: standalone
- Theme color: #3b82f6 (blue)
- Shortcuts for quick access to Dashboard and Payment pages

### 3. `index.html`
- PWA meta tags for mobile browsers
- Apple-specific meta tags for iOS
- Manifest link
- Theme color configuration

### 4. App Icons
Generated icons in sizes:
- 72x72, 96x96, 128x128, 144x144
- 152x152, 192x192, 384x384, 512x512

All icons are "maskable" - they adapt to different device icon shapes.

## How to Install the PWA

### On Mobile (Android/iOS)

#### Android (Chrome/Edge):
1. Visit the website in Chrome or Edge browser
2. Tap the menu (⋮) in the top-right corner
3. Select "Install app" or "Add to Home Screen"
4. Confirm installation
5. The app icon will appear on your home screen

#### iOS (Safari):
1. Visit the website in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Give it a name (default: "EduTrack")
5. Tap "Add"
6. The app icon will appear on your home screen

### On Desktop (Windows/Mac/Linux)

#### Chrome/Edge:
1. Visit the website
2. Look for the install icon (⊕) in the address bar
3. Click "Install"
4. The app will open in a standalone window
5. You can pin it to taskbar/dock

## Testing PWA Features

### 1. Test Installation
- Visit the app in a browser
- Check for install prompt
- Install and verify it opens in standalone mode

### 2. Test Offline Mode
- Install the app
- Open DevTools → Application → Service Workers
- Check "Offline" mode
- Navigate the app - cached pages should work

### 3. Test Caching
- Open DevTools → Application → Cache Storage
- Verify "workbox-precache" and other caches exist
- Check what files are cached

### 4. Test Updates
- Make changes to the app
- Build and deploy
- Reload the app
- Service worker should auto-update

## Development

### Enable PWA in Development
PWA is enabled in development mode (`devOptions.enabled: true`).
You can test PWA features without building:

```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

The build process will:
- Generate service worker
- Create precache manifest
- Optimize assets for caching

### Preview Production Build
```bash
npm run preview
```

## Caching Strategy

### Precaching (Install-time)
- All JS, CSS, HTML files
- Images, fonts, icons
- Configured via `workbox.globPatterns`

### Runtime Caching

1. **Google Fonts** (CacheFirst)
   - Cached for 1 year
   - Fonts load instantly after first visit

2. **API Calls** (/api/*) (NetworkFirst)
   - Network timeout: 10 seconds
   - Falls back to cache if offline
   - Cache expires after 5 minutes

3. **Static Assets** (CacheFirst)
   - Images, fonts served from cache
   - Reduces server load

## Customization

### Change App Name
Edit `vite.config.ts` and `public/manifest.json`:
```json
{
  "name": "Your App Name",
  "short_name": "YourApp"
}
```

### Change Theme Color
Edit both files:
- `vite.config.ts`: `theme_color`
- `index.html`: `<meta name="theme-color">`

### Update Icons
1. Replace `public/logo.png` with your logo
2. Run icon generator:
```bash
node generate-icons.cjs
```

### Add More Shortcuts
Edit `public/manifest.json` → `shortcuts` array:
```json
{
  "name": "New Shortcut",
  "url": "/your/path",
  "icons": [{"src": "/icon-96x96.png", "sizes": "96x96"}]
}
```

## Troubleshooting

### PWA not installing
- Check HTTPS (required except localhost)
- Verify manifest.json is accessible
- Check browser console for errors
- Ensure icons exist and are accessible

### Service worker not updating
- Hard refresh (Ctrl+F5 / Cmd+Shift+R)
- Clear site data in DevTools
- Check "Update on reload" in DevTools → Application → Service Workers

### Cache issues
- Clear cache: DevTools → Application → Clear storage
- Check cache entries in DevTools
- Verify workbox configuration

## Browser Support

- ✅ Chrome/Edge (full support)
- ✅ Safari/iOS (full support)
- ✅ Firefox (full support)
- ✅ Samsung Internet (full support)
- ⚠️ IE11 (not supported)

## Security Notes

1. PWAs require HTTPS in production
2. Service workers have limited scope (same-origin policy)
3. Cached API data expires after 5 minutes
4. Sensitive data should not be cached long-term

## Monitoring

Check PWA status:
1. Chrome DevTools → Lighthouse
2. Run PWA audit
3. Check for perfect score on:
   - Progressive Web App
   - Performance
   - Accessibility

## Resources

- [Vite PWA Plugin Docs](https://vite-pwa-org.netlify.app/)
- [Workbox Documentation](https://developer.chrome.com/docs/workbox/)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
