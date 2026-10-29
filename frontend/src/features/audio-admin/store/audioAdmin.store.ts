import { create } from "zustand";

interface AudioAdminState {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAudioAdminStore = create<AudioAdminState>((set) => ({
  token: getStoredToken(),

  setToken: (token) => {
    updateStorage((storage) => {
      storage.setItem("radio_audio_admin_token", token);
    });
    set({ token });
  },

  logout: () => {
    updateStorage((storage) => {
      storage.removeItem("radio_audio_admin_token");
    });
    set({ token: null });
  },
}));

function getStoredToken(): string | null {
  try {
    return typeof window === "undefined"
      ? null
      : window.sessionStorage.getItem("radio_audio_admin_token");
  } catch {
    return null;
  }
}

function updateStorage(update: (storage: Storage) => void): void {
  try {
    if (typeof window !== "undefined") {
      update(window.sessionStorage);
    }
  } catch {
    return;
  }
}
