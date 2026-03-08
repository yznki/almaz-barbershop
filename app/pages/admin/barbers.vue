<script setup lang="ts">
import { Plus, Trash2, UserRound } from "lucide-vue-next";
import { toast } from "vue-sonner";
import { getRequestErrorMessage } from "../../lib/formatters";

definePageMeta({
  layout: "admin",
  middleware: "admin",
});

const adminApi = useAdminApi();
const { data: barbers, refresh } = await adminApi.getBarbers();

const createDialogOpen = ref(false);
const editDialogOpen = ref(false);
const createForm = reactive({ name: "", active: true });
const editForm = reactive({ id: "", name: "", active: true });

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

    <Card class="border-border/70 bg-card/55">
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
