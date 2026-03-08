<script setup lang="ts">
definePageMeta({
  layout: false,
});

const publicApi = usePublicApi();
const adminApi = useAdminApi();

type IdName = {
  id: string;
  name: string;
};

const activeTab = ref<"public" | "admin">("public");

const publicBarbers = ref<any[]>([]);
const publicServices = ref<any[]>([]);
const publicSlots = ref<any[]>([]);
const publicLoading = ref(false);
const publicError = ref("");

const bookingForm = reactive({
  customerName: "",
  customerPhone: "",
  barberId: "",
  serviceId: "",
  date: "",
  startAt: "",
  notes: "",
});

const bookingResult = ref<any | null>(null);

const adminBarbers = ref<any[]>([]);
const adminServices = ref<any[]>([]);
const adminAppointments = ref<any[]>([]);
const adminWorkingHours = ref<any[]>([]);
const adminBlockedTimes = ref<any[]>([]);

const adminLoading = ref(false);
const adminError = ref("");
const adminResult = ref<any | null>(null);

const barberForm = reactive({
  name: "",
  active: true,
});

const serviceForm = reactive({
  name: "",
  durationMinutes: 30,
  price: 15,
  active: true,
});

const workingHoursForm = reactive({
  barberId: "",
  dayOfWeek: 1,
  startTime: "09:00",
  endTime: "17:00",
});

const blockedTimeForm = reactive({
  barberId: "",
  startAt: "",
  endAt: "",
  reason: "",
});

const appointmentUpdateForm = reactive({
  appointmentId: "",
  status: "booked",
  notes: "",
});

const barberOptions = computed<IdName[]>(() =>
  (adminBarbers.value.length ? adminBarbers.value : publicBarbers.value).map((barber: any) => ({
    id: barber.id,
    name: barber.name,
  })),
);

const serviceOptions = computed<IdName[]>(() =>
  (adminServices.value.length ? adminServices.value : publicServices.value).map((service: any) => ({
    id: service.id,
    name: service.name,
  })),
);

const slotOptions = computed(() =>
  publicSlots.value.map((slot: any) => ({
    label: `${formatDateTime(slot.slot_start)} → ${formatDateTime(slot.slot_end)}`,
    value: slot.slot_start,
  })),
);

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function clearPublicState() {
  publicError.value = "";
  bookingResult.value = null;
}

function clearAdminState() {
  adminError.value = "";
  adminResult.value = null;
}

async function loadPublicBarbers() {
  clearPublicState();
  publicLoading.value = true;

  try {
    const { data, error } = await publicApi.getBarbers();
    if (error.value) throw error.value;
    publicBarbers.value = data.value ?? [];
  } catch (error: any) {
    publicError.value = error?.message || "Failed to load public barbers";
  } finally {
    publicLoading.value = false;
  }
}

async function loadPublicServices() {
  clearPublicState();
  publicLoading.value = true;

  try {
    const { data, error } = await publicApi.getServices();
    if (error.value) throw error.value;
    publicServices.value = data.value ?? [];
  } catch (error: any) {
    publicError.value = error?.message || "Failed to load public services";
  } finally {
    publicLoading.value = false;
  }
}

async function loadAvailableSlots() {
  clearPublicState();

  if (!bookingForm.barberId || !bookingForm.serviceId || !bookingForm.date) {
    publicError.value = "Pick barber, service, and date first.";
    return;
  }

  publicLoading.value = true;

  try {
    const { data, error } = await publicApi.getAvailableSlots({
      barberId: bookingForm.barberId,
      serviceId: bookingForm.serviceId,
      date: bookingForm.date,
    });

    if (error.value) throw error.value;

    publicSlots.value = data.value ?? [];
    if (!publicSlots.value.length) {
      bookingForm.startAt = "";
    }
  } catch (error: any) {
    publicError.value = error?.message || "Failed to load available slots";
  } finally {
    publicLoading.value = false;
  }
}

async function submitAppointment() {
  clearPublicState();

  if (!bookingForm.startAt) {
    publicError.value = "Choose a slot first.";
    return;
  }

  publicLoading.value = true;

  try {
    const result = await publicApi.createAppointment({
      customerName: bookingForm.customerName,
      customerPhone: bookingForm.customerPhone,
      barberId: bookingForm.barberId,
      serviceId: bookingForm.serviceId,
      startAt: bookingForm.startAt,
      notes: bookingForm.notes || undefined,
    });

    bookingResult.value = result;
  } catch (error: any) {
    publicError.value = error?.data?.statusMessage || error?.statusMessage || error?.message || "Failed to create appointment";
  } finally {
    publicLoading.value = false;
  }
}

