import type { MetadataRoute } from 'next'

/** PWA / „Zum Home-Bildschirm“ (Android Chrome, Desktop-Chromium, einige iOS-Fälle) */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Rett:ich – Dein Küchen-Navi',
    short_name: 'Rett:ich',
    description: 'Dein tägliches Küchen-Navi',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#faf7f0',
    theme_color: '#ea580c',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
