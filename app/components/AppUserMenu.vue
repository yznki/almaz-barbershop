<script setup lang="ts">
import { LogOut, Settings } from "lucide-vue-next";
import { toast } from "vue-sonner";
import { getRequestErrorMessage } from "../lib/formatters";

const session = useAuthSession();
const user = session.user;
const route = useRoute();
const router = useRouter();
const authApi = useAuthApi();

const pending = ref(false);

const initials = computed(() => {
  const label = user.value?.fullName ?? user.value?.email ?? "A";
  return label.slice(0, 1).toUpperCase();
});

const handleLogout = async () => {
  pending.value = true;

  try {
    await authApi.logout();
    clearNuxtData("auth-me");
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
        <p class="text-sm font-medium text-foreground">{{ user?.fullName || user?.email }}</p>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem as-child>
        <NuxtLink to="/account" class="flex w-full items-center gap-2">
          <Settings class="size-4" />
          Account
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
