<script setup lang="ts">
import type { Tables, Enums } from "@/app/types/database";

type Appointment = Tables<"appointments">;
type AppointmentStatus = Enums<"appointment_status">;
type Barber = Tables<"barbers">;
type BlockedTime = Tables<"blocked_times">;
type Service = Tables<"services">;
type WorkingHour = Tables<"working_hours">;

type Serializable = string | number | boolean | null | Serializable[] | { [key: string]: Serializable };

const publicApi = usePublicApi();
const adminApi = useAdminApi();
const authApi = useAuthApi();

const { data: me, error: meError, pending: mePending, refresh: refreshMe } = authApi.getMe();

const authForm = reactive({
  email: "",
  password: "",
});

const publicSlotsForm = reactive({
  barberId: "",
  serviceId: "",
  date: "",
});

const publicAppointmentForm = reactive({
  customerName: "",
  customerPhone: "",
  barberId: "",
  serviceId: "",
  startAt: "",
  notes: "",
});

const barberForm = reactive({
  name: "",
  active: true,
});

const barberUpdateForm = reactive({
  id: "",
  name: "",
  active: true,
});

const barberDeleteId = ref("");

const serviceForm = reactive({
  name: "",
  durationMinutes: 30,
  price: 20,
  active: true,
});

const serviceUpdateForm = reactive({
  id: "",
  name: "",
  durationMinutes: 30,
  price: 20,
  active: true,
});

const serviceDeleteId = ref("");

const appointmentUpdateForm = reactive({
  id: "",
  status: "booked" as AppointmentStatus,
  notes: "",
});

const workingHoursForm = reactive({
  barberId: "",
  dayOfWeek: 1,
  startTime: "09:00",
  endTime: "18:00",
});

const workingHoursDeleteId = ref("");

const blockedTimeForm = reactive({
  barberId: "",
  startAt: "",
  endAt: "",
  reason: "",
});

const blockedTimeDeleteId = ref("");

const publicBarbers = ref<Barber[] | null>(null);
const publicServices = ref<Service[] | null>(null);
const publicSlots = ref<Serializable[] | null>(null);
const publicAppointment = ref<Appointment | null>(null);
const adminBarbers = ref<Barber[] | null>(null);
const adminServices = ref<Service[] | null>(null);
const adminAppointments = ref<Appointment[] | null>(null);
const adminWorkingHours = ref<WorkingHour[] | null>(null);
const adminBlockedTimes = ref<BlockedTime[] | null>(null);

const pendingAction = ref<string | null>(null);
const lastResult = ref<Serializable | null>(null);
const lastError = ref<string | null>(null);

const setPending = (label: string | null) => {
  pendingAction.value = label;
};

const setResult = (value: unknown) => {
  lastResult.value = normalize(value);
  lastError.value = null;
};

const setError = (error: unknown) => {
  lastError.value = getErrorMessage(error);
};

const normalize = (value: unknown): Serializable => {
  return JSON.parse(JSON.stringify(value ?? null)) as Serializable;
};

const getErrorMessage = (error: unknown) => {
  if (error && typeof error === "object") {
    const value = error as {
      data?: { statusMessage?: string };
      statusMessage?: string;
      message?: string;
    };

    return value.data?.statusMessage ?? value.statusMessage ?? value.message ?? "Request failed";
  }

  return typeof error === "string" ? error : "Request failed";
};

const runAction = async <T,>(label: string, action: () => Promise<T>, onSuccess?: (value: T) => void) => {
  setPending(label);
  lastError.value = null;

  try {
    const result = await action();
    onSuccess?.(result);
    setResult(result);
  } catch (error) {
    setError(error);
  } finally {
    setPending(null);
  }
};

const login = () =>
  runAction("login", async () => {
    const result = await authApi.login({
      email: authForm.email,
      password: authForm.password,
    });

    await refreshMe();
    return result;
  });

const logout = () =>
  runAction("logout", async () => {
    const result = await authApi.logout();
    await refreshMe();
    return result;
  });

