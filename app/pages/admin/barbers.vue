<script setup lang="ts">
import { Plus, Scissors, Trash2, UserRound } from "lucide-vue-next";
import { toast } from "vue-sonner";
import type { AdminBarberServiceOption } from "../../composables/useAdminApi";
import { formatCurrency, getRequestErrorMessage } from "../../lib/formatters";

definePageMeta({
  layout: "admin",
  middleware: "admin",
});

const adminApi = useAdminApi();
const { data: barbers, refresh } = await adminApi.getBarbers();

const createDialogOpen = ref(false);
const editDialogOpen = ref(false);
const servicesDialogOpen = ref(false);
const createForm = reactive({ name: "", active: true });
const editForm = reactive({ id: "", name: "", active: true });
const selectedBarberForServices = ref<NonNullable<typeof barbers.value>[number] | null>(null);
const serviceOptions = ref<AdminBarberServiceOption[]>([]);
const servicesPending = ref(false);
const servicesSaving = ref(false);

const saveCreate = async () => {
  try {
    await adminApi.createBarber(createForm);
    createForm.name = "";
    createForm.active = true;
    createDialogOpen.value = false;
    await refresh();
    toast.success("Barber created");
  } catch (error) {
    toast.error(getRequestErrorMessage(error));
  }
};

const openEdit = (barber: NonNullable<typeof barbers.value>[number]) => {
  editForm.id = barber.id;
  editForm.name = barber.name;
  editForm.active = barber.active;
  editDialogOpen.value = true;
};

const saveEdit = async () => {
  try {
    await adminApi.updateBarber(editForm.id, {
      name: editForm.name,
      active: editForm.active,
    });
    editDialogOpen.value = false;
    await refresh();
    toast.success("Barber updated");
  } catch (error) {
    toast.error(getRequestErrorMessage(error));
  }
};

const removeBarber = async (id: string) => {
  try {
    await adminApi.deleteBarber(id);
    await refresh();
    toast.success("Barber removed");
  } catch (error) {
    toast.error(getRequestErrorMessage(error));
  }
};

const loadBarberServices = async (barber: NonNullable<typeof barbers.value>[number]) => {
  selectedBarberForServices.value = barber;
  servicesDialogOpen.value = true;
  servicesPending.value = true;

  try {
    serviceOptions.value = await adminApi.getBarberServices(barber.id);
  } catch (error) {
    servicesDialogOpen.value = false;
    toast.error(getRequestErrorMessage(error));
  } finally {
    servicesPending.value = false;
  }
};

const toggleServiceAssignment = (index: number, enabled: boolean) => {
  const current = serviceOptions.value[index];

  if (!current) {
    return;
  }

  serviceOptions.value[index] = {
    ...current,
    assigned: enabled,
    assignment: enabled
      ? {
          id: current.assignment?.id ?? "",
          active: current.assignment?.active ?? true,
          durationOverrideMinutes: current.assignment?.durationOverrideMinutes ?? null,
          priceOverride: current.assignment?.priceOverride ?? null,
        }
      : null,
  };
};

const saveBarberServices = async () => {
  const barber = selectedBarberForServices.value;

  if (!barber) {
    return;
  }

  servicesSaving.value = true;

  try {
    await adminApi.saveBarberServices(barber.id, {
      assignments: serviceOptions.value
        .filter((item) => item.assigned)
        .map((item) => ({
          serviceId: item.service.id,
          active: item.assignment?.active ?? true,
          durationOverrideMinutes: item.assignment?.durationOverrideMinutes ?? null,
          priceOverride: item.assignment?.priceOverride ?? null,
        })),
    });
    servicesDialogOpen.value = false;
    toast.success("Barber services updated");
  } catch (error) {
    toast.error(getRequestErrorMessage(error));
  } finally {
    servicesSaving.value = false;
  }
};
</script>