async function loadAdminBarbers() {
  clearAdminState();
  adminLoading.value = true;

  try {
    const { data, error } = await adminApi.getBarbers();
    if (error.value) throw error.value;
    adminBarbers.value = data.value ?? [];
  } catch (error: any) {
    adminError.value = error?.message || "Failed to load admin barbers";
  } finally {
    adminLoading.value = false;
  }
}

async function createBarber() {
  clearAdminState();
  adminLoading.value = true;

  try {
    adminResult.value = await adminApi.createBarber({
      name: barberForm.name,
      active: barberForm.active,
    });
    barberForm.name = "";
    barberForm.active = true;
    await loadAdminBarbers();
  } catch (error: any) {
    adminError.value = error?.data?.statusMessage || error?.statusMessage || error?.message || "Failed to create barber";
  } finally {
    adminLoading.value = false;
  }
}

async function toggleBarber(barber: any) {
  clearAdminState();
  adminLoading.value = true;

  try {
    adminResult.value = await adminApi.updateBarber(barber.id, {
      active: !barber.active,
    });
    await loadAdminBarbers();
  } catch (error: any) {
    adminError.value = error?.data?.statusMessage || error?.statusMessage || error?.message || "Failed to update barber";
  } finally {
    adminLoading.value = false;
  }
}

async function removeBarber(id: string) {
  clearAdminState();
  adminLoading.value = true;

  try {
    adminResult.value = await adminApi.deleteBarber(id);
    await loadAdminBarbers();
  } catch (error: any) {
    adminError.value = error?.data?.statusMessage || error?.statusMessage || error?.message || "Failed to delete barber";
  } finally {
    adminLoading.value = false;
  }
}

async function loadAdminServices() {
  clearAdminState();
  adminLoading.value = true;

  try {
    const { data, error } = await adminApi.getServices();
    if (error.value) throw error.value;
    adminServices.value = data.value ?? [];
  } catch (error: any) {
    adminError.value = error?.message || "Failed to load admin services";
  } finally {
    adminLoading.value = false;
  }
}

async function createService() {
  clearAdminState();
  adminLoading.value = true;

  try {
    adminResult.value = await adminApi.createService({
      name: serviceForm.name,
      durationMinutes: Number(serviceForm.durationMinutes),
      price: Number(serviceForm.price),
      active: serviceForm.active,
    });
    serviceForm.name = "";
    serviceForm.durationMinutes = 30;
    serviceForm.price = 15;
    serviceForm.active = true;
    await loadAdminServices();
  } catch (error: any) {
    adminError.value = error?.data?.statusMessage || error?.statusMessage || error?.message || "Failed to create service";
  } finally {
    adminLoading.value = false;
  }
}

async function toggleService(service: any) {
  clearAdminState();
  adminLoading.value = true;

  try {
    adminResult.value = await adminApi.updateService(service.id, {
      active: !service.active,
    });
    await loadAdminServices();
  } catch (error: any) {
    adminError.value = error?.data?.statusMessage || error?.statusMessage || error?.message || "Failed to update service";
  } finally {
    adminLoading.value = false;
  }
}

async function removeService(id: string) {
  clearAdminState();
  adminLoading.value = true;

  try {
    adminResult.value = await adminApi.deleteService(id);
    await loadAdminServices();
  } catch (error: any) {
    adminError.value = error?.data?.statusMessage || error?.statusMessage || error?.message || "Failed to delete service";
  } finally {
    adminLoading.value = false;
  }
}

async function loadAppointments() {
  clearAdminState();
  adminLoading.value = true;

  try {
    const { data, error } = await adminApi.getAppointments();
    if (error.value) throw error.value;
    adminAppointments.value = data.value ?? [];
  } catch (error: any) {
    adminError.value = error?.message || "Failed to load appointments";
  } finally {
    adminLoading.value = false;
  }
}

async function updateAppointment() {
  clearAdminState();

  if (!appointmentUpdateForm.appointmentId) {
    adminError.value = "Select an appointment first.";
    return;
  }

  adminLoading.value = true;

  try {
    adminResult.value = await adminApi.updateAppointment(appointmentUpdateForm.appointmentId, {
      status: appointmentUpdateForm.status as any,
      notes: appointmentUpdateForm.notes || null,
    });
    await loadAppointments();
  } catch (error: any) {
    adminError.value = error?.data?.statusMessage || error?.statusMessage || error?.message || "Failed to update appointment";
  } finally {
    adminLoading.value = false;
  }
}