const loadPublicBarbers = () =>
  runAction("load public barbers", async () => {
    const response = await publicApi.getBarbers();
    if (response.error.value) {
      throw response.error.value;
    }

    const data = response.data.value ?? [];
    publicBarbers.value = data;
    return data;
  });

const loadPublicServices = () =>
  runAction("load public services", async () => {
    const response = await publicApi.getServices();
    if (response.error.value) {
      throw response.error.value;
    }

    const data = response.data.value ?? [];
    publicServices.value = data;
    return data;
  });

const loadPublicSlots = () =>
  runAction("load public slots", async () => {
    const response = await publicApi.getAvailableSlots({
      barberId: publicSlotsForm.barberId,
      serviceId: publicSlotsForm.serviceId,
      date: publicSlotsForm.date,
    });

    if (response.error.value) {
      throw response.error.value;
    }

    const data = (response.data.value ?? []) as Serializable[];
    publicSlots.value = data;
    return data;
  });

const createPublicAppointment = () =>
  runAction("create public appointment", async () => {
    const result = await publicApi.createAppointment({
      customerName: publicAppointmentForm.customerName,
      customerPhone: publicAppointmentForm.customerPhone,
      barberId: publicAppointmentForm.barberId,
      serviceId: publicAppointmentForm.serviceId,
      startAt: publicAppointmentForm.startAt,
      notes: publicAppointmentForm.notes || undefined,
    });

    publicAppointment.value = result;
    return result;
  });

const loadAdminBarbers = () =>
  runAction("load admin barbers", async () => {
    const response = await adminApi.getBarbers();
    if (response.error.value) {
      throw response.error.value;
    }

    const data = response.data.value ?? [];
    adminBarbers.value = data;
    return data;
  });

const createBarber = () =>
  runAction("create barber", async () => {
    const result = await adminApi.createBarber({
      name: barberForm.name,
      active: barberForm.active,
    });

    await loadAdminBarbers();
    return result;
  });

const updateBarber = () =>
  runAction("update barber", async () => {
    const result = await adminApi.updateBarber(barberUpdateForm.id, {
      name: barberUpdateForm.name || undefined,
      active: barberUpdateForm.active,
    });

    await loadAdminBarbers();
    return result;
  });

const deleteBarber = () =>
  runAction("delete barber", async () => {
    const result = await adminApi.deleteBarber(barberDeleteId.value);
    await loadAdminBarbers();
    return result;
  });

const loadAdminServices = () =>
  runAction("load admin services", async () => {
    const response = await adminApi.getServices();
    if (response.error.value) {
      throw response.error.value;
    }

    const data = response.data.value ?? [];
    adminServices.value = data;
    return data;
  });

const createService = () =>
  runAction("create service", async () => {
    const result = await adminApi.createService({
      name: serviceForm.name,
      durationMinutes: serviceForm.durationMinutes,
      price: serviceForm.price,
      active: serviceForm.active,
    });

    await loadAdminServices();
    return result;
  });

const updateService = () =>
  runAction("update service", async () => {
    const result = await adminApi.updateService(serviceUpdateForm.id, {
      name: serviceUpdateForm.name || undefined,
      durationMinutes: serviceUpdateForm.durationMinutes,
      price: serviceUpdateForm.price,
      active: serviceUpdateForm.active,
    });

    await loadAdminServices();
    return result;
  });

const deleteService = () =>
  runAction("delete service", async () => {
    const result = await adminApi.deleteService(serviceDeleteId.value);
    await loadAdminServices();
    return result;
  });

const loadAdminAppointments = () =>
  runAction("load appointments", async () => {
    const response = await adminApi.getAppointments();
    if (response.error.value) {
      throw response.error.value;
    }

    const data = response.data.value ?? [];
    adminAppointments.value = data;
    return data;
  });

const updateAppointment = () =>
  runAction("update appointment", async () => {
    const result = await adminApi.updateAppointment(appointmentUpdateForm.id, {
      status: appointmentUpdateForm.status,
      notes: appointmentUpdateForm.notes || null,
    });

    await loadAdminAppointments();
    return result;
  });

