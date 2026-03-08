<script setup lang="ts">
withDefaults(
  defineProps<{
    compact?: boolean;
  }>(),
  {
    compact: false,
  },
);
</script>

<template>
  <NuxtLink to="/" class="inline-flex items-center gap-3 text-foreground transition hover:text-primary">
    <span class="flex size-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold tracking-[0.4em] text-primary">
      A
    </span>
    <span v-if="!compact" class="flex flex-col">
      <span class="text-lg font-semibold tracking-[0.24em] uppercase [font-family:var(--font-display)]">Almaz</span>
      <span class="text-[0.7rem] tracking-[0.28em] uppercase text-muted-foreground">Barbershop</span>
    </span>
  </NuxtLink>
</template>
