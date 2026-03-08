<script setup lang="ts">
import { LogOut, Menu } from "lucide-vue-next";
import { toast } from "vue-sonner";
import { getRequestErrorMessage } from "../lib/formatters";

const session = useAuthSession();
const authenticated = session.authenticated;
const hasSession = session.hasSession;
const isAdmin = session.isAdmin;
const user = session.user;
const route = useRoute();
const router = useRouter();
const authApi = useAuthApi();
const mobileOpen = ref(false);
const logoutPending = ref(false);

const baseLinks = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/barbers", label: "Barbers" },
  { to: "/book", label: "Book" },
];

const links = computed(() => (isAdmin.value ? baseLinks.filter((link) => link.to !== "/book") : baseLinks));

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false;
  },
);

const closeMobileSheet = () => {
  mobileOpen.value = false;
};

const handleLogout = async () => {
  logoutPending.value = true;

  try {
    await authApi.logout();
    clearNuxtData("auth-me");
    await session.refreshSession();
    closeMobileSheet();
    toast.success("Signed out");
    await router.push("/");
  } catch (error) {
    toast.error(getRequestErrorMessage(error));
  } finally {
    logoutPending.value = false;
  }
};
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
      <AppLogo />

      <nav class="hidden items-center gap-1 md:flex">
        <Button
          v-for="link in links"
          :key="link.to"
          as-child
          variant="ghost"
          class="rounded-full px-4 text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground"
        >
          <NuxtLink :to="link.to">{{ link.label }}</NuxtLink>
        </Button>
        <Button
          v-if="hasSession && isAdmin"
          as-child
          variant="ghost"
          class="rounded-full px-4 text-sm text-primary hover:bg-accent/60 hover:text-primary"
        >
          <NuxtLink to="/admin">Admin</NuxtLink>
        </Button>
      </nav>

      <div class="hidden items-center gap-3 md:flex">
        <Button
          v-if="!isAdmin"
          as-child
          class="rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90"
        >
          <NuxtLink to="/book">Book now</NuxtLink>
        </Button>
        <AppUserMenu v-if="hasSession && authenticated" />
        <AppGuestMenu v-else />
      </div>

      <Sheet v-model:open="mobileOpen">
        <SheetTrigger as-child>
          <Button variant="outline" size="icon" class="md:hidden">
            <Menu class="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" class="border-border/70 bg-background/95 px-6">
          <SheetHeader class="pb-6">
            <SheetTitle class="text-left">
              <AppLogo compact />
            </SheetTitle>
          </SheetHeader>
          <div class="space-y-3">
            <Button
              v-for="link in links"
              :key="link.to"
              as-child
              variant="ghost"
              class="w-full justify-start rounded-xl py-6 text-base"
            >
              <NuxtLink :to="link.to" @click="closeMobileSheet">{{ link.label }}</NuxtLink>
            </Button>
            <Button
              v-if="hasSession && isAdmin"
              as-child
              variant="ghost"
              class="w-full justify-start rounded-xl py-6 text-base text-primary"
            >
              <NuxtLink to="/admin" @click="closeMobileSheet">Admin</NuxtLink>
            </Button>
          </div>
          <Separator class="my-6" />
          <div v-if="hasSession && authenticated" class="space-y-4">
            <div class="rounded-2xl border border-border/70 bg-card/60 p-4">
              <p class="text-sm font-medium text-foreground">{{ user?.fullName || user?.email }}</p>
              <p class="mt-1 text-sm text-muted-foreground">Signed in</p>
            </div>
            <div class="space-y-3">
              <Button as-child variant="outline" class="w-full rounded-xl">
                <NuxtLink to="/account" @click="closeMobileSheet">Account</NuxtLink>
              </Button>
              <Button
                variant="outline"
                class="w-full rounded-xl text-destructive"
                :disabled="logoutPending"
                @click="handleLogout"
              >
                <LogOut class="size-4" />
                {{ logoutPending ? "Logging out..." : "Logout" }}
              </Button>
            </div>
          </div>
          <div v-else class="space-y-3">
            <Button v-if="!isAdmin" as-child class="w-full rounded-xl bg-primary text-primary-foreground">
              <NuxtLink to="/book" @click="closeMobileSheet">Book now</NuxtLink>
            </Button>
            <Button as-child variant="outline" class="w-full rounded-xl">
              <NuxtLink to="/login" @click="closeMobileSheet">Login</NuxtLink>
            </Button>
            <Button as-child variant="outline" class="w-full rounded-xl">
              <NuxtLink to="/signup" @click="closeMobileSheet">Signup</NuxtLink>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  </header>
</template>
