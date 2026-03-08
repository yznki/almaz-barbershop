// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  modules: ["shadcn-nuxt", "@nuxtjs/color-mode"],
  devtools: { enabled: true },
  vite: {
    plugins: [tailwindcss()],
  },
  css: ["./app/assets/css/tailwind.css"],
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
    },
  },
  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: "@/components/ui",
  },
  alias: {
    "@": "/app",
    "~": "/",
  },
  colorMode: {
    classSuffix: "",
  },
});
