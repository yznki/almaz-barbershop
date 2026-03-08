import type { Tables } from "../types/database";

type ProfileRole = Tables<"profiles">["role"] | null;

type AuthUser = {
  id: string;
  email: string | null;
};

type AuthResponse = {
  authenticated: boolean;
  user: AuthUser | null;
  role: ProfileRole;
};

type LoginPayload = {
  email: string;
  password: string;
};

export const useAuthApi = () => {
  const login = (payload: LoginPayload) => {
    return $fetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: payload,
    });
  };

  const logout = () => {
    return $fetch<{ success: true }>("/api/auth/logout", {
      method: "POST",
    });
  };

  const getMe = () => {
    return useFetch<AuthResponse>("/api/auth/me", {
      key: "auth-me",
    });
  };

  return {
    login,
    logout,
    getMe,
  };
};
