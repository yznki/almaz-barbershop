<script setup lang="ts">
import { CalendarCheck2, Clock3, Scissors, UserRound } from "lucide-vue-next";
import { z } from "zod";
import { toast } from "vue-sonner";
import type { Database, Tables } from "../types/database";
import { formatCurrency, formatLongDate, formatDateTime, getRequestErrorMessage } from "../lib/formatters";

const bookingSchema = z.object({
  barberId: z.string().min(1, "Choose a barber"),
  serviceId: z.string().min(1, "Choose a service"),
  date: z.string().min(1, "Choose a date"),
  startAt: z.string().min(1, "Choose a time slot"),
  customerName: z.string().trim().min(2, "Enter your name"),
  customerPhone: z.string().trim().min(5, "Enter your phone number"),
  notes: z.string().optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;
type AvailableSlot = Database["public"]["Functions"]["get_available_slots"]["Returns"][number];
type PublicAppointment = Tables<"appointments">;

const route = useRoute();
const publicApi = usePublicApi();
const session = useAuthSession();

const { data: barbers } = await publicApi.getBarbers();
const services = ref<Database["public"]["Tables"]["services"]["Row"][]>([]);

const form = reactive<BookingForm>({
  barberId: typeof route.query.barber === "string" ? route.query.barber : "",
  serviceId: typeof route.query.service === "string" ? route.query.service : "",
  date: "",
  startAt: "",
  customerName: session.user.value?.fullName ?? "",
  customerPhone: "",
  notes: "",
});

const fieldErrors = ref<Partial<Record<keyof BookingForm, string>>>({});
const bookingResult = ref<PublicAppointment | null>(null);
const submitting = ref(false);
const slots = ref<AvailableSlot[]>([]);
const slotsPending = ref(false);

const selectedBarber = computed(() => (barbers.value ?? []).find((barber) => barber.id === form.barberId) ?? null);
const selectedService = computed(() => services.value.find((service) => service.id === form.serviceId) ?? null);

watch(
  () => form.barberId,
  async (barberId, previousBarberId) => {
    if (barberId !== previousBarberId) {
      form.serviceId = "";
      form.startAt = "";
    }

    if (!barberId) {
      services.value = [];
      return;
    }

    services.value = await publicApi.getServices({ barberId });
  },
  { immediate: true },
);

watch(
  () => [form.barberId, form.serviceId, form.date],
  async ([barberId, serviceId, date], [previousBarberId, previousServiceId, previousDate]) => {
    if (barberId !== previousBarberId || serviceId !== previousServiceId || date !== previousDate) {
      form.startAt = "";
    }

    if (!barberId || !serviceId || !date) {
      slots.value = [];
      return;
    }

    slotsPending.value = true;

    try {
      slots.value = await publicApi.getAvailableSlots({
        barberId,
        serviceId,
        date,
      });
    } catch (error) {
      slots.value = [];
      toast.error(getRequestErrorMessage(error));
    } finally {
      slotsPending.value = false;
    }
  },
);

const selectSlot = (slotStart: string) => {
  form.startAt = slotStart;
  fieldErrors.value.startAt = "";
};

const submitBooking = async () => {
  const result = bookingSchema.safeParse(form);

  if (!result.success) {
    fieldErrors.value = Object.fromEntries(result.error.issues.map((issue) => [issue.path[0], issue.message])) as Partial<
      Record<keyof BookingForm, string>
    >;
    return;
  }

  fieldErrors.value = {};
  submitting.value = true;

  try {
    bookingResult.value = await publicApi.createAppointment({
      customerName: result.data.customerName,
      customerPhone: result.data.customerPhone,
      barberId: result.data.barberId,
      serviceId: result.data.serviceId,
      startAt: result.data.startAt,
      notes: result.data.notes || undefined,
    });
    toast.success("Appointment booked");
  } catch (error) {
    toast.error(getRequestErrorMessage(error));
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
      <div class="space-y-6">
        <AppSectionHeader
          eyebrow="Booking"
          title="Book an Almaz appointment"
          description="Choose your barber, service, and time in a few simple steps."
        />

        <Card v-if="!bookingResult" class="border-border/70 bg-card/50">
          <CardContent class="grid gap-6 p-6">
            <div class="grid gap-6 md:grid-cols-2">
              <div class="space-y-2">
                <Label for="barber">Barber</Label>
                <Select v-model="form.barberId">
                  <SelectTrigger id="barber" class="w-full rounded-xl">
                    <SelectValue placeholder="Choose barber" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="barber in barbers ?? []" :key="barber.id" :value="barber.id">{{ barber.name }}</SelectItem>
                  </SelectContent>
                </Select>
                <p v-if="fieldErrors.barberId" class="text-sm text-destructive">{{ fieldErrors.barberId }}</p>
              </div>

              <div class="space-y-2">
                <Label for="service">Service</Label>
                <Select v-model="form.serviceId">
                  <SelectTrigger id="service" class="w-full rounded-xl">
                    <SelectValue placeholder="Choose service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="service in services ?? []" :key="service.id" :value="service.id">
                      {{ service.name }} • {{ service.duration_minutes }} min
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p v-if="fieldErrors.serviceId" class="text-sm text-destructive">{{ fieldErrors.serviceId }}</p>
              </div>
            </div>

            <div class="space-y-2">
              <Label for="date">Date</Label>
              <Input id="date" v-model="form.date" type="date" class="rounded-xl" />
              <p v-if="fieldErrors.date" class="text-sm text-destructive">{{ fieldErrors.date }}</p>
            </div>

            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-foreground">Available slots</p>
                </div>
                <Spinner v-if="slotsPending" class="text-primary" />
              </div>

              <div v-if="form.barberId && form.serviceId && form.date" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <Button
                  v-for="slot in slots"
                  :key="slot.slot_start"
                  variant="outline"
                  class="h-12 rounded-xl border-border/70"
                  :class="form.startAt === slot.slot_start ? 'border-primary bg-primary/10 text-primary' : 'bg-background/60'"
                  @click="selectSlot(slot.slot_start)"
                >
                  {{ formatDateTime(slot.slot_start) }}
                </Button>
              </div>

              <AppEmptyState
                v-if="form.barberId && form.serviceId && form.date && !slotsPending && !slots.length"
                title="No available slots"
                description="Try another date, barber, or service."
                :icon="Clock3"
              />

              <p v-if="fieldErrors.startAt" class="text-sm text-destructive">{{ fieldErrors.startAt }}</p>
            </div>

            <Separator />

            <div class="grid gap-5 md:grid-cols-2">
              <div class="space-y-2">
                <Label for="customerName">Full name</Label>
                <Input id="customerName" v-model="form.customerName" class="rounded-xl" placeholder="Your name" />
                <p v-if="fieldErrors.customerName" class="text-sm text-destructive">{{ fieldErrors.customerName }}</p>
              </div>

              <div class="space-y-2">
                <Label for="customerPhone">Phone</Label>
                <Input id="customerPhone" v-model="form.customerPhone" class="rounded-xl" placeholder="+43 ..." />
                <p v-if="fieldErrors.customerPhone" class="text-sm text-destructive">{{ fieldErrors.customerPhone }}</p>
              </div>
            </div>

            <div class="space-y-2">
              <Label for="notes">Notes (optional)</Label>
              <Textarea id="notes" v-model="form.notes" class="min-h-24 rounded-xl" placeholder="Anything your barber should know" />
            </div>

            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-sm leading-7 text-muted-foreground">
                Want easier management later? Create an account after booking, or log in now.
              </p>
              <Button class="rounded-full bg-primary px-6 text-primary-foreground" :disabled="submitting" @click="submitBooking">
                {{ submitting ? "Booking..." : "Confirm booking" }}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card v-else class="border-primary/20 bg-primary/10">
          <CardContent class="space-y-6 p-8">
            <div class="inline-flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <CalendarCheck2 class="size-7" />
            </div>
            <div>
              <p class="text-xs tracking-[0.28em] uppercase text-primary">Confirmed</p>
              <h2 class="mt-3 text-3xl font-semibold text-foreground">Your appointment is booked.</h2>
              <p class="mt-3 text-sm leading-7 text-muted-foreground">We’ve saved your slot. You can keep this page for reference.</p>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
              <Card class="border-border/70 bg-background/75">
                <CardContent class="space-y-4 p-5">
                  <div class="flex items-center gap-3">
                    <UserRound class="size-4 text-primary" />
                    <div>
                      <p class="text-sm text-muted-foreground">Customer</p>
                      <p class="font-medium text-foreground">{{ bookingResult.customer_name }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <Scissors class="size-4 text-primary" />
                    <div>
                      <p class="text-sm text-muted-foreground">Appointment</p>
                      <p class="font-medium text-foreground">{{ selectedService?.name }}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card class="border-border/70 bg-background/75">
                <CardContent class="space-y-4 p-5">
                  <div class="flex items-center gap-3">
                    <CalendarCheck2 class="size-4 text-primary" />
                    <div>
                      <p class="text-sm text-muted-foreground">Date</p>
                      <p class="font-medium text-foreground">{{ formatLongDate(bookingResult.start_at) }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <Clock3 class="size-4 text-primary" />
                    <div>
                      <p class="text-sm text-muted-foreground">Time</p>
                      <p class="font-medium text-foreground">{{ formatDateTime(bookingResult.start_at) }}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div class="flex flex-col gap-3 sm:flex-row">
              <Button as-child class="rounded-full bg-primary text-primary-foreground">
                <NuxtLink to="/">Back to home</NuxtLink>
              </Button>
              <Button as-child variant="outline" class="rounded-full border-border/70">
                <NuxtLink to="/signup">Create account</NuxtLink>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="space-y-5">
        <Card class="border-border/70 bg-card/55">
          <CardHeader>
            <CardTitle>Booking summary</CardTitle>
            <CardDescription>Your selection updates as you progress.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="rounded-2xl border border-border/70 bg-background/60 p-4">
              <p class="text-sm text-muted-foreground">Barber</p>
              <p class="mt-2 text-base font-medium text-foreground">{{ selectedBarber?.name ?? "Not selected" }}</p>
            </div>
            <div class="rounded-2xl border border-border/70 bg-background/60 p-4">
              <p class="text-sm text-muted-foreground">Service</p>
              <p class="mt-2 text-base font-medium text-foreground">{{ selectedService?.name ?? "Not selected" }}</p>
              <p v-if="selectedService" class="mt-1 text-sm text-primary">
                {{ selectedService.duration_minutes }} min • {{ formatCurrency(selectedService.price) }}
              </p>
            </div>
            <div class="rounded-2xl border border-border/70 bg-background/60 p-4">
              <p class="text-sm text-muted-foreground">Date & time</p>
              <p class="mt-2 text-base font-medium text-foreground">
                {{ form.startAt ? formatDateTime(form.startAt) : form.date ? formatLongDate(form.date) : "Not selected" }}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card class="border-border/70 bg-card/55">
          <CardContent class="space-y-3 p-5 text-sm leading-7 text-muted-foreground sm:p-6">
            <p class="font-medium text-foreground">Customer account note</p>
            <p>
              The current backend supports authentication, but appointment ownership is not yet linked to customer accounts. Booking works
              today; full self-management can be enabled cleanly once the backend adds that relation.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>
