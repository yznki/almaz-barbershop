<script setup lang="ts">
import { Plus, Scissors, Trash2 } from "lucide-vue-next";
import { toast } from "vue-sonner";
import { formatCurrency, getRequestErrorMessage } from "../../lib/formatters";

definePageMeta({
  layout: "admin",
  middleware: "admin",
});

const adminApi = useAdminApi();
const { data: services, refresh } = await adminApi.getServices();

const createDialogOpen = ref(false);
const editDialogOpen = ref(false);
const createForm = reactive({ name: "", durationMinutes: 30, price: 35, active: true });
const editForm = reactive({ id: "", name: "", durationMinutes: 30, price: 35, active: true });

const saveCreate = async () => {
  try {
    await adminApi.createService(createForm);
    Object.assign(createForm, { name: "", durationMinutes: 30, price: 35, active: true });
    createDialogOpen.value = false;
    await refresh();
    toast.success("Service created");
  } catch (error) {
    toast.error(getRequestErrorMessage(error));
  }
};

const openEdit = (service: NonNullable<typeof services.value>[number]) => {
  Object.assign(editForm, {
    id: service.id,
    name: service.name,
    durationMinutes: service.duration_minutes,
    price: service.price,
    active: service.active,
  });
  editDialogOpen.value = true;
};

const saveEdit = async () => {
  try {
    await adminApi.updateService(editForm.id, editForm);
    editDialogOpen.value = false;
    await refresh();
    toast.success("Service updated");
  } catch (error) {
    toast.error(getRequestErrorMessage(error));
  }
};

const removeService = async (id: string) => {
  try {
    await adminApi.deleteService(id);
    await refresh();
    toast.success("Service removed");
  } catch (error) {
    toast.error(getRequestErrorMessage(error));
  }
};
</script>

<template>
  <div class="space-y-6">
    <AppAdminHeader title="Services" description="Maintain the active service menu shown publicly.">
      <Dialog v-model:open="createDialogOpen">
        <DialogTrigger as-child>
          <Button class="rounded-full bg-primary text-primary-foreground">
            <Plus class="size-4" />
            Add service
          </Button>
        </DialogTrigger>
        <DialogContent class="border-border/70 bg-popover">
          <DialogHeader>
            <DialogTitle>Add service</DialogTitle>
            <DialogDescription>Create a new bookable service.</DialogDescription>
          </DialogHeader>
          <div class="grid gap-4">
            <div class="space-y-2">
              <Label>Name</Label>
              <Input v-model="createForm.name" class="rounded-xl" />
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input v-model.number="createForm.durationMinutes" type="number" class="rounded-xl" />
              </div>
              <div class="space-y-2">
                <Label>Price</Label>
                <Input v-model.number="createForm.price" type="number" class="rounded-xl" />
              </div>
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
      <Card v-for="service in services ?? []" :key="service.id" class="border-border/70 bg-card/55">
        <CardContent class="space-y-4 p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-medium text-foreground">{{ service.name }}</p>
              <p class="mt-1 text-sm text-muted-foreground">{{ service.duration_minutes }} min</p>
            </div>
            <Badge :variant="service.active ? 'outline' : 'secondary'">{{ service.active ? "active" : "inactive" }}</Badge>
          </div>
          <div class="rounded-xl border border-border/70 bg-background/50 px-4 py-3">
            <p class="text-sm text-muted-foreground">Price</p>
            <p class="mt-1 text-lg font-semibold text-foreground">{{ formatCurrency(service.price) }}</p>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <Button variant="outline" class="rounded-xl" @click="openEdit(service)">Edit</Button>
            <Button variant="outline" class="rounded-xl text-destructive" @click="removeService(service.id)">
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
              <TableHead>Service</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="service in services ?? []" :key="service.id">
              <TableCell class="font-medium text-foreground">{{ service.name }}</TableCell>
              <TableCell>{{ service.duration_minutes }} min</TableCell>
              <TableCell>{{ formatCurrency(service.price) }}</TableCell>
              <TableCell>
                <Badge :variant="service.active ? 'outline' : 'secondary'">{{ service.active ? "active" : "inactive" }}</Badge>
              </TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-2">
                  <Button variant="outline" size="sm" class="rounded-full" @click="openEdit(service)">Edit</Button>
                  <Button variant="outline" size="sm" class="rounded-full text-destructive" @click="removeService(service.id)">
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
          <DialogTitle>Edit service</DialogTitle>
          <DialogDescription>Adjust the published service details.</DialogDescription>
        </DialogHeader>
        <div class="grid gap-4">
          <div class="space-y-2">
            <Label>Name</Label>
            <Input v-model="editForm.name" class="rounded-xl" />
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input v-model.number="editForm.durationMinutes" type="number" class="rounded-xl" />
            </div>
            <div class="space-y-2">
              <Label>Price</Label>
              <Input v-model.number="editForm.price" type="number" class="rounded-xl" />
            </div>
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
      v-if="!(services?.length)"
      title="No services yet"
      description="Add the first service to publish the Almaz menu."
      :icon="Scissors"
    />
  </div>
</template>
