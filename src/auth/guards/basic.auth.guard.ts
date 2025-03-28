import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class BasicAuthGuard extends AuthGuard('basic') {
  handleRequest(error: any, credential: any): any {
    if (error || !credential) {
      throw error || new UnauthorizedException();
    }
    return credential;
  }
}
