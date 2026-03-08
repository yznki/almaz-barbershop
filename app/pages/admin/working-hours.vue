<script setup lang="ts">
import { Clock3 } from "lucide-vue-next";
import { toast } from "vue-sonner";
import { getDayName, getRequestErrorMessage } from "../../lib/formatters";

definePageMeta({
  layout: "admin",
  middleware: "admin",
});

type DaySchedule = {
  id: string | null;
  enabled: boolean;
  startTime: string;
  endTime: string;
  extraIds: string[];
};

const adminApi = useAdminApi();
const [{ data: workingHours, refresh }, { data: barbers }] = await Promise.all([adminApi.getWorkingHours(), adminApi.getBarbers()]);

const days = [1, 2, 3, 4, 5, 6];
const selectedBarberId = ref("");
const saving = ref(false);

watchEffect(() => {
  if (!selectedBarberId.value && barbers.value?.length) {
    selectedBarberId.value = barbers.value[0].id;
  }
});

const schedule = reactive<Record<number, DaySchedule>>(
  Object.fromEntries(
    days.map((day) => [
      day,
      {
        id: null,
        enabled: false,
        startTime: "09:00",
        endTime: "18:00",
        extraIds: [],
      },
    ]),
  ) as Record<number, DaySchedule>,
);

const hydrateSchedule = () => {
  for (const day of days) {
    schedule[day] = {
      id: null,
      enabled: false,
      startTime: "09:00",
      endTime: "18:00",
      extraIds: [],
    };
  }

  const entries = (workingHours.value ?? []).filter((item) => item.barber_id === selectedBarberId.value);

  for (const day of days) {
    const matches = entries.filter((item) => item.day_of_week === day);
    const primary = matches[0];

    if (!primary) {
      continue;
    }

    schedule[day] = {
      id: primary.id,
      enabled: true,
      startTime: primary.start_time,
      endTime: primary.end_time,
      extraIds: matches.slice(1).map((item) => item.id),
    };
  }
};

watch([selectedBarberId, workingHours], hydrateSchedule, { immediate: true });

const saveWeek = async () => {
  if (!selectedBarberId.value) {
    toast.error("Choose a barber first");
    return;
  }

  saving.value = true;

  try {
    for (const day of days) {
      const entry = schedule[day];

      if (entry.enabled) {
        if (entry.id) {
          await adminApi.updateWorkingHours(entry.id, {
            barberId: selectedBarberId.value,
            dayOfWeek: day,
            startTime: entry.startTime,
            endTime: entry.endTime,
          });
        } else {
          const created = await adminApi.createWorkingHours({
            barberId: selectedBarberId.value,
            dayOfWeek: day,
            startTime: entry.startTime,
            endTime: entry.endTime,
          });
          entry.id = created.id;
        }

        for (const extraId of entry.extraIds) {
          await adminApi.deleteWorkingHours(extraId);
        }

        entry.extraIds = [];
      } else {
        if (entry.id) {
          await adminApi.deleteWorkingHours(entry.id);
          entry.id = null;
        }

        for (const extraId of entry.extraIds) {
          await adminApi.deleteWorkingHours(extraId);
        }

        entry.extraIds = [];
      }
    }

    await refresh();
    toast.success("Weekly schedule saved");
  } catch (error) {
    toast.error(getRequestErrorMessage(error));
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="space-y-6">
    <AppAdminHeader
      title="Working hours"
      description="Set the weekly working hours for each barber in one place. Sunday stays off by default."
    >
      <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Select v-model="selectedBarberId">
          <SelectTrigger class="w-full rounded-full sm:w-56">
            <SelectValue placeholder="Choose barber" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="barber in barbers ?? []" :key="barber.id" :value="barber.id">{{ barber.name }}</SelectItem>
          </SelectContent>
        </Select>
        <Button class="rounded-full bg-primary text-primary-foreground" :disabled="saving" @click="saveWeek">
          {{ saving ? "Saving..." : "Save week" }}
        </Button>
      </div>
    </AppAdminHeader>

    <Card class="border-border/70 bg-card/55">
      <CardContent class="grid gap-4 p-4 sm:p-6">
        <div
          v-for="day in days"
          :key="day"
          class="grid gap-4 rounded-2xl border border-border/70 bg-background/50 p-4 lg:grid-cols-[160px_120px_minmax(0,1fr)] lg:items-center"
        >
          <div>
            <p class="text-base font-medium text-foreground">{{ getDayName(day) }}</p>
            <p class="text-sm text-muted-foreground">{{ day === 6 ? "Weekend hours" : "Working day" }}</p>
          </div>

          <div class="flex items-center gap-3">
            <Checkbox v-model:model-value="schedule[day].enabled" />
            <Label>Open</Label>
          </div>

          <div v-if="schedule[day].enabled" class="grid gap-3 sm:grid-cols-2">
            <div class="space-y-2">
              <Label>Start</Label>
              <Input v-model="schedule[day].startTime" type="time" class="rounded-xl" />
            </div>
            <div class="space-y-2">
              <Label>End</Label>
              <Input v-model="schedule[day].endTime" type="time" class="rounded-xl" />
            </div>
          </div>

          <div v-else class="text-sm text-muted-foreground">Closed</div>
        </div>
      </CardContent>
    </Card>

    <AppEmptyState
      v-if="!(barbers?.length)"
      title="No barbers yet"
      description="Create a barber first before setting weekly working hours."
      :icon="Clock3"
    />
  </div>
</template>
