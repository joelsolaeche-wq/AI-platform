import Mux from '@mux/mux-node';
import { IVideoPort, VideoAsset, VideoUploadRequest } from '../../application/ports/IVideoPort';

export class MuxVideoAdapter implements IVideoPort {
  private readonly client: Mux;

  constructor(tokenId: string, tokenSecret: string) {
    this.client = new Mux({ tokenId, tokenSecret });
  }

  async createDirectUpload(corsOrigin: string): Promise<VideoUploadRequest> {
    const upload = await this.client.video.uploads.create({
      cors_origin: corsOrigin,
      new_asset_settings: {
        playback_policy: ['public'],
        encoding_tier: 'smart',
      },
    });
    return { uploadUrl: upload.url, uploadId: upload.id };
  }

  async getAsset(assetId: string): Promise<VideoAsset> {
    const asset = await this.client.video.assets.retrieve(assetId);
    const playback = asset.playback_ids?.[0];
    if (!playback) throw new Error(`Mux asset ${assetId} has no playback_id yet`);
    return {
      assetId: asset.id,
      playbackId: playback.id,
      durationSec: Math.round(asset.duration ?? 0),
    };
  }
}