const loadWorkingHours = () =>
  runAction("load working hours", async () => {
    const response = await adminApi.getWorkingHours();
    if (response.error.value) {
      throw response.error.value;
    }

    const data = response.data.value ?? [];
    adminWorkingHours.value = data;
    return data;
  });

const createWorkingHours = () =>
  runAction("create working hours", async () => {
    const result = await adminApi.createWorkingHours({
      barberId: workingHoursForm.barberId,
      dayOfWeek: workingHoursForm.dayOfWeek,
      startTime: workingHoursForm.startTime,
      endTime: workingHoursForm.endTime,
    });

    await loadWorkingHours();
    return result;
  });

const deleteWorkingHours = () =>
  runAction("delete working hours", async () => {
    const result = await adminApi.deleteWorkingHours(workingHoursDeleteId.value);
    await loadWorkingHours();
    return result;
  });

const loadBlockedTimes = () =>
  runAction("load blocked times", async () => {
    const response = await adminApi.getBlockedTimes();
    if (response.error.value) {
      throw response.error.value;
    }

    const data = response.data.value ?? [];
    adminBlockedTimes.value = data;
    return data;
  });

const createBlockedTime = () =>
  runAction("create blocked time", async () => {
    const result = await adminApi.createBlockedTime({
      barberId: blockedTimeForm.barberId,
      startAt: blockedTimeForm.startAt,
      endAt: blockedTimeForm.endAt,
      reason: blockedTimeForm.reason || null,
    });

    await loadBlockedTimes();
    return result;
  });

const deleteBlockedTime = () =>
  runAction("delete blocked time", async () => {
    const result = await adminApi.deleteBlockedTime(blockedTimeDeleteId.value);
    await loadBlockedTimes();
    return result;
  });

