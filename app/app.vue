<script setup lang="ts">
import "vue-sonner/style.css";
import { Toaster } from "./components/ui/sonner";

useHead({
  titleTemplate: (titleChunk) => (titleChunk ? `${titleChunk} | Almaz` : "Almaz"),
  link: [
    { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  ],
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ClientOnly>
    <Toaster theme="dark" rich-colors position="top-right" />
  </ClientOnly>
</template>
