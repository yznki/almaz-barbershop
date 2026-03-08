<script setup lang="ts">
import { CalendarX2 } from "lucide-vue-next";

definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
    <AppSectionHeader
      eyebrow="Appointments"
      title="Appointment history will appear here"
      description="The backend currently does not associate appointments with customer accounts, so this page stays intentionally disabled instead of showing inaccurate data."
    />

    <AppEmptyState
      class="mt-10"
      title="Appointment management is not linked yet"
      description="Public booking works today. Customer-owned upcoming and past appointment views can be enabled once the database models that relation."
      :icon="CalendarX2"
    >
      <div class="flex flex-col gap-3 sm:flex-row">
        <Button as-child class="rounded-full bg-primary text-primary-foreground">
          <NuxtLink to="/book">Book an appointment</NuxtLink>
        </Button>
        <Button as-child variant="outline" class="rounded-full border-border/70">
          <NuxtLink to="/account">Back to account</NuxtLink>
        </Button>
      </div>
    </AppEmptyState>
  </section>
</template>
