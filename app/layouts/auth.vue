<script setup lang="ts">
useHead({
  bodyAttrs: {
    class: "dark",
  },
});
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-background">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(180,152,92,0.18),transparent_32rem)]" />
    <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
    <div class="relative flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div class="mb-10">
        <AppLogo />
      </div>
      <div class="w-full max-w-md">
        <slot />
      </div>
    </div>
  </div>
</template>
