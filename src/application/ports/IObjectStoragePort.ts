/**
 * Port for object storage (implemented by Cloudflare R2 adapter).
 */
export interface IObjectStoragePort {
  getSignedUploadUrl(key: string, contentType: string, expiresInSec: number): Promise<string>;
  getPublicUrl(key: string): string;
  deleteObject(key: string): Promise<void>;
}
