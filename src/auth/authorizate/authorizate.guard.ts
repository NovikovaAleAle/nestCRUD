import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTHORIZATE_KEY } from '../../config/constants';
import { Credential } from '../../credentials/credential.entity';
import { Request } from 'express';

@Injectable()
export class AuthorizateGuard implements CanActivate {
  private readonly logger = new Logger(AuthorizateGuard.name);
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredAuthorizate = this.reflector.get<boolean>(
      AUTHORIZATE_KEY,
      context.getHandler(),
    );

    if (!requiredAuthorizate) return true;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const req = context.switchToHttp().getRequest() as Request;
    if (req.user) {
      const credential = req.user as Partial<Credential>;
      if (requiredAuthorizate !== credential.authorization) {
        this.logger.warn(`Credential id:${credential.id} not confirmed`);
        throw new ForbiddenException();
      }
      this.logger.log(`Credential id:${credential.id} confirmed`);
      return true;
    }
    return false;
  }
}
