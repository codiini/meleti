// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxtjs/supabase", "@nuxthub/core"],
  compatibilityDate: "2024-08-30",
  hub: {
    blob: true,
    remote: true,
  },
  supabase: {
    redirect: false,
    redirectOptions: {
      login: "/auth/login",
      callback: "/auth/confirm",
    },
  },
});
