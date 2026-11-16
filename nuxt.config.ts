import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

/* ========================================
   SECURITY HEADERS
   The Strapi URL is read at build time (NUXT_PUBLIC_STRAPI_URL on Vercel)
   so the Content-Security-Policy only allows the store's own API,
   Cloudinary images and Google Fonts.
========================================= */
const strapiUrl = (process.env.NUXT_PUBLIC_STRAPI_URL || 'http://localhost:1337').replace(/\/+$/, '')
const isDev = process.env.NODE_ENV !== 'production'

const contentSecurityPolicy = [
  "default-src 'self'",
  // Nuxt inlines a small boot script; dev mode also needs eval for HMR
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  // Vuetify sets inline styles; fonts come from Google Fonts
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  `img-src 'self' data: blob: ${strapiUrl} https://res.cloudinary.com`,
  `connect-src 'self' ${strapiUrl}${isDev ? ' ws: wss:' : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

const securityHeaders = {
  'Content-Security-Policy': contentSecurityPolicy,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: isDev },

  // The cart and wishlist live in the browser (localStorage), and every page
  // loads its data from Strapi in onMounted, so the app runs as a client-side SPA.
  ssr: false,

  // Strapi base URL, read in pages with useRuntimeConfig().public.strapiUrl
  // Override with the NUXT_PUBLIC_STRAPI_URL environment variable (set it on Vercel).
  runtimeConfig: {
    public: {
      strapiUrl,
    },
  },

  // Applied to production builds only, so the dev server (HMR, devtools) is unaffected
  routeRules: isDev ? {} : {
    '/**': { headers: securityHeaders },
  },

  // Global design tokens (colors, type, surfaces) for the ShopKart look
  css: ['~/assets/css/shopkart.css'],

  app: {
    head: {
      title: 'ShopKart',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#F7F9E1' },
      ],
      link: [
        // Tab / bookmark icons, generated from system-logo.png
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'icon', type: 'image/png', href: '/favicon-32.png', sizes: '32x32' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Manrope:wght@400;500;600;700;800&display=swap',
        },
      ],
    },
  },

  build: {
    transpile: ['vuetify'],
  },
  vite: {
    plugins: [
      vuetify({ autoImport: true }),
    ],
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
})
