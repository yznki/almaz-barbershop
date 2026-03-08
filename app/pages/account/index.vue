<script setup lang="ts">
import { CalendarClock, CalendarX2, Phone, Scissors, UserRound } from "lucide-vue-next";
import { formatDateTime } from "../../lib/formatters";

definePageMeta({
  middleware: "auth",
});

const session = useAuthSession();
const user = session.user;
const isAdmin = session.isAdmin;
type Appointment = {
  id: string;
  customer_name: string;
  customer_phone: string;
  barber_id: string;
  barber_name: string | null;
  service_id: string;
  service_name: string | null;
  start_at: string;
  end_at: string;
  status: string;
  notes: string | null;
};

const appointmentsEndpoint = isAdmin.value ? "/api/admin/appointments" : "/api/account/appointments";
const { data: appointments } = await useFetch<Appointment[]>(appointmentsEndpoint, {
  key: `account-appointments:${appointmentsEndpoint}`,
});

const upcomingAppointments = computed(() =>
  (appointments.value ?? []).filter((appointment) => new Date(appointment.start_at).getTime() >= Date.now()),
);
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
    <div class="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
      <Card class="h-fit border-border/70 bg-card/55">
        <CardContent class="space-y-2 p-5">
          <Button as-child variant="ghost" class="w-full justify-start rounded-xl">
            <NuxtLink to="/account">Overview</NuxtLink>
          </Button>
        </CardContent>
      </Card>

      <div class="space-y-6">
        <div class="space-y-2">
          <p class="text-xs tracking-[0.28em] uppercase text-primary">Account</p>
          <h1 class="text-3xl font-semibold text-foreground">{{ user?.fullName || user?.email }}</h1>
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <Card class="border-border/70 bg-card/50">
            <CardContent class="space-y-3 p-6">
              <CalendarClock class="size-5 text-primary" />
              <p class="text-sm text-muted-foreground">Upcoming appointments</p>
              <p class="text-3xl font-semibold text-foreground">{{ upcomingAppointments.length }}</p>
            </CardContent>
          </Card>
          <Card v-if="!isAdmin" class="border-border/70 bg-card/50">
            <CardContent class="space-y-3 p-6">
              <CalendarClock class="size-5 text-primary" />
              <p class="text-sm text-muted-foreground">Total appointments</p>
              <p class="text-3xl font-semibold text-foreground">{{ appointments?.length ?? 0 }}</p>
            </CardContent>
          </Card>
        </div>

        <div v-if="upcomingAppointments.length" class="grid gap-4">
          <Card v-for="appointment in upcomingAppointments" :key="appointment.id" class="border-border/70 bg-card/50">
            <CardContent class="space-y-4 p-5">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-lg font-medium text-foreground">{{ formatDateTime(appointment.start_at) }}</p>
                  <p class="mt-1 text-sm text-muted-foreground">
                    {{ isAdmin ? appointment.customer_name : appointment.service_name || "Appointment" }}
                  </p>
                </div>
                <Badge variant="outline" class="w-fit border-primary/30 capitalize text-primary">{{ appointment.status }}</Badge>
              </div>

              <div class="grid gap-3 rounded-2xl border border-border/70 bg-background/50 p-4 text-sm">
                <div class="flex items-center justify-between gap-4">
                  <div class="flex items-center gap-2 text-muted-foreground">
                    <Scissors class="size-4" />
                    <span>Service</span>
                  </div>
                  <span class="text-right text-foreground">{{ appointment.service_name || "Service" }}</span>
                </div>
                <div v-if="!isAdmin" class="flex items-center justify-between gap-4">
                  <div class="flex items-center gap-2 text-muted-foreground">
                    <UserRound class="size-4" />
                    <span>{{ isAdmin ? "Barber" : "With" }}</span>
                  </div>
                  <span class="text-right text-foreground">{{ appointment.barber_name || "Team" }}</span>
                </div>
                <div v-if="isAdmin" class="flex items-center justify-between gap-4">
                  <div class="flex items-center gap-2 text-muted-foreground">
                    <Phone class="size-4" />
                    <span>Phone</span>
                  </div>
                  <span class="text-right text-foreground">{{ appointment.customer_phone }}</span>
                </div>
                <div v-if="appointment.notes" class="border-t border-border/70 pt-3 text-muted-foreground">
                  {{ appointment.notes }}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <AppEmptyState
          v-else
          :title="isAdmin ? 'No upcoming appointments' : 'No appointments yet'"
          :description="
            isAdmin
              ? 'Upcoming appointments will appear here as customers book.'
              : 'Your upcoming and past bookings will appear here.'
          "
          :icon="CalendarX2"
        >
          <Button v-if="!isAdmin" as-child class="rounded-full bg-primary text-primary-foreground">
            <NuxtLink to="/book">Book an appointment</NuxtLink>
          </Button>
        </AppEmptyState>
      </div>
    </div>
  </section>
</template>
