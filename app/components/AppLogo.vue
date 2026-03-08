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
    <span
      class="flex items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 px-2 py-1.5 text-primary"
      :class="compact ? 'h-11 w-14' : 'h-14 w-20'"
      aria-hidden="true"
    >
      <svg
        :width="compact ? 42 : 56"
        :height="compact ? 28 : 38"
        viewBox="0 0 120 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="overflow-visible"
      >
        <g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 25 L40 10 L80 10 L100 25" />
          <path d="M20 25 L40 25 L60 10 L80 25 L100 25" />
          <path d="M20 25 L60 70" />
          <path d="M40 25 L60 70" />
          <path d="M80 25 L60 70" />
          <path d="M100 25 L60 70" />
          <path d="M40 10 L60 10 L80 10" />
        </g>
      </svg>
    </span>
    <span v-if="!compact" class="flex flex-col">
      <span class="text-lg font-semibold tracking-[0.24em] uppercase [font-family:var(--font-display)]">Almaz</span>
      <span class="text-[0.7rem] tracking-[0.28em] uppercase text-muted-foreground">Barbershop</span>
    </span>
  </NuxtLink>
</template>
