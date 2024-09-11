// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxtjs/supabase"],
  nitro: {
    preset: "cloudflare-pages",
  },
  compatibilityDate: "2024-08-30",
  supabase: {
    redirect: false,
    redirectOptions: {
      login: "/auth/login",
      callback: "/auth/confirm",
    },
  },
});
