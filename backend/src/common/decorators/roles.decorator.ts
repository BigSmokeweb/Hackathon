import { SetMetadata } from '@nestjs/common';
import { Role } from '@experience-platform/shared';
import { ROLES_KEY } from '../../common/guards/roles.guard';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
