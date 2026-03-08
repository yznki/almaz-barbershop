import type { AuthResponse } from "../composables/useAuthApi";

export default defineNuxtRouteMiddleware(async () => {
  const headers = import.meta.server ? useRequestHeaders(["cookie"]) : undefined;
  const auth = await $fetch<AuthResponse>("/api/auth/me", { headers }).catch(() => null);

  if (auth?.authenticated && auth.role === "admin") {
    return navigateTo("/account");
  }
});
