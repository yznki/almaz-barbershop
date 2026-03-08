<script setup lang="ts">
import { CalendarClock, Lock, UserRound } from "lucide-vue-next";

definePageMeta({
  middleware: "auth",
});

const session = useAuthSession();
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
    <div class="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
      <Card class="h-fit border-border/70 bg-card/55">
        <CardContent class="space-y-2 p-5">
          <Button as-child variant="ghost" class="w-full justify-start rounded-xl">
            <NuxtLink to="/account">Overview</NuxtLink>
          </Button>
          <Button as-child variant="ghost" class="w-full justify-start rounded-xl">
            <NuxtLink to="/account/appointments">Appointments</NuxtLink>
          </Button>
        </CardContent>
      </Card>

      <div class="space-y-6">
        <AppSectionHeader
          eyebrow="Account"
          title="Your Almaz account"
          description="Authentication is live. Customer appointment ownership is not yet linked in the backend, so management features are prepared but intentionally limited."
        />

        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Card class="border-border/70 bg-card/50">
            <CardContent class="space-y-3 p-6">
              <UserRound class="size-5 text-primary" />
              <p class="text-sm text-muted-foreground">Signed in as</p>
              <p class="text-lg font-medium text-foreground">{{ session.user?.email }}</p>
            </CardContent>
          </Card>
          <Card class="border-border/70 bg-card/50">
            <CardContent class="space-y-3 p-6">
              <CalendarClock class="size-5 text-primary" />
              <p class="text-sm text-muted-foreground">Appointments</p>
              <p class="text-lg font-medium text-foreground">Backend link pending</p>
            </CardContent>
          </Card>
          <Card class="border-border/70 bg-card/50">
            <CardContent class="space-y-3 p-6">
              <Lock class="size-5 text-primary" />
              <p class="text-sm text-muted-foreground">Access level</p>
              <p class="text-lg font-medium text-foreground">{{ session.role ?? "customer" }}</p>
            </CardContent>
          </Card>
        </div>

        <Card class="border-border/70 bg-card/50">
          <CardHeader>
            <CardTitle>Next step for customer self-management</CardTitle>
            <CardDescription>Current backend status</CardDescription>
          </CardHeader>
          <CardContent class="space-y-3 text-sm leading-7 text-muted-foreground">
            <p>Login and account access are working.</p>
            <p>Bookings are created publicly, but appointments are not currently attached to a customer user record in the database.</p>
            <p>Once that relation exists server-side, this account area can display upcoming and past appointments without changing the page structure.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>
