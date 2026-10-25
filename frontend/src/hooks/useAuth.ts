import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../shared/api";
import type { LoginType, RegisterType } from "../shared/validation/auth.schema";
import { useAuthStore } from "../store/auth.store";

interface AuthResponse {
  access_token: string;
}

export const useLogin = () => {
  const setToken = useAuthStore((state) => state.setToken);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginType) =>
      apiRequest<AuthResponse>("/auth/login", data),
    onSuccess: ({ access_token }) => {
      setToken(access_token);
      void navigate("/home", { replace: true });
    },
  });
};

export const useRegister = () => {
  const setToken = useAuthStore((state) => state.setToken);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterType) =>
      apiRequest<AuthResponse>("/auth/register", data),
    onSuccess: ({ access_token }) => {
      setToken(access_token);
      void navigate("/home", { replace: true });
    },
  });
};
