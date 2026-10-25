import { useAuthStore } from "../store/auth.store";

export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "/api").replace(
  /\/$/,
  "",
);

interface ApiErrorResponse {
  message?: string | string[];
}

export async function apiRequest<T>(
  path: string,
  body: unknown,
  authenticated = false,
): Promise<T> {
  return request<T>(
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    authenticated ? "user" : null,
  );
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
  authenticated = false,
): Promise<T> {
  return request<T>(
    path,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    authenticated ? "user" : null,
  );
}

export async function apiGet<T>(
  path: string,
  authenticated = false,
): Promise<T> {
  return request<T>(path, { method: "GET" }, authenticated ? "user" : null);
}

export async function apiUpload<T>(path: string, body: FormData): Promise<T> {
  return request<T>(path, { method: "POST", body }, "user");
}

export async function apiDelete<T = void>(
  path: string,
  authenticated = false,
): Promise<T> {
  return request<T>(path, { method: "DELETE" }, authenticated ? "user" : null);
}

export async function apiAdminGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: "GET" }, "audio-admin");
}

export async function apiAdminUpload<T>(
  path: string,
  body: FormData,
): Promise<T> {
  return request<T>(path, { method: "POST", body }, "audio-admin");
}

export async function apiAdminUpdate<T>(
  path: string,
  body: FormData,
): Promise<T> {
  return request<T>(path, { method: "PATCH", body }, "audio-admin");
}

export async function apiAdminDelete(path: string): Promise<void> {
  await request<unknown>(path, { method: "DELETE" }, "audio-admin");
}

async function request<T>(
  path: string,
  init: RequestInit,
  authScope: "user" | "audio-admin" | null = null,
): Promise<T> {
  const headers = new Headers(init.headers);
  const token =
    authScope === "user"
      ? useAuthStore.getState().token
      : authScope === "audio-admin";

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    if (authScope === "user") {
      useAuthStore.getState().logout();
    }
  }

  const result: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message = (result as ApiErrorResponse | null)?.message;
    throw new Error(
      Array.isArray(message)
        ? message.join(", ")
        : (message ?? "The request could not be completed"),
    );
  }

  return result as T;
}
