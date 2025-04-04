import { SetMetadata } from '@nestjs/common';
import { Role, ROLE_KEY } from 'src/config/constants';

export const Roles = (roles: Role[]) => SetMetadata(ROLE_KEY, roles);
