<script setup lang="ts">
import type { Component } from "vue";

defineProps<{
  title: string;
  description: string;
  icon?: Component;
}>();
</script>

<template>
  <Empty class="border border-dashed border-border/70 bg-card/40">
    <component :is="icon" v-if="icon" class="size-10 text-primary" />
    <EmptyHeader>
      <EmptyTitle>{{ title }}</EmptyTitle>
      <EmptyDescription>{{ description }}</EmptyDescription>
    </EmptyHeader>
    <slot />
  </Empty>
</template>
