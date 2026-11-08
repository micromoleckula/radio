export interface UploadedMediaFile {
  filename: string;
  path: string;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface TrackUploadFiles {
  audio?: UploadedMediaFile;
  cover?: UploadedMediaFile;
}

export interface TrackListItem {
  id: number;
  title: string;
  artist: string;
  album: string | null;
  durationSeconds: number;
  createdAt: Date;
  audioAvailable: boolean;
  coverAvailable: boolean;
}

export interface TrackListResponse {
  items: TrackListItem[];
  total: number;
  limit: number;
  offset: number;
}
