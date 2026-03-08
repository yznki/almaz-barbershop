<script setup lang="ts">
import { Users } from "lucide-vue-next";

const publicApi = usePublicApi();
const { data: barbers, pending } = await publicApi.getBarbers();
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
    <AppSectionHeader
      eyebrow="Barbers"
      title="A focused team, available for booking."
      description="Choose your barber and continue directly into appointment selection."
    />

    <div v-if="pending" class="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <Skeleton v-for="index in 6" :key="index" class="h-40 rounded-[1.5rem]" />
    </div>

    <div v-else-if="barbers?.length" class="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <Card v-for="barber in barbers" :key="barber.id" class="border-border/70 bg-card/50">
        <CardContent class="flex items-center gap-5 p-6">
          <Avatar class="size-16 border border-primary/25">
            <AvatarFallback class="bg-primary/10 text-sm font-semibold text-primary">{{ barber.name.slice(0, 2).toUpperCase() }}</AvatarFallback>
          </Avatar>
          <div>
            <p class="text-xl font-medium text-foreground">{{ barber.name }}</p>
            <p class="mt-1 text-sm text-muted-foreground">Available for appointments</p>
            <Button as-child variant="link" class="mt-3 h-auto px-0 text-primary">
              <NuxtLink :to="`/book?barber=${barber.id}`">Book with {{ barber.name }}</NuxtLink>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <AppEmptyState
      v-else
      title="No barbers available"
      description="Active team members have not been published yet."
      :icon="Users"
      class="mt-10"
    />
  </section>
</template>
