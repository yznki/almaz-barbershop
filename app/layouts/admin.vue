<script setup lang="ts">
import { CalendarClock, Clock3, LayoutDashboard, Scissors, Shield, Users } from "lucide-vue-next";

useHead({
  bodyAttrs: {
    class: "dark",
  },
});

const links = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/barbers", label: "Barbers", icon: Users },
  { to: "/admin/services", label: "Services", icon: Scissors },
  { to: "/admin/appointments", label: "Appointments", icon: CalendarClock },
  { to: "/admin/working-hours", label: "Working hours", icon: Clock3 },
  { to: "/admin/blocked-times", label: "Blocked times", icon: Shield },
];
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8 lg:px-8 lg:py-6">
      <aside class="rounded-[1.75rem] border border-border/70 bg-card/55 p-4 backdrop-blur lg:p-5">
        <div class="flex items-center justify-between gap-4">
          <AppLogo compact />
          <Badge variant="outline" class="border-primary/30 text-primary">Admin</Badge>
        </div>
        <nav class="mt-6 grid grid-cols-2 gap-2 lg:mt-8 lg:grid-cols-1 lg:space-y-2 lg:gap-0">
          <Button
            v-for="link in links"
            :key="link.to"
            as-child
            variant="ghost"
            class="h-11 w-full justify-start rounded-xl px-3 text-sm lg:px-4"
          >
            <NuxtLink :to="link.to" class="flex items-center gap-3">
              <component :is="link.icon" class="size-4" />
              {{ link.label }}
            </NuxtLink>
          </Button>
        </nav>
        <div class="mt-6 border-t border-border/70 pt-4 lg:mt-8 lg:pt-5">
          <AppUserMenu />
        </div>
      </aside>

      <div class="space-y-6">
        <slot />
      </div>
    </div>
  </div>
</template>
