export default defineNuxtConfig({
  app: {
    head: {
      link: [
        {
          rel: 'icon',
          type: 'image/png',
          href: '/favicon.png',
        },
      ],
    },
  },

  compatibilityDate: '2025-07-15',

  devtools: {
    enabled: process.env.NODE_ENV !== 'production',
    timeline: {
      enabled: process.env.NODE_ENV !== 'production',
    },
  },

  modules: [
    '@nuxt/eslint',
    'nuxt-charts',
    '@nuxt/image',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/ui',
    '@nuxt/icon',
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080',
      appVersion: '1.4.2',
      appEnv: process.env.NODE_ENV === 'production' ? 'Production' : 'Development',
    },
  },

  icon: {
    serverBundle: 'local',
  },

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
  },

  css: ['./assets/style.css'],

  routeRules: {
    '/**': {
      ssr: false,
    },
  },

  fonts: {
    providers: {
      fontsource: false,
    },
  },
})