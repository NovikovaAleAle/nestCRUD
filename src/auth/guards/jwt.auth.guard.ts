import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(error: any, roleCredentialReq: any): any {
    if (error || !roleCredentialReq) {
      throw error || new UnauthorizedException();
    }
    return roleCredentialReq;
  }
}
