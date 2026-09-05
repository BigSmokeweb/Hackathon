import { Controller, Get, Put, Body, UseGuards, UsePipes } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  UpdateTravelerProfileSchema,
  UpdateTravelerProfileDto,
} from '@experience-platform/shared';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Put('me/profile')
  @UsePipes(new ZodValidationPipe(UpdateTravelerProfileSchema))
  async updateMyProfile(
    @CurrentUser('id') userId: string,
    @Body() body: UpdateTravelerProfileDto,
  ) {
    return this.usersService.updateProfile(userId, body);
  }
}