<template>
  <div class="space-y-6">
    <AppAdminHeader title="Barbers" description="Manage active team members available for booking.">
      <Dialog v-model:open="createDialogOpen">
        <DialogTrigger as-child>
          <Button class="rounded-full bg-primary text-primary-foreground">
            <Plus class="size-4" />
            Add barber
          </Button>
        </DialogTrigger>
        <DialogContent class="border-border/70 bg-popover">
          <DialogHeader>
            <DialogTitle>Add barber</DialogTitle>
            <DialogDescription>Create a new barber record for bookings.</DialogDescription>
          </DialogHeader>
          <div class="space-y-4">
            <div class="space-y-2">
              <Label>Name</Label>
              <Input v-model="createForm.name" class="rounded-xl" />
            </div>
            <div class="flex items-center gap-3">
              <Checkbox v-model:model-value="createForm.active" />
              <Label>Active</Label>
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
      <Card v-for="barber in barbers ?? []" :key="barber.id" class="border-border/70 bg-card/55">
        <CardContent class="space-y-4 p-4">
          <div class="flex items-center gap-3">
            <Avatar class="size-11 border border-primary/20">
              <AvatarFallback class="bg-primary/10 text-primary">{{ barber.name.slice(0, 2).toUpperCase() }}</AvatarFallback>
            </Avatar>
            <div class="min-w-0 flex-1">
              <p class="font-medium text-foreground">{{ barber.name }}</p>
              <Badge :variant="barber.active ? 'outline' : 'secondary'" class="mt-2 capitalize">
                {{ barber.active ? "active" : "inactive" }}
              </Badge>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <Button variant="outline" class="rounded-xl" @click="loadBarberServices(barber)">
              <Scissors class="size-4" />
              Services
            </Button>
            <Button variant="outline" class="rounded-xl" @click="openEdit(barber)">Edit</Button>
          </div>
          <div>
            <Button variant="outline" class="rounded-xl text-destructive" @click="removeBarber(barber.id)">
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
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="barber in barbers ?? []" :key="barber.id">
              <TableCell>
                <div class="flex items-center gap-3">
                  <Avatar class="size-10 border border-primary/20">
                    <AvatarFallback class="bg-primary/10 text-primary">{{ barber.name.slice(0, 2).toUpperCase() }}</AvatarFallback>
                  </Avatar>
                  <span class="font-medium text-foreground">{{ barber.name }}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge :variant="barber.active ? 'outline' : 'secondary'" class="capitalize">{{ barber.active ? "active" : "inactive" }}</Badge>
              </TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-2">
                  <Button variant="outline" size="sm" class="rounded-full" @click="loadBarberServices(barber)">Services</Button>
                  <Button variant="outline" size="sm" class="rounded-full" @click="openEdit(barber)">Edit</Button>
                  <Button variant="outline" size="sm" class="rounded-full text-destructive" @click="removeBarber(barber.id)">
                    <Trash2 class="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Dialog v-model:open="servicesDialogOpen">
      <DialogContent class="max-h-[85vh] overflow-y-auto border-border/70 bg-popover sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Barber services</DialogTitle>
          <DialogDescription>
            {{ selectedBarberForServices?.name }} can be assigned exactly the services they offer.
          </DialogDescription>
        </DialogHeader>

        <div v-if="servicesPending" class="space-y-3">
          <Skeleton class="h-24 rounded-2xl" />
          <Skeleton class="h-24 rounded-2xl" />
          <Skeleton class="h-24 rounded-2xl" />
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="(item, index) in serviceOptions"
            :key="item.service.id"
            class="rounded-2xl border border-border/70 bg-background/50 p-4"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <p class="font-medium text-foreground">{{ item.service.name }}</p>
                <p class="mt-1 text-sm text-muted-foreground">
                  Default: {{ item.service.duration_minutes }} min • {{ formatCurrency(item.service.price) }}
                </p>
              </div>
              <div class="flex items-center gap-3">
                <Checkbox :model-value="item.assigned" @update:model-value="toggleServiceAssignment(index, Boolean($event))" />
                <Label>Assigned</Label>
              </div>
            </div>

            <div v-if="item.assigned" class="mt-4 grid gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label>Duration override</Label>
                <Input
                  :model-value="item.assignment?.durationOverrideMinutes ?? ''"
                  type="number"
                  min="1"
                  class="rounded-xl"
                  placeholder="Use default"
                  @update:model-value="serviceOptions[index].assignment!.durationOverrideMinutes = $event === '' ? null : Number($event)"
                />
              </div>
              <div class="space-y-2">
                <Label>Price override</Label>
                <Input
                  :model-value="item.assignment?.priceOverride ?? ''"
                  type="number"
                  min="0"
                  step="0.01"
                  class="rounded-xl"
                  placeholder="Use default"
                  @update:model-value="serviceOptions[index].assignment!.priceOverride = $event === '' ? null : Number($event)"
                />
              </div>
              <div class="flex items-center gap-3 sm:col-span-2">
                <Checkbox v-model:model-value="serviceOptions[index].assignment!.active" />
                <Label>Visible in booking</Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="servicesDialogOpen = false">Cancel</Button>
          <Button class="bg-primary text-primary-foreground" :disabled="servicesSaving" @click="saveBarberServices">
            {{ servicesSaving ? "Saving..." : "Save services" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="editDialogOpen">
      <DialogContent class="border-border/70 bg-popover">
        <DialogHeader>
          <DialogTitle>Edit barber</DialogTitle>
          <DialogDescription>Update display details or availability status.</DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label>Name</Label>
            <Input v-model="editForm.name" class="rounded-xl" />
          </div>
          <div class="flex items-center gap-3">
            <Checkbox v-model:model-value="editForm.active" />
            <Label>Active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="editDialogOpen = false">Cancel</Button>
          <Button class="bg-primary text-primary-foreground" @click="saveEdit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AppEmptyState
      v-if="!(barbers?.length)"
      title="No barbers yet"
      description="Add the first barber to start offering appointments."
      :icon="UserRound"
    />
  </div>
</template>
