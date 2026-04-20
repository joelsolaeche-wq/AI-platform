/**
 * Port for video provider (implemented by Mux adapter).
 */
export interface VideoUploadRequest {
  uploadUrl: string;
  uploadId: string;
}

export interface VideoAsset {
  assetId: string;
  playbackId: string;
  durationSec: number;
}

export interface IVideoPort {
  createDirectUpload(corsOrigin: string): Promise<VideoUploadRequest>;
  getAsset(assetId: string): Promise<VideoAsset>;
}