async function loadWorkingHours() {
  clearAdminState();
  adminLoading.value = true;

  try {
    const { data, error } = await adminApi.getWorkingHours();
    if (error.value) throw error.value;
    adminWorkingHours.value = data.value ?? [];
  } catch (error: any) {
    adminError.value = error?.message || "Failed to load working hours";
  } finally {
    adminLoading.value = false;
  }
}

async function createWorkingHours() {
  clearAdminState();
  adminLoading.value = true;

  try {
    adminResult.value = await adminApi.createWorkingHours({
      barberId: workingHoursForm.barberId,
      dayOfWeek: Number(workingHoursForm.dayOfWeek),
      startTime: workingHoursForm.startTime,
      endTime: workingHoursForm.endTime,
    });
    await loadWorkingHours();
  } catch (error: any) {
    adminError.value = error?.data?.statusMessage || error?.statusMessage || error?.message || "Failed to create working hours";
  } finally {
    adminLoading.value = false;
  }
}

async function removeWorkingHours(id: string) {
  clearAdminState();
  adminLoading.value = true;

  try {
    adminResult.value = await adminApi.deleteWorkingHours(id);
    await loadWorkingHours();
  } catch (error: any) {
    adminError.value = error?.data?.statusMessage || error?.statusMessage || error?.message || "Failed to delete working hours";
  } finally {
    adminLoading.value = false;
  }
}

async function loadBlockedTimes() {
  clearAdminState();
  adminLoading.value = true;

  try {
    const { data, error } = await adminApi.getBlockedTimes();
    if (error.value) throw error.value;
    adminBlockedTimes.value = data.value ?? [];
  } catch (error: any) {
    adminError.value = error?.message || "Failed to load blocked times";
  } finally {
    adminLoading.value = false;
  }
}

async function createBlockedTime() {
  clearAdminState();
  adminLoading.value = true;

  try {
    adminResult.value = await adminApi.createBlockedTime({
      barberId: blockedTimeForm.barberId,
      startAt: blockedTimeForm.startAt,
      endAt: blockedTimeForm.endAt,
      reason: blockedTimeForm.reason || null,
    });
    await loadBlockedTimes();
  } catch (error: any) {
    adminError.value = error?.data?.statusMessage || error?.statusMessage || error?.message || "Failed to create blocked time";
  } finally {
    adminLoading.value = false;
  }
}

async function removeBlockedTime(id: string) {
  clearAdminState();
  adminLoading.value = true;

  try {
    adminResult.value = await adminApi.deleteBlockedTime(id);
    await loadBlockedTimes();
  } catch (error: any) {
    adminError.value = error?.data?.statusMessage || error?.statusMessage || error?.message || "Failed to delete blocked time";
  } finally {
    adminLoading.value = false;
  }
}

async function loadEverything() {
  await Promise.all([
    loadPublicBarbers(),
    loadPublicServices(),
    loadAdminBarbers(),
    loadAdminServices(),
    loadAppointments(),
    loadWorkingHours(),
    loadBlockedTimes(),
  ]);
}

