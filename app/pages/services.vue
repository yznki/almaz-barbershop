<script setup lang="ts">
import { Scissors } from "lucide-vue-next";
import { formatCurrency } from "../lib/formatters";

const publicApi = usePublicApi();
const { data: services, pending } = await publicApi.getServices();
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
    <AppSectionHeader
      eyebrow="Services"
      title="A concise menu with premium execution."
      description="Durations and pricing are clear up front so the booking decision stays easy."
    />

    <div v-if="pending" class="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <Skeleton v-for="index in 6" :key="index" class="h-48 rounded-[1.5rem]" />
    </div>

    <div v-else-if="services?.length" class="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <Card v-for="service in services" :key="service.id" class="border-border/70 bg-card/50">
        <CardHeader>
          <div class="flex items-start justify-between gap-4">
            <div>
              <CardTitle class="text-2xl">{{ service.name }}</CardTitle>
              <CardDescription class="mt-2">{{ service.duration_minutes }} minutes</CardDescription>
            </div>
            <Scissors class="size-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="flex items-end justify-between">
            <p class="text-sm leading-7 text-muted-foreground">Clean, detail-oriented service tailored to Almaz’s standard.</p>
            <p class="text-xl font-semibold text-primary">{{ formatCurrency(service.price) }}</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <AppEmptyState
      v-else
      title="No services available"
      description="Active services have not been published yet."
      :icon="Scissors"
      class="mt-10"
    />
  </section>
</template>
