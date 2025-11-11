import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ReelVibe - Votre Réseau Social Cinéma',
    short_name: 'ReelVibe',
    description: 'Découvrez, notez et partagez vos films et séries préférés avec votre communauté cinéphile',
    start_url: '/',
    display: 'standalone',
    background_color: '#141414',
    theme_color: '#A855F7',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['entertainment', 'video'],
    screenshots: [
      {
        src: '/screenshot-wide.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
      },
      {
        src: '/screenshot-narrow.png',
        sizes: '750x1334',
        type: 'image/png',
        form_factor: 'narrow',
      },
    ],
  }
}
