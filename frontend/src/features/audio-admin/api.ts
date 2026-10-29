import {
  apiAdminDelete,
  apiAdminUpdate,
  apiAdminUpload,
  apiRequest,
} from "../../shared/api/client";
import { AUDIO_ADMIN_ROUTE } from "../../shared/lib/constants";
import type { Track } from "../tracks/api";

export interface AudioAdminTokenResponse {
  access_token: string;
}

export function unlockAudioAdmin(
  password: string,
): Promise<AudioAdminTokenResponse> {
  return apiRequest<AudioAdminTokenResponse>(
    `${AUDIO_ADMIN_ROUTE}/unlock`,
    { password },
  );
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