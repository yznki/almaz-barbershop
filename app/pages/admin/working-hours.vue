<script setup lang="ts">
import { Clock3, Plus, Trash2 } from "lucide-vue-next";
import { toast } from "vue-sonner";
import { formatTimeRange, getDayName, getRequestErrorMessage } from "../../lib/formatters";

definePageMeta({
  layout: "admin",
  middleware: "admin",
});

const adminApi = useAdminApi();
const [{ data: workingHours, refresh }, { data: barbers }] = await Promise.all([adminApi.getWorkingHours(), adminApi.getBarbers()]);

const createDialogOpen = ref(false);
const editDialogOpen = ref(false);
const createForm = reactive({
  barberId: "",
  dayOfWeek: 1,
  startTime: "09:00",
  endTime: "18:00",
});
const editForm = reactive({
  id: "",
  barberId: "",
  dayOfWeek: 1,
  startTime: "09:00",
  endTime: "18:00",
});

const barberMap = computed(() => new Map((barbers.value ?? []).map((barber) => [barber.id, barber.name])));

const saveCreate = async () => {
  try {
    await adminApi.createWorkingHours(createForm);
    createDialogOpen.value = false;
    Object.assign(createForm, { barberId: "", dayOfWeek: 1, startTime: "09:00", endTime: "18:00" });
    await refresh();
    toast.success("Working hours created");
  } catch (error) {
    toast.error(getRequestErrorMessage(error));
  }
};

const openEdit = (item: NonNullable<typeof workingHours.value>[number]) => {
  Object.assign(editForm, {
    id: item.id,
    barberId: item.barber_id,
    dayOfWeek: item.day_of_week,
    startTime: item.start_time,
    endTime: item.end_time,
  });
  editDialogOpen.value = true;
};

const saveEdit = async () => {
  try {
    await adminApi.updateWorkingHours(editForm.id, {
      barberId: editForm.barberId,
      dayOfWeek: editForm.dayOfWeek,
      startTime: editForm.startTime,
      endTime: editForm.endTime,
    });
    editDialogOpen.value = false;
    await refresh();
    toast.success("Working hours updated");
  } catch (error) {
    toast.error(getRequestErrorMessage(error));
  }
};

const removeWorkingHours = async (id: string) => {
  try {
    await adminApi.deleteWorkingHours(id);
    await refresh();
    toast.success("Working hours removed");
  } catch (error) {
    toast.error(getRequestErrorMessage(error));
  }
};
</script>

<template>
  <div class="space-y-6">
    <AppAdminHeader title="Working hours" description="Create the weekly availability windows used by the scheduling backend.">
      <Dialog v-model:open="createDialogOpen">
        <DialogTrigger as-child>
          <Button class="rounded-full bg-primary text-primary-foreground">
            <Plus class="size-4" />
            Add hours
          </Button>
        </DialogTrigger>
        <DialogContent class="border-border/70 bg-popover">
          <DialogHeader>
            <DialogTitle>Add working hours</DialogTitle>
            <DialogDescription>Create an availability block for a barber.</DialogDescription>
          </DialogHeader>
          <div class="grid gap-4">
            <div class="space-y-2">
              <Label>Barber</Label>
              <Select v-model="createForm.barberId">
                <SelectTrigger class="w-full rounded-xl">
                  <SelectValue placeholder="Choose barber" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="barber in barbers ?? []" :key="barber.id" :value="barber.id">{{ barber.name }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>Day</Label>
              <Select :model-value="String(createForm.dayOfWeek)" @update:model-value="(value) => (createForm.dayOfWeek = Number(value))">
                <SelectTrigger class="w-full rounded-xl">
                  <SelectValue placeholder="Choose day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="day in 7" :key="day - 1" :value="String(day - 1)">{{ getDayName(day - 1) }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label>Start</Label>
                <Input v-model="createForm.startTime" type="time" class="rounded-xl" />
              </div>
              <div class="space-y-2">
                <Label>End</Label>
                <Input v-model="createForm.endTime" type="time" class="rounded-xl" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" @click="createDialogOpen = false">Cancel</Button>
            <Button class="bg-primary text-primary-foreground" @click="saveCreate">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppAdminHeader>

    <Card class="border-border/70 bg-card/55">
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Barber</TableHead>
              <TableHead>Day</TableHead>
              <TableHead>Time</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="item in workingHours ?? []" :key="item.id">
              <TableCell class="font-medium text-foreground">{{ barberMap.get(item.barber_id) ?? item.barber_id }}</TableCell>
              <TableCell>{{ getDayName(item.day_of_week) }}</TableCell>
              <TableCell>{{ formatTimeRange(item.start_time, item.end_time) }}</TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-2">
                  <Button variant="outline" size="sm" class="rounded-full" @click="openEdit(item)">Edit</Button>
                  <Button variant="outline" size="sm" class="rounded-full text-destructive" @click="removeWorkingHours(item.id)">
                    <Trash2 class="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Dialog v-model:open="editDialogOpen">
      <DialogContent class="border-border/70 bg-popover">
        <DialogHeader>
          <DialogTitle>Edit working hours</DialogTitle>
          <DialogDescription>Adjust the weekly availability block.</DialogDescription>
        </DialogHeader>
        <div class="grid gap-4">
          <div class="space-y-2">
            <Label>Barber</Label>
            <Select v-model="editForm.barberId">
              <SelectTrigger class="w-full rounded-xl">
                <SelectValue placeholder="Choose barber" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="barber in barbers ?? []" :key="barber.id" :value="barber.id">{{ barber.name }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label>Day</Label>
            <Select :model-value="String(editForm.dayOfWeek)" @update:model-value="(value) => (editForm.dayOfWeek = Number(value))">
              <SelectTrigger class="w-full rounded-xl">
                <SelectValue placeholder="Choose day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="day in 7" :key="day - 1" :value="String(day - 1)">{{ getDayName(day - 1) }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label>Start</Label>
              <Input v-model="editForm.startTime" type="time" class="rounded-xl" />
            </div>
            <div class="space-y-2">
              <Label>End</Label>
              <Input v-model="editForm.endTime" type="time" class="rounded-xl" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="editDialogOpen = false">Cancel</Button>
          <Button class="bg-primary text-primary-foreground" @click="saveEdit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AppEmptyState
      v-if="!(workingHours?.length)"
      title="No working hours yet"
      description="Create weekly availability so public slot generation has usable schedule data."
      :icon="Clock3"
    />
  </div>
</template>
