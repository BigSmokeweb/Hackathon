import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StorageService } from '../../common/storage/storage.service';
import { VerificationStatus } from '@experience-platform/shared';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  /**
   * List pending provider KYC verifications
   */
  async getPendingVerifications() {
    return this.prisma.providerProfile.findMany({
      where: { verificationStatus: VerificationStatus.PENDING_REVIEW },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { kycSubmittedAt: 'asc' },
    });
  }

  /**
   * Get short-lived signed URL for reviewing private KYC document
   */
  async getKycDocumentReviewUrl(providerId: string) {
    const provider = await this.prisma.providerProfile.findUnique({
      where: { id: providerId },
    });
    if (!provider || !provider.kycDocumentRef) {
      throw new NotFoundException('Provider KYC document not found');
    }

    const signedUrl = await this.storageService.generateKycReadSignedUrl(
      provider.kycDocumentRef,
    );

    return { signedUrl, kycDocumentType: provider.kycDocumentType };
  }

  /**
   * Approve or reject provider verification
   */
  async updateVerificationStatus(
    providerId: string,
    status: VerificationStatus.VERIFIED | VerificationStatus.REJECTED,
    rejectionReason?: string,
  ) {
    return this.prisma.providerProfile.update({
      where: { id: providerId },
      data: {
        verificationStatus: status,
        kycVerifiedAt: status === VerificationStatus.VERIFIED ? new Date() : null,
        kycRejectionReason: status === VerificationStatus.REJECTED ? rejectionReason : null,
      },
    });
  }
}
