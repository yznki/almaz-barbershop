<script setup lang="ts">
useHead({
  bodyAttrs: {
    class: "dark",
  },
});
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <AppPublicHeader />
    <main>
      <slot />
    </main>
    <AppPublicFooter />
  </div>
</template>
