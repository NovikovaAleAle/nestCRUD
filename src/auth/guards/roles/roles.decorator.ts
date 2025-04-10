import { SetMetadata } from '@nestjs/common';
import { Role, ROLE_KEY } from '../../../config/constants';

export const Roles = (roles: Role[]) => SetMetadata(ROLE_KEY, roles);
