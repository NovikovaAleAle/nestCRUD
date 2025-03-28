import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(error: any, credentialReq: any): any {
    if (error || !credentialReq) {
      throw error || new UnauthorizedException();
    }
    return credentialReq;
  }
}
