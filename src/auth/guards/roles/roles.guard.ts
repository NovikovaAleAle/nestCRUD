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
import { UsersService } from '../../../users/users.service';
import { Credential } from '../../../credentials/credential.entity';
import { UserRoleDto } from 'src/dto/user.role.dto';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);
  constructor(
    private usersService: UsersService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      ROLE_KEY,
      context.getHandler(),
    );

    if (!requiredRoles) return true;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const req = context.switchToHttp().getRequest() as Request;
    const credentialReq = req.user as Partial<Credential>;
    const credentialId = credentialReq.id;
    if (credentialId) {
      const user: UserRoleDto = await this.usersService.findUserbyIdCredential(credentialId);
        if (!(user.role && requiredRoles.includes(user.role))) {
          this.logger.warn(`User id:${user.id} not confirmed`);
          throw new ForbiddenException();
        }
        this.logger.log(`User id:${user.id} confirmed`);
        return true;
    } 
    return false;
  }
}
