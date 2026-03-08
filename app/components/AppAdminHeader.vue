<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div class="max-w-2xl">
      <p class="text-xs tracking-[0.28em] uppercase text-primary">Admin</p>
      <h1 class="mt-2 text-3xl font-semibold text-foreground">{{ title }}</h1>
      <p v-if="description" class="mt-3 text-sm leading-7 text-muted-foreground">{{ description }}</p>
    </div>
    <slot />
  </div>
</template>
