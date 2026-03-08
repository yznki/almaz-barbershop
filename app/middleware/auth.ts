import type { AuthResponse } from "../composables/useAuthApi";

export default defineNuxtRouteMiddleware(async (to) => {
  const headers = import.meta.server ? useRequestHeaders(["cookie"]) : undefined;
  const auth = await $fetch<AuthResponse>("/api/auth/me", { headers }).catch(() => null);

  if (!auth?.authenticated) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }
});
