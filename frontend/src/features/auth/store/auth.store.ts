import { create } from "zustand";

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: getStoredToken(),

  setToken: (token) => {
    updateStorage((storage) => {
      storage.setItem("radio_token", token);
    });
    set({ token });
  },

  logout: () => {
    updateStorage((storage) => {
      storage.removeItem("radio_token");
    });
    set({ token: null });
  },
}));

function getStoredToken(): string | null {
  return getStorage()?.getItem("radio_token") ?? null;
}

function getStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function updateStorage(update: (storage: Storage) => void): void {
  try {
    const storage = getStorage();

    if (storage) {
      update(storage);
    }
  } catch {
    return;
  }
}