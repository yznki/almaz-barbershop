import type { Tables } from "../types/database";

type ProfileRole = Tables<"profiles">["role"] | null;

type AuthUser = {
  id: string;
  email: string | null;
  fullName: string | null;
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

type SignupPayload = {
  fullName: string;
  email: string;
  password: string;
};

export type { AuthResponse, LoginPayload, SignupPayload };

export const useAuthApi = () => {
  const login = (payload: LoginPayload) => {
    return $fetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: payload,
    });
  };

  const signup = (payload: SignupPayload) => {
    return $fetch<AuthResponse & { emailConfirmationRequired?: boolean }>("/api/auth/signup", {
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
    signup,
    logout,
    getMe,
  };
};