const isAuthenticated = computed(() => Boolean(me.value?.authenticated));
const currentRole = computed(() => me.value?.role ?? null);
const authDisplay = computed(() => normalize(me.value ?? { authenticated: false, user: null, role: null }));
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-8 p-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold">Backend Test</h1>
      <p class="text-sm text-neutral-600">Internal page for testing auth, public routes, and admin routes.</p>
    </div>

    <section class="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-medium">Auth</h2>
          <p class="text-sm text-neutral-600">Login through Supabase SSR cookies and inspect the current server-visible user.</p>
        </div>
        <button class="rounded border px-3 py-2 text-sm" type="button" @click="refreshMe()">Refresh me</button>
      </div>

      <div class="grid gap-3 md:grid-cols-3">
        <input v-model="authForm.email" class="rounded border px-3 py-2" placeholder="Email" type="email" />
        <input v-model="authForm.password" class="rounded border px-3 py-2" placeholder="Password" type="password" />
        <div class="flex gap-2">
          <button class="rounded bg-black px-4 py-2 text-white" type="button" @click="login()">Login</button>
          <button class="rounded border px-4 py-2" type="button" @click="logout()">Logout</button>
        </div>
      </div>

      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <div class="rounded bg-neutral-50 p-3 text-sm">
          <div><strong>Authenticated:</strong> {{ isAuthenticated ? "yes" : "no" }}</div>
          <div><strong>Email:</strong> {{ me?.user?.email ?? "-" }}</div>
          <div><strong>Role:</strong> {{ currentRole ?? "-" }}</div>
          <div><strong>Pending:</strong> {{ mePending ? "yes" : "no" }}</div>
          <div><strong>Fetch error:</strong> {{ meError ? getErrorMessage(meError) : "-" }}</div>
        </div>
        <pre class="overflow-x-auto rounded bg-neutral-950 p-3 text-xs text-neutral-100">{{ JSON.stringify(authDisplay, null, 2) }}</pre>
      </div>
    </section>

    <section class="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <h2 class="mb-4 text-lg font-medium">Public API</h2>

      <div class="space-y-6">
        <div class="space-y-3">
          <div class="flex flex-wrap gap-2">
            <button class="rounded border px-3 py-2 text-sm" type="button" @click="loadPublicBarbers()">Load public barbers</button>
            <button class="rounded border px-3 py-2 text-sm" type="button" @click="loadPublicServices()">Load public services</button>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <pre class="min-h-32 overflow-x-auto rounded bg-neutral-950 p-3 text-xs text-neutral-100">{{
              JSON.stringify(publicBarbers, null, 2)
            }}</pre>
            <pre class="min-h-32 overflow-x-auto rounded bg-neutral-950 p-3 text-xs text-neutral-100">{{
              JSON.stringify(publicServices, null, 2)
            }}</pre>
          </div>
        </div>

        <div class="space-y-3">
          <h3 class="font-medium">Available slots</h3>
          <div class="grid gap-3 md:grid-cols-4">
            <input v-model="publicSlotsForm.barberId" class="rounded border px-3 py-2" placeholder="barberId" />
            <input v-model="publicSlotsForm.serviceId" class="rounded border px-3 py-2" placeholder="serviceId" />
            <input v-model="publicSlotsForm.date" class="rounded border px-3 py-2" placeholder="YYYY-MM-DD" />
            <button class="rounded border px-3 py-2 text-sm" type="button" @click="loadPublicSlots()">Load slots</button>
          </div>
          <pre class="min-h-32 overflow-x-auto rounded bg-neutral-950 p-3 text-xs text-neutral-100">{{
            JSON.stringify(publicSlots, null, 2)
          }}</pre>
        </div>

        <div class="space-y-3">
          <h3 class="font-medium">Create public appointment</h3>
          <div class="grid gap-3 md:grid-cols-3">
            <input v-model="publicAppointmentForm.customerName" class="rounded border px-3 py-2" placeholder="Customer name" />
            <input v-model="publicAppointmentForm.customerPhone" class="rounded border px-3 py-2" placeholder="Customer phone" />
            <input v-model="publicAppointmentForm.barberId" class="rounded border px-3 py-2" placeholder="barberId" />
            <input v-model="publicAppointmentForm.serviceId" class="rounded border px-3 py-2" placeholder="serviceId" />
            <input v-model="publicAppointmentForm.startAt" class="rounded border px-3 py-2" placeholder="2026-03-08T10:00:00+01:00" />
            <input v-model="publicAppointmentForm.notes" class="rounded border px-3 py-2" placeholder="Notes (optional)" />
          </div>
          <button class="rounded border px-3 py-2 text-sm" type="button" @click="createPublicAppointment()">Create appointment</button>
          <pre class="min-h-32 overflow-x-auto rounded bg-neutral-950 p-3 text-xs text-neutral-100">{{
            JSON.stringify(publicAppointment, null, 2)
          }}</pre>
        </div>
      </div>
    </section>

    <section class="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <h2 class="mb-4 text-lg font-medium">Admin API</h2>

      <div class="grid gap-6 lg:grid-cols-2">
        <div class="space-y-3 rounded border p-3">
          <div class="flex items-center justify-between">
            <h3 class="font-medium">Barbers</h3>
            <button class="rounded border px-3 py-2 text-sm" type="button" @click="loadAdminBarbers()">Load</button>
          </div>
          <div class="grid gap-2 md:grid-cols-2">
            <input v-model="barberForm.name" class="rounded border px-3 py-2" placeholder="New barber name" />
            <label class="flex items-center gap-2 rounded border px-3 py-2">
              <input v-model="barberForm.active" type="checkbox" />
              <span>Active</span>
            </label>
          </div>
          <button class="rounded border px-3 py-2 text-sm" type="button" @click="createBarber()">Create barber</button>
          <div class="grid gap-2 md:grid-cols-3">
            <input v-model="barberUpdateForm.id" class="rounded border px-3 py-2" placeholder="Barber id" />
            <input v-model="barberUpdateForm.name" class="rounded border px-3 py-2" placeholder="Updated name" />
            <label class="flex items-center gap-2 rounded border px-3 py-2">
              <input v-model="barberUpdateForm.active" type="checkbox" />
              <span>Active</span>
            </label>
          </div>
          <button class="rounded border px-3 py-2 text-sm" type="button" @click="updateBarber()">Update barber</button>
          <div class="flex gap-2">
            <input v-model="barberDeleteId" class="flex-1 rounded border px-3 py-2" placeholder="Barber id to delete" />
            <button class="rounded border px-3 py-2 text-sm" type="button" @click="deleteBarber()">Delete</button>
          </div>
          <pre class="min-h-40 overflow-x-auto rounded bg-neutral-950 p-3 text-xs text-neutral-100">{{
            JSON.stringify(adminBarbers, null, 2)
          }}</pre>
        </div>

        <div class="space-y-3 rounded border p-3">
          <div class="flex items-center justify-between">
            <h3 class="font-medium">Services</h3>
            <button class="rounded border px-3 py-2 text-sm" type="button" @click="loadAdminServices()">Load</button>
          </div>
          <div class="grid gap-2 md:grid-cols-2">
            <input v-model="serviceForm.name" class="rounded border px-3 py-2" placeholder="New service name" />
            <input
              v-model.number="serviceForm.durationMinutes"
              class="rounded border px-3 py-2"
              min="1"
              placeholder="Duration"
              type="number"
            />
            <input
              v-model.number="serviceForm.price"
              class="rounded border px-3 py-2"
              min="0"
              placeholder="Price"
              step="0.01"
              type="number"
            />
            <label class="flex items-center gap-2 rounded border px-3 py-2">
              <input v-model="serviceForm.active" type="checkbox" />
              <span>Active</span>
            </label>
          </div>
          <button class="rounded border px-3 py-2 text-sm" type="button" @click="createService()">Create service</button>
          <div class="grid gap-2 md:grid-cols-2">
            <input v-model="serviceUpdateForm.id" class="rounded border px-3 py-2" placeholder="Service id" />
            <input v-model="serviceUpdateForm.name" class="rounded border px-3 py-2" placeholder="Updated service name" />
            <input
              v-model.number="serviceUpdateForm.durationMinutes"
              class="rounded border px-3 py-2"
              min="1"
              placeholder="Duration"
              type="number"
            />
            <input
              v-model.number="serviceUpdateForm.price"
              class="rounded border px-3 py-2"
              min="0"
              placeholder="Price"
              step="0.01"
              type="number"
            />
            <label class="flex items-center gap-2 rounded border px-3 py-2">
              <input v-model="serviceUpdateForm.active" type="checkbox" />
              <span>Active</span>
            </label>
          </div>
          <button class="rounded border px-3 py-2 text-sm" type="button" @click="updateService()">Update service</button>
          <div class="flex gap-2">
            <input v-model="serviceDeleteId" class="flex-1 rounded border px-3 py-2" placeholder="Service id to delete" />
            <button class="rounded border px-3 py-2 text-sm" type="button" @click="deleteService()">Delete</button>
          </div>
          <pre class="min-h-40 overflow-x-auto rounded bg-neutral-950 p-3 text-xs text-neutral-100">{{
            JSON.stringify(adminServices, null, 2)
          }}</pre>
        </div>

        <div class="space-y-3 rounded border p-3">
          <div class="flex items-center justify-between">
            <h3 class="font-medium">Appointments</h3>
            <button class="rounded border px-3 py-2 text-sm" type="button" @click="loadAdminAppointments()">Load</button>
          </div>
          <div class="grid gap-2 md:grid-cols-3">
            <input v-model="appointmentUpdateForm.id" class="rounded border px-3 py-2" placeholder="Appointment id" />
            <select v-model="appointmentUpdateForm.status" class="rounded border px-3 py-2">
              <option value="booked">booked</option>
              <option value="cancelled">cancelled</option>
              <option value="completed">completed</option>
            </select>
            <input v-model="appointmentUpdateForm.notes" class="rounded border px-3 py-2" placeholder="Notes" />
          </div>
          <button class="rounded border px-3 py-2 text-sm" type="button" @click="updateAppointment()">Update appointment</button>
          <pre class="min-h-40 overflow-x-auto rounded bg-neutral-950 p-3 text-xs text-neutral-100">{{
            JSON.stringify(adminAppointments, null, 2)
          }}</pre>
        </div>

        <div class="space-y-3 rounded border p-3">
          <div class="flex items-center justify-between">
            <h3 class="font-medium">Working hours</h3>
            <button class="rounded border px-3 py-2 text-sm" type="button" @click="loadWorkingHours()">Load</button>
          </div>
          <div class="grid gap-2 md:grid-cols-2">
            <input v-model="workingHoursForm.barberId" class="rounded border px-3 py-2" placeholder="barberId" />
            <input
              v-model.number="workingHoursForm.dayOfWeek"
              class="rounded border px-3 py-2"
              max="6"
              min="0"
              placeholder="Day of week"
              type="number"
            />
            <input v-model="workingHoursForm.startTime" class="rounded border px-3 py-2" placeholder="09:00" />
            <input v-model="workingHoursForm.endTime" class="rounded border px-3 py-2" placeholder="18:00" />
          </div>
          <button class="rounded border px-3 py-2 text-sm" type="button" @click="createWorkingHours()">Create working hours</button>
          <div class="flex gap-2">
            <input v-model="workingHoursDeleteId" class="flex-1 rounded border px-3 py-2" placeholder="Working hours id to delete" />
            <button class="rounded border px-3 py-2 text-sm" type="button" @click="deleteWorkingHours()">Delete</button>
          </div>
          <pre class="min-h-40 overflow-x-auto rounded bg-neutral-950 p-3 text-xs text-neutral-100">{{
            JSON.stringify(adminWorkingHours, null, 2)
          }}</pre>
        </div>

        <div class="space-y-3 rounded border p-3 lg:col-span-2">
          <div class="flex items-center justify-between">
            <h3 class="font-medium">Blocked times</h3>
            <button class="rounded border px-3 py-2 text-sm" type="button" @click="loadBlockedTimes()">Load</button>
          </div>
          <div class="grid gap-2 md:grid-cols-4">
            <input v-model="blockedTimeForm.barberId" class="rounded border px-3 py-2" placeholder="barberId" />
            <input v-model="blockedTimeForm.startAt" class="rounded border px-3 py-2" placeholder="startAt" />
            <input v-model="blockedTimeForm.endAt" class="rounded border px-3 py-2" placeholder="endAt" />
            <input v-model="blockedTimeForm.reason" class="rounded border px-3 py-2" placeholder="Reason" />
          </div>
          <div class="flex flex-wrap gap-2">
            <button class="rounded border px-3 py-2 text-sm" type="button" @click="createBlockedTime()">Create blocked time</button>
            <input v-model="blockedTimeDeleteId" class="flex-1 rounded border px-3 py-2" placeholder="Blocked time id to delete" />
            <button class="rounded border px-3 py-2 text-sm" type="button" @click="deleteBlockedTime()">Delete blocked time</button>
          </div>
          <pre class="min-h-40 overflow-x-auto rounded bg-neutral-950 p-3 text-xs text-neutral-100">{{
            JSON.stringify(adminBlockedTimes, null, 2)
          }}</pre>
        </div>
      </div>
    </section>

    <section class="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <h2 class="mb-3 text-lg font-medium">Debug</h2>
      <div class="mb-3 text-sm"><strong>Pending action:</strong> {{ pendingAction ?? "-" }}</div>
      <div v-if="lastError" class="mb-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        {{ lastError }}
      </div>
      <pre class="min-h-40 overflow-x-auto rounded bg-neutral-950 p-3 text-xs text-neutral-100">{{
        JSON.stringify(lastResult, null, 2)
      }}</pre>
    </section>
  </div>
</template>
