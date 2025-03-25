import { SetMetadata } from '@nestjs/common';
import { AUTHORIZATE_KEY } from '../../config/constants';

export const Authorizate = (status: boolean) =>
  SetMetadata(AUTHORIZATE_KEY, status);
