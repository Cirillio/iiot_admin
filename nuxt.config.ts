export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  // Убираем devtools пока не заведемся
  devtools: { enabled: true },

  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxt/ui",
    "@nuxt/icon",
  ],

  runtimeConfig: {
    public: {
      apiBase: "http://localhost:8080",
    },
  },

  icon: {
    serverBundle: "local",
  },

  css: ["./assets/style.css"],

  routeRules: {
    "/**": {
      ssr: false,
    },
  },

  fonts: {
    providers: {
      fontsource: false,
    },
  },
});
