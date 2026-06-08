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

  // Убираем devtools пока не заведемся
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
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
      apiBase: 'http://localhost:8080',
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