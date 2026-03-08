import type { AuthResponse } from "./useAuthApi";

export const useAuthSession = () => {
  const { getMe } = useAuthApi();
  const auth = getMe();

  const authenticated = computed(() => auth.data.value?.authenticated ?? false);
  const role = computed<AuthResponse["role"]>(() => auth.data.value?.role ?? null);
  const user = computed(() => auth.data.value?.user ?? null);
  const isAdmin = computed(() => role.value === "admin");

  const refreshSession = async () => {
    await refreshNuxtData("auth-me");
    await auth.refresh();
  };

  return {
    ...auth,
    authenticated,
    role,
    user,
    isAdmin,
    refreshSession,
  };
};
