<script setup lang="ts">
import { CalendarClock, Clock3, Scissors, ShieldBan, Users } from "lucide-vue-next";

definePageMeta({
  layout: "admin",
  middleware: "admin",
});

const adminApi = useAdminApi();
const [{ data: barbers }, { data: services }, { data: appointments }, { data: workingHours }, { data: blockedTimes }] = await Promise.all([
  adminApi.getBarbers(),
  adminApi.getServices(),
  adminApi.getAppointments(),
  adminApi.getWorkingHours(),
  adminApi.getBlockedTimes(),
]);

const stats = computed(() => [
  { label: "Barbers", value: barbers.value?.length ?? 0, icon: Users },
  { label: "Services", value: services.value?.length ?? 0, icon: Scissors },
  { label: "Appointments", value: appointments.value?.length ?? 0, icon: CalendarClock },
  { label: "Working hours", value: workingHours.value?.length ?? 0, icon: Clock3 },
  { label: "Blocked times", value: blockedTimes.value?.length ?? 0, icon: ShieldBan },
]);
</script>

<template>
  <div class="space-y-6">
    <AppAdminHeader title="Overview" description="A clean internal dashboard on top of the current admin API surface." />

    <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
      <Card v-for="stat in stats" :key="stat.label" class="border-border/70 bg-card/55">
        <CardContent class="space-y-3 p-5">
          <component :is="stat.icon" class="size-5 text-primary" />
          <p class="text-sm text-muted-foreground">{{ stat.label }}</p>
          <p class="text-3xl font-semibold text-foreground">{{ stat.value }}</p>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-5 xl:grid-cols-2">
      <Card class="border-border/70 bg-card/55">
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
          <CardDescription>Recent activity in the booking system.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <div
            v-for="appointment in (appointments ?? []).slice(0, 5)"
            :key="appointment.id"
            class="rounded-2xl border border-border/70 bg-background/60 p-4"
          >
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="font-medium text-foreground">{{ appointment.customer_name }}</p>
                <p class="text-sm text-muted-foreground">{{ appointment.customer_phone }}</p>
              </div>
              <Badge variant="outline" class="border-primary/30 text-primary">{{ appointment.status }}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="border-border/70 bg-card/55">
        <CardHeader>
          <CardTitle>At a glance</CardTitle>
          <CardDescription>Quick context for today’s shop operations.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>Use barbers and services to control what appears in the booking flow.</p>
          <p>Working hours define the weekly schedule, while blocked times handle exceptions and closures.</p>
          <p>Appointments can be reviewed here and updated as customers move through the day.</p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
