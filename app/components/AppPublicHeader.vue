<script setup lang="ts">
import { Menu } from "lucide-vue-next";

const session = useAuthSession();

const links = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/barbers", label: "Barbers" },
  { to: "/book", label: "Book" },
];
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
      <AppLogo />

      <nav class="hidden items-center gap-1 md:flex">
        <Button
          v-for="link in links"
          :key="link.to"
          as-child
          variant="ghost"
          class="rounded-full px-4 text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground"
        >
          <NuxtLink :to="link.to">{{ link.label }}</NuxtLink>
        </Button>
      </nav>

      <div class="hidden items-center gap-3 md:flex">
        <AppUserMenu v-if="session.authenticated" />
        <template v-else>
          <Button as-child variant="ghost" class="rounded-full text-muted-foreground">
            <NuxtLink to="/login">Login</NuxtLink>
          </Button>
          <Button as-child class="rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90">
            <NuxtLink to="/book">Book now</NuxtLink>
          </Button>
        </template>
      </div>

      <Sheet>
        <SheetTrigger as-child>
          <Button variant="outline" size="icon" class="md:hidden">
            <Menu class="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" class="border-border/70 bg-background/95 px-6">
          <SheetHeader class="pb-6">
            <SheetTitle class="text-left">
              <AppLogo compact />
            </SheetTitle>
          </SheetHeader>
          <div class="space-y-3">
            <Button
              v-for="link in links"
              :key="link.to"
              as-child
              variant="ghost"
              class="w-full justify-start rounded-xl py-6 text-base"
            >
              <NuxtLink :to="link.to">{{ link.label }}</NuxtLink>
            </Button>
          </div>
          <Separator class="my-6" />
          <div class="space-y-3">
            <AppUserMenu v-if="session.authenticated" />
            <template v-else>
              <Button as-child variant="outline" class="w-full rounded-xl">
                <NuxtLink to="/login">Login</NuxtLink>
              </Button>
              <Button as-child class="w-full rounded-xl bg-primary text-primary-foreground">
                <NuxtLink to="/book">Book now</NuxtLink>
              </Button>
            </template>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  </header>
</template>
