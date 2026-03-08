<template>
  <footer class="border-t border-border/60 bg-background/60">
    <div class="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
      <div class="space-y-4">
        <AppLogo />
        <p class="max-w-md text-sm leading-7 text-muted-foreground">
          Premium grooming, calm interiors, and sharp work without unnecessary noise.
        </p>
      </div>
      <div class="grid gap-3 text-sm text-muted-foreground">
        <NuxtLink to="/services" class="transition hover:text-primary">Services</NuxtLink>
        <NuxtLink to="/barbers" class="transition hover:text-primary">Barbers</NuxtLink>
        <NuxtLink to="/book" class="transition hover:text-primary">Book an appointment</NuxtLink>
      </div>
    </div>
  </footer>
</template>
