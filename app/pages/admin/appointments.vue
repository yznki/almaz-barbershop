<script setup lang="ts">
import { CalendarClock } from "lucide-vue-next";
import { toast } from "vue-sonner";
import { formatDateTime, getRequestErrorMessage } from "../../lib/formatters";

definePageMeta({
  layout: "admin",
  middleware: "admin",
});

const adminApi = useAdminApi();
const [{ data: appointments, refresh }, { data: barbers }, { data: services }] = await Promise.all([
  adminApi.getAppointments(),
  adminApi.getBarbers(),
  adminApi.getServices(),
]);

const editDialogOpen = ref(false);
const editForm = reactive({
  id: "",
  status: "booked" as "booked" | "cancelled" | "completed",
  notes: "",
});

const barberMap = computed(() => new Map((barbers.value ?? []).map((barber) => [barber.id, barber.name])));
const serviceMap = computed(() => new Map((services.value ?? []).map((service) => [service.id, service.name])));

const openEdit = (appointment: NonNullable<typeof appointments.value>[number]) => {
  editForm.id = appointment.id;
  editForm.status = appointment.status;
  editForm.notes = appointment.notes ?? "";
  editDialogOpen.value = true;
};

const saveEdit = async () => {
  try {
    await adminApi.updateAppointment(editForm.id, {
      status: editForm.status,
      notes: editForm.notes || null,
    });
    editDialogOpen.value = false;
    await refresh();
    toast.success("Appointment updated");
  } catch (error) {
    toast.error(getRequestErrorMessage(error));
  }
};
</script>

<template>
  <div class="space-y-6">
    <AppAdminHeader title="Appointments" description="Review and update booked appointments." />

    <Card class="border-border/70 bg-card/55">
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Barber</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="appointment in appointments ?? []" :key="appointment.id">
              <TableCell>
                <div>
                  <p class="font-medium text-foreground">{{ appointment.customer_name }}</p>
                  <p class="text-sm text-muted-foreground">{{ appointment.customer_phone }}</p>
                </div>
              </TableCell>
              <TableCell>{{ barberMap.get(appointment.barber_id) ?? appointment.barber_id }}</TableCell>
              <TableCell>{{ serviceMap.get(appointment.service_id) ?? appointment.service_id }}</TableCell>
              <TableCell>{{ formatDateTime(appointment.start_at) }}</TableCell>
              <TableCell>
                <Badge variant="outline" class="capitalize">{{ appointment.status }}</Badge>
              </TableCell>
              <TableCell class="text-right">
                <Button variant="outline" size="sm" class="rounded-full" @click="openEdit(appointment)">Manage</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Dialog v-model:open="editDialogOpen">
      <DialogContent class="border-border/70 bg-popover">
        <DialogHeader>
          <DialogTitle>Manage appointment</DialogTitle>
          <DialogDescription>Update status or notes using the current admin API.</DialogDescription>
        </DialogHeader>
        <div class="grid gap-4">
          <div class="space-y-2">
            <Label>Status</Label>
            <Select v-model="editForm.status">
              <SelectTrigger class="w-full rounded-xl">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label>Notes</Label>
            <Textarea v-model="editForm.notes" class="min-h-28 rounded-xl" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="editDialogOpen = false">Cancel</Button>
          <Button class="bg-primary text-primary-foreground" @click="saveEdit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AppEmptyState
      v-if="!(appointments?.length)"
      title="No appointments yet"
      description="Booked appointments will appear here as soon as customers start using the public flow."
      :icon="CalendarClock"
    />
  </div>
</template>
