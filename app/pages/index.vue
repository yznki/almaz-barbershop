<script setup lang="ts">
import { ArrowRight, CalendarClock, Gem, Quote, ShieldCheck, Sparkles, Users } from "lucide-vue-next";
import { formatCurrency } from "../lib/formatters";

definePageMeta({
  middleware: "landing",
});

const publicApi = usePublicApi();
const { data: services } = await publicApi.getServices();
const { data: barbers } = await publicApi.getBarbers();

const featuredServices = computed(() => (services.value ?? []).slice(0, 3));
const featuredBarbers = computed(() => (barbers.value ?? []).slice(0, 3));
const placeholderTestimonials = [
  {
    name: "Daniel K.",
    quote: "Sharp cut, calm room, no wasted time. Exactly what I want from a barbershop.",
  },
  {
    name: "Mikael R.",
    quote: "The whole experience feels considered. Clean work, easy booking, strong atmosphere.",
  },
  {
    name: "Luca S.",
    quote: "Minimal, premium, and consistent. The kind of place you want to keep returning to.",
  },
];
</script>

<template>
  <div>
    <section class="border-b border-border/60">
      <div class="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-18 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8 lg:py-28">
        <div class="max-w-3xl">
          <Badge variant="outline" class="border-primary/30 bg-primary/10 px-4 py-1.5 tracking-[0.28em] uppercase text-primary">
            Villach • Premium grooming
          </Badge>
          <h1 class="mt-6 text-4xl font-semibold leading-none text-foreground sm:text-5xl lg:text-7xl">
            Precision cuts, clean atmosphere, no wasted motion.
          </h1>
          <p class="mt-6 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Almaz is a black-first barbershop experience built around calm interiors, sharp barbering, and booking that takes minutes.
          </p>
          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button as-child size="lg" class="rounded-full bg-primary px-7 text-primary-foreground hover:bg-primary/90">
              <NuxtLink to="/book">
                Book now
                <ArrowRight class="size-4" />
              </NuxtLink>
            </Button>
            <Button as-child size="lg" variant="outline" class="rounded-full border-border/70 bg-card/50 px-7">
              <NuxtLink to="/services">Explore services</NuxtLink>
            </Button>
          </div>
          <div class="mt-10 grid gap-4 sm:grid-cols-3">
            <Card class="border-border/70 bg-card/45">
              <CardContent class="flex items-center gap-4 p-5">
                <CalendarClock class="size-5 text-primary" />
                <div>
                  <p class="text-sm font-medium text-foreground">Easy booking</p>
                  <p class="text-xs text-muted-foreground">Barber, service, date, done.</p>
                </div>
              </CardContent>
            </Card>
            <Card class="border-border/70 bg-card/45">
              <CardContent class="flex items-center gap-4 p-5">
                <Gem class="size-5 text-primary" />
                <div>
                  <p class="text-sm font-medium text-foreground">Premium standards</p>
                  <p class="text-xs text-muted-foreground">Refined space. Consistent work.</p>
                </div>
              </CardContent>
            </Card>
            <Card class="border-border/70 bg-card/45">
              <CardContent class="flex items-center gap-4 p-5">
                <ShieldCheck class="size-5 text-primary" />
                <div>
                  <p class="text-sm font-medium text-foreground">Straightforward</p>
                  <p class="text-xs text-muted-foreground">No clutter, no friction.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card class="border-primary/15 bg-card/70 shadow-[0_0_0_1px_rgba(201,172,109,0.06)]">
          <CardHeader class="border-b border-border/70 pb-6">
            <CardTitle class="text-2xl">Signature appointments</CardTitle>
            <CardDescription>Our most booked services, tailored for a clean and polished finish.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4 p-6">
            <div v-for="service in featuredServices" :key="service.id" class="rounded-2xl border border-border/70 bg-background/60 p-4">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-base font-medium text-foreground">{{ service.name }}</p>
                  <p class="mt-1 text-sm text-muted-foreground">{{ service.duration_minutes }} minutes</p>
                </div>
                <p class="text-sm font-medium text-primary">{{ formatCurrency(service.price) }}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
      <AppSectionHeader
        eyebrow="Services"
        title="Focused service menu, priced clearly."
        description="Everything is designed to keep the decision simple and the result sharp."
      />
      <div class="mt-8 grid gap-5 lg:grid-cols-3">
        <Card
          v-for="service in featuredServices"
          :key="service.id"
          class="border-border/70 bg-card/50 transition hover:border-primary/35 hover:bg-card"
        >
          <CardHeader>
            <CardTitle>{{ service.name }}</CardTitle>
            <CardDescription>{{ service.duration_minutes }} min</CardDescription>
          </CardHeader>
          <CardContent class="flex items-center justify-between">
            <p class="text-sm text-muted-foreground">Premium grooming service</p>
            <Badge variant="outline" class="border-primary/30 text-primary">{{ formatCurrency(service.price) }}</Badge>
          </CardContent>
        </Card>
      </div>
    </section>

    <section class="border-y border-border/60 bg-card/25">
      <div class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
        <AppSectionHeader
          eyebrow="Barbers"
          title="Experienced hands, restrained style."
          description="Meet the team currently available for booking."
        />
        <div class="mt-8 grid gap-5 md:grid-cols-3">
          <Card v-for="barber in featuredBarbers" :key="barber.id" class="border-border/70 bg-background/65">
            <CardContent class="flex items-center gap-4 p-6">
              <Avatar class="size-14 border border-primary/25">
                <AvatarFallback class="bg-primary/10 text-sm font-semibold text-primary">
                  {{ barber.name.slice(0, 2).toUpperCase() }}
                </AvatarFallback>
              </Avatar>
              <div>
                <p class="text-lg font-medium text-foreground">{{ barber.name }}</p>
                <p class="text-sm text-muted-foreground">Available for appointments</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
      <div class="grid gap-6 lg:grid-cols-3">
        <Card class="border-border/70 bg-card/45">
          <CardContent class="p-6">
            <Sparkles class="size-5 text-primary" />
            <p class="mt-4 text-lg font-medium text-foreground">Luxurious, not loud</p>
            <p class="mt-2 text-sm leading-7 text-muted-foreground">
              Dark surfaces, disciplined spacing, and a grooming experience that feels considered from start to finish.
            </p>
          </CardContent>
        </Card>
        <Card class="border-border/70 bg-card/45">
          <CardContent class="p-6">
            <Users class="size-5 text-primary" />
            <p class="mt-4 text-lg font-medium text-foreground">Built for repeat visits</p>
            <p class="mt-2 text-sm leading-7 text-muted-foreground">
              Customers can book quickly today and keep their account ready for future management as the backend grows.
            </p>
          </CardContent>
        </Card>
        <Card class="border-primary/20 bg-primary/10">
          <CardContent class="p-6">
            <p class="text-sm tracking-[0.28em] uppercase text-primary">Ready when you are</p>
            <p class="mt-3 text-2xl font-semibold text-foreground">Book your next appointment in a few taps.</p>
            <Button as-child class="mt-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              <NuxtLink to="/book">Start booking</NuxtLink>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>

    <section class="border-t border-border/60 bg-card/20">
      <div class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
        <AppSectionHeader
          eyebrow="Sample Testimonials"
          title="Placeholder review copy for the current demo."
          description="These testimonials are temporary sample content and should be replaced with real customer feedback before launch."
        />
        <div class="mt-8 grid gap-5 lg:grid-cols-3">
          <Card v-for="item in placeholderTestimonials" :key="item.name" class="border-border/70 bg-card/50">
            <CardContent class="p-6">
              <Quote class="size-5 text-primary" />
              <p class="mt-4 text-sm leading-7 text-muted-foreground">“{{ item.quote }}”</p>
              <p class="mt-5 text-sm font-medium text-foreground">{{ item.name }}</p>
              <p class="text-xs uppercase tracking-[0.24em] text-primary">Placeholder</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  </div>
</template>
