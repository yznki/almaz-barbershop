<script setup lang="ts">
import { LogOut, Settings, Shield } from "lucide-vue-next";
import { toast } from "vue-sonner";
import { getRequestErrorMessage } from "../lib/formatters";

const session = useAuthSession();
const route = useRoute();
const router = useRouter();
const authApi = useAuthApi();

const pending = ref(false);

const initials = computed(() => {
  const email = session.user.value?.email ?? "A";
  return email.slice(0, 1).toUpperCase();
});

const handleLogout = async () => {
  pending.value = true;

  try {
    await authApi.logout();
    await session.refreshSession();
    toast.success("Signed out");
    await router.push("/");
  } catch (error) {
    toast.error(getRequestErrorMessage(error));
  } finally {
    pending.value = false;
  }
};
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" class="h-10 rounded-full border-border/70 bg-card/70 px-2.5">
        <Avatar class="size-7">
          <AvatarFallback class="bg-primary/15 text-xs font-semibold text-primary">{{ initials }}</AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-56 border-border/80 bg-popover/95 backdrop-blur">
      <DropdownMenuLabel class="space-y-1">
        <p class="text-sm font-medium text-foreground">{{ session.user.value?.email }}</p>
        <p class="text-xs uppercase tracking-[0.24em] text-muted-foreground">{{ session.role ?? "customer" }}</p>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem as-child>
        <NuxtLink to="/account" class="flex w-full items-center gap-2">
          <Settings class="size-4" />
          Account
        </NuxtLink>
      </DropdownMenuItem>
      <DropdownMenuItem v-if="session.isAdmin" as-child>
        <NuxtLink to="/admin" class="flex w-full items-center gap-2">
          <Shield class="size-4" />
          Admin
        </NuxtLink>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem :disabled="pending || route.path === '/login'" class="gap-2 text-destructive focus:text-destructive" @select.prevent="handleLogout">
        <LogOut class="size-4" />
        Logout
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
