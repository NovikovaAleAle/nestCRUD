import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from '../../config/constants';
//import { User } from '../../users/user.entity';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
import { Credential } from '../../credentials/credential.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredAuthorizate = this.reflector.get<string[]>(
      ROLE_KEY,
      context.getHandler(),
    );

    if (!requiredAuthorizate) return true;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const req = context.switchToHttp().getRequest() as Request;
    if (req.user) {
      const credential = req.user as Partial<Credential>;
      console.log('cred:', credential);
      const role = await this.usersService.findRolebyIdCredential(credential);
      console.log('role:', typeof role, role);
      console.log('edew', typeof requiredAuthorizate, requiredAuthorizate);
      if (!(role && requiredAuthorizate.includes(role))) {
        this.logger.warn(`Credential id:${credential.id} not confirmed`);
        throw new ForbiddenException();
      }
      this.logger.log(`Credential id:${credential.id} confirmed`);
      return true;
    }
    return false;
  }
}
