import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, VerificationStatus } from '@experience-platform/shared';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('verifications/pending')
  async getPendingVerifications() {
    return this.adminService.getPendingVerifications();
  }

  @Get('verifications/:id/document-url')
  async getDocumentUrl(@Param('id') providerId: string) {
    return this.adminService.getKycDocumentReviewUrl(providerId);
  }

  @Post('verifications/:id/status')
  async updateStatus(
    @Param('id') providerId: string,
    @Body() body: { status: VerificationStatus.VERIFIED | VerificationStatus.REJECTED; rejectionReason?: string },
  ) {
    return this.adminService.updateVerificationStatus(
      providerId,
      body.status,
      body.rejectionReason,
    );
  }
}
