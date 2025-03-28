import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class BasicAuthGuard extends AuthGuard('basic') {
  handleRequest(error: any, credentialReq: any): any {
    if (error || !credentialReq) {
      throw error || new UnauthorizedException();
    }
    return credentialReq;
  }
}
