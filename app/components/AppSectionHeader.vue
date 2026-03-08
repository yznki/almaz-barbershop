<script setup lang="ts">
defineProps<{
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}>();
</script>

<template>
  <div :class="align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'">
    <p v-if="eyebrow" class="mb-3 text-xs font-medium tracking-[0.32em] uppercase text-primary">{{ eyebrow }}</p>
    <h2 class="text-3xl font-semibold text-foreground sm:text-4xl">{{ title }}</h2>
    <p v-if="description" class="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">{{ description }}</p>
  </div>
</template>
