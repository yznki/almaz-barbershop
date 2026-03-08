<script setup lang="ts">
import { Ban, Plus, Trash2 } from "lucide-vue-next";
import { toast } from "vue-sonner";
import { formatDateTime, getRequestErrorMessage } from "../../lib/formatters";

definePageMeta({
  layout: "admin",
  middleware: "admin",
});

const adminApi = useAdminApi();
const [{ data: blockedTimes, refresh }, { data: barbers }] = await Promise.all([adminApi.getBlockedTimes(), adminApi.getBarbers()]);

const createDialogOpen = ref(false);
const editDialogOpen = ref(false);
const createForm = reactive({
  barberId: "",
  startAt: "",
  endAt: "",
  reason: "",
});
const editForm = reactive({
  id: "",
  barberId: "",
  startAt: "",
  endAt: "",
  reason: "",
});

const barberMap = computed(() => new Map((barbers.value ?? []).map((barber) => [barber.id, barber.name])));

const hasValidRange = (startAt: string, endAt: string) => {
  if (!startAt || !endAt) {
    toast.error("Choose both start and end");
    return false;
  }

  if (new Date(startAt).getTime() >= new Date(endAt).getTime()) {
    toast.error("End time must be after start time");
    return false;
  }

  return true;
};

const saveCreate = async () => {
  if (!hasValidRange(createForm.startAt, createForm.endAt)) {
    return;
  }

  try {
    await adminApi.createBlockedTime({
      barberId: createForm.barberId,
      startAt: createForm.startAt,
      endAt: createForm.endAt,
      reason: createForm.reason || null,
    });
    createDialogOpen.value = false;
    Object.assign(createForm, { barberId: "", startAt: "", endAt: "", reason: "" });
    await refresh();
    toast.success("Blocked time created");
  } catch (error) {
    toast.error(getRequestErrorMessage(error));
  }
};

const openEdit = (item: NonNullable<typeof blockedTimes.value>[number]) => {
  Object.assign(editForm, {
    id: item.id,
    barberId: item.barber_id,
    startAt: item.start_at.slice(0, 16),
    endAt: item.end_at.slice(0, 16),
    reason: item.reason ?? "",
  });
  editDialogOpen.value = true;
};

const saveEdit = async () => {
  if (!hasValidRange(editForm.startAt, editForm.endAt)) {
    return;
  }

  try {
    await adminApi.updateBlockedTime(editForm.id, {
      barberId: editForm.barberId,
      startAt: editForm.startAt,
      endAt: editForm.endAt,
      reason: editForm.reason || null,
    });
    editDialogOpen.value = false;
    await refresh();
    toast.success("Blocked time updated");
  } catch (error) {
    toast.error(getRequestErrorMessage(error));
  }
};

const removeBlockedTime = async (id: string) => {
  try {
    await adminApi.deleteBlockedTime(id);
    await refresh();
    toast.success("Blocked time removed");
  } catch (error) {
    toast.error(getRequestErrorMessage(error));
  }
};
</script>

<template>
  <div class="space-y-6">
    <AppAdminHeader title="Blocked times" description="Reserve exceptions and closures that should override normal availability.">
      <Dialog v-model:open="createDialogOpen">
        <DialogTrigger as-child>
          <Button class="rounded-full bg-primary text-primary-foreground">
            <Plus class="size-4" />
            Add blocked time
          </Button>
        </DialogTrigger>
        <DialogContent class="border-border/70 bg-popover">
          <DialogHeader>
            <DialogTitle>Add blocked time</DialogTitle>
            <DialogDescription>Create a blackout period for a barber.</DialogDescription>
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
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label>Start</Label>
                <Input v-model="createForm.startAt" type="datetime-local" class="rounded-xl" />
              </div>
              <div class="space-y-2">
                <Label>End</Label>
                <Input v-model="createForm.endAt" type="datetime-local" class="rounded-xl" />
              </div>
            </div>
            <div class="space-y-2">
              <Label>Reason</Label>
              <Textarea v-model="createForm.reason" class="min-h-24 rounded-xl" placeholder="Vacation, training, private booking..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" @click="createDialogOpen = false">Cancel</Button>
            <Button class="bg-primary text-primary-foreground" @click="saveCreate">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppAdminHeader>

    <div class="grid gap-4 md:hidden">
      <Card v-for="item in blockedTimes ?? []" :key="item.id" class="border-border/70 bg-card/55">
        <CardContent class="space-y-4 p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-medium text-foreground">{{ barberMap.get(item.barber_id) ?? item.barber_id }}</p>
              <p class="mt-1 text-sm text-muted-foreground">{{ item.reason || "Blocked" }}</p>
            </div>
          </div>
          <div class="grid gap-3 rounded-2xl border border-border/70 bg-background/50 p-4 text-sm">
            <div class="flex items-center justify-between gap-4">
              <span class="text-muted-foreground">Start</span>
              <span class="text-right text-foreground">{{ formatDateTime(item.start_at) }}</span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="text-muted-foreground">End</span>
              <span class="text-right text-foreground">{{ formatDateTime(item.end_at) }}</span>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <Button variant="outline" class="rounded-xl" @click="openEdit(item)">Edit</Button>
            <Button variant="outline" class="rounded-xl text-destructive" @click="removeBlockedTime(item.id)">
              <Trash2 class="size-4" />
              Remove
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card class="hidden border-border/70 bg-card/55 md:block">
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Barber</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="item in blockedTimes ?? []" :key="item.id">
              <TableCell class="font-medium text-foreground">{{ barberMap.get(item.barber_id) ?? item.barber_id }}</TableCell>
              <TableCell>{{ formatDateTime(item.start_at) }}</TableCell>
              <TableCell>{{ formatDateTime(item.end_at) }}</TableCell>
              <TableCell>{{ item.reason || "Blocked" }}</TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-2">
                  <Button variant="outline" size="sm" class="rounded-full" @click="openEdit(item)">Edit</Button>
                  <Button variant="outline" size="sm" class="rounded-full text-destructive" @click="removeBlockedTime(item.id)">
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
          <DialogTitle>Edit blocked time</DialogTitle>
          <DialogDescription>Adjust the blackout period details.</DialogDescription>
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
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label>Start</Label>
              <Input v-model="editForm.startAt" type="datetime-local" class="rounded-xl" />
            </div>
            <div class="space-y-2">
              <Label>End</Label>
              <Input v-model="editForm.endAt" type="datetime-local" class="rounded-xl" />
            </div>
          </div>
          <div class="space-y-2">
            <Label>Reason</Label>
            <Textarea v-model="editForm.reason" class="min-h-24 rounded-xl" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="editDialogOpen = false">Cancel</Button>
          <Button class="bg-primary text-primary-foreground" @click="saveEdit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AppEmptyState
      v-if="!(blockedTimes?.length)"
      title="No blocked times yet"
      description="Add exceptions whenever a barber should not appear bookable."
      :icon="Ban"
    />
  </div>
</template>
