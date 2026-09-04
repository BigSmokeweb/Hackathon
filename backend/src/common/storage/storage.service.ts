import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class StorageService {
  private readonly publicBucket: string;
  private readonly privateKycBucket: string;
  private readonly endpoint: string;
  private readonly signedExpirySeconds: number;

  constructor(private readonly configService: ConfigService) {
    this.publicBucket = this.configService.get<string>('STORAGE_PUBLIC_BUCKET', 'experience-public-media');
    this.privateKycBucket = this.configService.get<string>('STORAGE_PRIVATE_KYC_BUCKET', 'provider-kyc-documents-restricted');
    this.endpoint = this.configService.get<string>('STORAGE_ENDPOINT', 'http://localhost:9000');
    this.signedExpirySeconds = Number(this.configService.get<number>('STORAGE_SIGNED_URL_EXPIRY_SECONDS', 900));
  }

  /**
   * Generates a signed, single-use, short-lived (15 min) URL for uploading a KYC document
   * to the private access-restricted bucket.
   */
  async generateKycUploadSignedUrl(
    providerId: string,
    documentType: string,
    fileName: string,
  ): Promise<{ uploadUrl: string; storageKey: string; expiresAt: Date }> {
    const fileExt = fileName.split('.').pop() || 'dat';
    const storageKey = `kyc/${providerId}/${documentType}_${crypto.randomUUID()}.${fileExt}`;
    const expiresAt = new Date(Date.now() + this.signedExpirySeconds * 1000);

    // Generate cryptographic signature token for pre-signed upload
    const signature = crypto
      .createHmac('sha256', this.configService.get<string>('STORAGE_SECRET_KEY', 'kyc-secret'))
      .update(`${this.privateKycBucket}:${storageKey}:${expiresAt.getTime()}`)
      .digest('hex');

    const uploadUrl = `${this.endpoint}/${this.privateKycBucket}/${storageKey}?sig=${signature}&exp=${expiresAt.getTime()}`;

    return {
      uploadUrl,
      storageKey,
      expiresAt,
    };
  }

  /**
   * Generates a short-lived (15 min) read URL for admin KYC document verification
   */
  async generateKycReadSignedUrl(storageKey: string): Promise<string> {
    const expiresAt = new Date(Date.now() + this.signedExpirySeconds * 1000);
    const signature = crypto
      .createHmac('sha256', this.configService.get<string>('STORAGE_SECRET_KEY', 'kyc-secret'))
      .update(`read:${this.privateKycBucket}:${storageKey}:${expiresAt.getTime()}`)
      .digest('hex');

    return `${this.endpoint}/${this.privateKycBucket}/${storageKey}?sig=${signature}&exp=${expiresAt.getTime()}`;
  }
}