onMounted(loadEverything);
</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-white">
    <div class="mx-auto max-w-7xl p-6">
      <div class="mb-8">
        <h1 class="text-3xl font-bold">Backend Test Page</h1>
        <p class="mt-2 text-sm text-zinc-400">Quick manual page to test public and admin endpoints.</p>
      </div>

      <div class="mb-6 flex gap-3">
        <button
          class="rounded-lg px-4 py-2 text-sm font-medium"
          :class="activeTab === 'public' ? 'bg-white text-black' : 'bg-zinc-800 text-white'"
          @click="activeTab = 'public'"
        >
          Public API
        </button>
        <button
          class="rounded-lg px-4 py-2 text-sm font-medium"
          :class="activeTab === 'admin' ? 'bg-white text-black' : 'bg-zinc-800 text-white'"
          @click="activeTab = 'admin'"
        >
          Admin API
        </button>
        <button class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white" @click="loadEverything">Reload All</button>
      </div>

      <div v-if="activeTab === 'public'" class="grid gap-6 lg:grid-cols-2">
        <section class="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 class="mb-4 text-xl font-semibold">Public Reads</h2>

          <div class="mb-4 flex flex-wrap gap-3">
            <button class="rounded-lg bg-zinc-800 px-3 py-2 text-sm" @click="loadPublicBarbers">Load Barbers</button>
            <button class="rounded-lg bg-zinc-800 px-3 py-2 text-sm" @click="loadPublicServices">Load Services</button>
            <button class="rounded-lg bg-zinc-800 px-3 py-2 text-sm" @click="loadAvailableSlots">Load Slots</button>
          </div>

          <div v-if="publicLoading" class="mb-4 text-sm text-zinc-400">Loading...</div>
          <div v-if="publicError" class="mb-4 rounded-lg bg-red-950 p-3 text-sm text-red-300">
            {{ publicError }}
          </div>

          <div class="space-y-4">
            <div>
              <h3 class="mb-2 font-medium">Barbers</h3>
              <pre class="overflow-auto rounded-lg bg-black/40 p-3 text-xs">{{ publicBarbers }}</pre>
            </div>

            <div>
              <h3 class="mb-2 font-medium">Services</h3>
              <pre class="overflow-auto rounded-lg bg-black/40 p-3 text-xs">{{ publicServices }}</pre>
            </div>

            <div>
              <h3 class="mb-2 font-medium">Slots</h3>
              <pre class="overflow-auto rounded-lg bg-black/40 p-3 text-xs">{{ publicSlots }}</pre>
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 class="mb-4 text-xl font-semibold">Public Booking Test</h2>

          <div class="grid gap-4">
            <label class="grid gap-1">
              <span class="text-sm text-zinc-300">Customer name</span>
              <input v-model="bookingForm.customerName" class="rounded-lg bg-zinc-800 px-3 py-2 outline-none" />
            </label>

            <label class="grid gap-1">
              <span class="text-sm text-zinc-300">Customer phone</span>
              <input v-model="bookingForm.customerPhone" class="rounded-lg bg-zinc-800 px-3 py-2 outline-none" />
            </label>

            <label class="grid gap-1">
              <span class="text-sm text-zinc-300">Barber</span>
              <select v-model="bookingForm.barberId" class="rounded-lg bg-zinc-800 px-3 py-2 outline-none">
                <option value="">Select barber</option>
                <option v-for="barber in barberOptions" :key="barber.id" :value="barber.id">
                  {{ barber.name }}
                </option>
              </select>
            </label>

            <label class="grid gap-1">
              <span class="text-sm text-zinc-300">Service</span>
              <select v-model="bookingForm.serviceId" class="rounded-lg bg-zinc-800 px-3 py-2 outline-none">
                <option value="">Select service</option>
                <option v-for="service in serviceOptions" :key="service.id" :value="service.id">
                  {{ service.name }}
                </option>
              </select>
            </label>

            <label class="grid gap-1">
              <span class="text-sm text-zinc-300">Date</span>
              <input v-model="bookingForm.date" type="date" class="rounded-lg bg-zinc-800 px-3 py-2 outline-none" />
            </label>

            <button class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium" @click="loadAvailableSlots">Fetch available slots</button>

            <label class="grid gap-1">
              <span class="text-sm text-zinc-300">Slot</span>
              <select v-model="bookingForm.startAt" class="rounded-lg bg-zinc-800 px-3 py-2 outline-none">
                <option value="">Select slot</option>
                <option v-for="slot in slotOptions" :key="slot.value" :value="slot.value">
                  {{ slot.label }}
                </option>
              </select>
            </label>

            <label class="grid gap-1">
              <span class="text-sm text-zinc-300">Notes</span>
              <textarea v-model="bookingForm.notes" rows="3" class="rounded-lg bg-zinc-800 px-3 py-2 outline-none" />
            </label>

            <button class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium" @click="submitAppointment">Create appointment</button>
          </div>

          <div v-if="bookingResult" class="mt-6">
            <h3 class="mb-2 font-medium">Booking result</h3>
            <pre class="overflow-auto rounded-lg bg-black/40 p-3 text-xs">{{ bookingResult }}</pre>
          </div>
        </section>
      </div>

      <div v-else class="grid gap-6 lg:grid-cols-2">
        <section class="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 class="mb-4 text-xl font-semibold">Admin CRUD</h2>

          <div v-if="adminLoading" class="mb-4 text-sm text-zinc-400">Loading...</div>
          <div v-if="adminError" class="mb-4 rounded-lg bg-red-950 p-3 text-sm text-red-300">
            {{ adminError }}
          </div>

          <div class="grid gap-6">
            <div class="rounded-xl bg-zinc-950/60 p-4">
              <h3 class="mb-3 font-medium">Create Barber</h3>
              <div class="grid gap-3">
                <input v-model="barberForm.name" placeholder="Barber name" class="rounded-lg bg-zinc-800 px-3 py-2" />
                <label class="flex items-center gap-2 text-sm">
                  <input v-model="barberForm.active" type="checkbox" />
                  Active
                </label>
                <button class="rounded-lg bg-zinc-800 px-3 py-2 text-sm" @click="createBarber">Create barber</button>
              </div>
            </div>

            <div class="rounded-xl bg-zinc-950/60 p-4">
              <h3 class="mb-3 font-medium">Create Service</h3>
              <div class="grid gap-3">
                <input v-model="serviceForm.name" placeholder="Service name" class="rounded-lg bg-zinc-800 px-3 py-2" />
                <input
                  v-model.number="serviceForm.durationMinutes"
                  type="number"
                  placeholder="Duration"
                  class="rounded-lg bg-zinc-800 px-3 py-2"
                />
                <input
                  v-model.number="serviceForm.price"
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  class="rounded-lg bg-zinc-800 px-3 py-2"
                />
                <label class="flex items-center gap-2 text-sm">
                  <input v-model="serviceForm.active" type="checkbox" />
                  Active
                </label>
                <button class="rounded-lg bg-zinc-800 px-3 py-2 text-sm" @click="createService">Create service</button>
              </div>
            </div>

            <div class="rounded-xl bg-zinc-950/60 p-4">
              <h3 class="mb-3 font-medium">Create Working Hours</h3>
              <div class="grid gap-3">
                <select v-model="workingHoursForm.barberId" class="rounded-lg bg-zinc-800 px-3 py-2">
                  <option value="">Select barber</option>
                  <option v-for="barber in barberOptions" :key="barber.id" :value="barber.id">
                    {{ barber.name }}
                  </option>
                </select>
                <input v-model.number="workingHoursForm.dayOfWeek" type="number" min="0" max="6" class="rounded-lg bg-zinc-800 px-3 py-2" />
                <input v-model="workingHoursForm.startTime" type="time" class="rounded-lg bg-zinc-800 px-3 py-2" />
                <input v-model="workingHoursForm.endTime" type="time" class="rounded-lg bg-zinc-800 px-3 py-2" />
                <button class="rounded-lg bg-zinc-800 px-3 py-2 text-sm" @click="createWorkingHours">Create working hours</button>
              </div>
            </div>

            <div class="rounded-xl bg-zinc-950/60 p-4">
              <h3 class="mb-3 font-medium">Create Blocked Time</h3>
              <div class="grid gap-3">
                <select v-model="blockedTimeForm.barberId" class="rounded-lg bg-zinc-800 px-3 py-2">
                  <option value="">Select barber</option>
                  <option v-for="barber in barberOptions" :key="barber.id" :value="barber.id">
                    {{ barber.name }}
                  </option>
                </select>
                <input v-model="blockedTimeForm.startAt" type="datetime-local" class="rounded-lg bg-zinc-800 px-3 py-2" />
                <input v-model="blockedTimeForm.endAt" type="datetime-local" class="rounded-lg bg-zinc-800 px-3 py-2" />
                <input v-model="blockedTimeForm.reason" placeholder="Reason" class="rounded-lg bg-zinc-800 px-3 py-2" />
                <button class="rounded-lg bg-zinc-800 px-3 py-2 text-sm" @click="createBlockedTime">Create blocked time</button>
              </div>
            </div>

            <div class="rounded-xl bg-zinc-950/60 p-4">
              <h3 class="mb-3 font-medium">Update Appointment</h3>
              <div class="grid gap-3">
                <select v-model="appointmentUpdateForm.appointmentId" class="rounded-lg bg-zinc-800 px-3 py-2">
                  <option value="">Select appointment</option>
                  <option v-for="appointment in adminAppointments" :key="appointment.id" :value="appointment.id">
                    {{ appointment.customer_name }} — {{ formatDateTime(appointment.start_at) }}
                  </option>
                </select>

                <select v-model="appointmentUpdateForm.status" class="rounded-lg bg-zinc-800 px-3 py-2">
                  <option value="booked">booked</option>
                  <option value="cancelled">cancelled</option>
                  <option value="completed">completed</option>
                </select>

                <textarea v-model="appointmentUpdateForm.notes" rows="3" placeholder="Notes" class="rounded-lg bg-zinc-800 px-3 py-2" />

                <button class="rounded-lg bg-zinc-800 px-3 py-2 text-sm" @click="updateAppointment">Update appointment</button>
              </div>
            </div>
          </div>

          <div v-if="adminResult" class="mt-6">
            <h3 class="mb-2 font-medium">Last admin result</h3>
            <pre class="overflow-auto rounded-lg bg-black/40 p-3 text-xs">{{ adminResult }}</pre>
          </div>
        </section>

        <section class="space-y-6">
          <div class="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div class="mb-3 flex gap-3">
              <h2 class="text-xl font-semibold">Barbers</h2>
              <button class="rounded-lg bg-zinc-800 px-3 py-1 text-sm" @click="loadAdminBarbers">Reload</button>
            </div>
            <div class="space-y-3">
              <div v-for="barber in adminBarbers" :key="barber.id" class="flex items-center justify-between rounded-lg bg-zinc-950/60 p-3">
                <div>
                  <div class="font-medium">{{ barber.name }}</div>
                  <div class="text-xs text-zinc-400">active: {{ barber.active }}</div>
                </div>
                <div class="flex gap-2">
                  <button class="rounded bg-zinc-800 px-3 py-1 text-xs" @click="toggleBarber(barber)">Toggle</button>
                  <button class="rounded bg-red-700 px-3 py-1 text-xs" @click="removeBarber(barber.id)">Delete</button>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div class="mb-3 flex gap-3">
              <h2 class="text-xl font-semibold">Services</h2>
              <button class="rounded-lg bg-zinc-800 px-3 py-1 text-sm" @click="loadAdminServices">Reload</button>
            </div>
            <div class="space-y-3">
              <div
                v-for="service in adminServices"
                :key="service.id"
                class="flex items-center justify-between rounded-lg bg-zinc-950/60 p-3"
              >
                <div>
                  <div class="font-medium">{{ service.name }}</div>
                  <div class="text-xs text-zinc-400">
                    {{ service.duration_minutes }} min • {{ service.price }} • active: {{ service.active }}
                  </div>
                </div>
                <div class="flex gap-2">
                  <button class="rounded bg-zinc-800 px-3 py-1 text-xs" @click="toggleService(service)">Toggle</button>
                  <button class="rounded bg-red-700 px-3 py-1 text-xs" @click="removeService(service.id)">Delete</button>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div class="mb-3 flex gap-3">
              <h2 class="text-xl font-semibold">Appointments</h2>
              <button class="rounded-lg bg-zinc-800 px-3 py-1 text-sm" @click="loadAppointments">Reload</button>
            </div>
            <pre class="overflow-auto rounded-lg bg-black/40 p-3 text-xs">{{ adminAppointments }}</pre>
          </div>

          <div class="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div class="mb-3 flex gap-3">
              <h2 class="text-xl font-semibold">Working Hours</h2>
              <button class="rounded-lg bg-zinc-800 px-3 py-1 text-sm" @click="loadWorkingHours">Reload</button>
            </div>
            <div class="space-y-3">
              <div
                v-for="workingHour in adminWorkingHours"
                :key="workingHour.id"
                class="flex items-center justify-between rounded-lg bg-zinc-950/60 p-3"
              >
                <div class="text-sm">
                  barber: {{ workingHour.barber_id }} • day: {{ workingHour.day_of_week }} • {{ workingHour.start_time }} -
                  {{ workingHour.end_time }}
                </div>
                <button class="rounded bg-red-700 px-3 py-1 text-xs" @click="removeWorkingHours(workingHour.id)">Delete</button>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div class="mb-3 flex gap-3">
              <h2 class="text-xl font-semibold">Blocked Times</h2>
              <button class="rounded-lg bg-zinc-800 px-3 py-1 text-sm" @click="loadBlockedTimes">Reload</button>
            </div>
            <div class="space-y-3">
              <div
                v-for="blockedTime in adminBlockedTimes"
                :key="blockedTime.id"
                class="flex items-center justify-between rounded-lg bg-zinc-950/60 p-3"
              >
                <div class="text-sm">
                  barber: {{ blockedTime.barber_id }} • {{ formatDateTime(blockedTime.start_at) }} →
                  {{ formatDateTime(blockedTime.end_at) }}
                  <span v-if="blockedTime.reason"> • {{ blockedTime.reason }}</span>
                </div>
                <button class="rounded bg-red-700 px-3 py-1 text-xs" @click="removeBlockedTime(blockedTime.id)">Delete</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
