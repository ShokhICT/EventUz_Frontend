// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/icon',
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001/api'
    }
  },

  app: {
    head: {
      title: 'EventHub Uzbekistan - Discover Amazing Events',
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'EventHub Uzbekistan — Discover, register, and manage events across Uzbekistan. From tech conferences to cultural festivals.' },
        { name: 'keywords', content: 'events, Uzbekistan, Tashkent, conferences, workshops, meetups, registration' },
        { property: 'og:title', content: 'EventHub Uzbekistan' },
        { property: 'og:description', content: 'Discover amazing events happening across Uzbekistan' },
        { property: 'og:type', content: 'website' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap' },
        { rel: 'stylesheet', href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css' }
      ]
    }
  },

  tailwindcss: {
    configPath: 'tailwind.config.js'
  },

  css: ['~/assets/css/main.css'],
})
