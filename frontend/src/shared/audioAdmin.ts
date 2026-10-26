import {
  apiAdminDelete,
  apiAdminUpdate,
  apiAdminUpload,
  apiRequest,
} from "./api";
import type { Track } from "./tracks";

export interface AudioAdminTokenResponse {
  access_token: string;
}

export function unlockAudioAdmin(
  password: string,
): Promise<AudioAdminTokenResponse> {
  return apiRequest<AudioAdminTokenResponse>("/audio-admin/unlock", {
    password,
  });
}

export function createManagedTrack(formData: FormData): Promise<Track> {
  return apiAdminUpload<Track>("/tracks", formData);
}

export function updateManagedTrack(
  trackId: number,
  formData: FormData,
): Promise<Track> {
  return apiAdminUpdate<Track>(`/tracks/${trackId.toString()}`, formData);
}

export function deleteManagedTrack(trackId: number): Promise<void> {
  return apiAdminDelete(`/tracks/${trackId.toString()}`);
}