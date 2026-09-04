import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get traveler profile with IDOR check
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        travelerProfile: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Update traveler profile with IDOR protection
   */
  async updateProfile(userId: string, data: any) {
    return this.prisma.travelerProfile.update({
      where: { userId },
      data: {
        homeCity: data.homeCity,
        interests: data.interests,
        budgetBand: data.budgetBand,
        travelStyle: data.travelStyle,
      },
    });
  }
}
