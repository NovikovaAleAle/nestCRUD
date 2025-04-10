import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from '../../../config/constants';
import { Request } from 'express';
import { RoleCredentialDto } from '../../../dto/interfaces';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      ROLE_KEY,
      context.getHandler(),
    );

    if (!requiredRoles) return true;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const req = context.switchToHttp().getRequest() as Request;
    const roleCredentialReq = req.user as RoleCredentialDto;
    const { id, role } = roleCredentialReq;
    if (!(id && requiredRoles.includes(role))) {
      this.logger.warn(`User id:${id} not confirmed`);
      throw new ForbiddenException();
    }
    this.logger.log(`User id:${id} confirmed`);
    return true;
  }
}
