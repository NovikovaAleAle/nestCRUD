import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ErrorUserNotFound } from './error.user-not-found';
import { ErrorCredentialNotFound } from './error.credential-not-found';
import { ErrorEmailNotSent } from './error.email-not-sent';

export const errorsHandler = (error: Error): HttpException => {
  if (
    error instanceof ErrorUserNotFound ||
    error instanceof ErrorCredentialNotFound
  ) {
    throw new HttpException(error.message, HttpStatus.NOT_FOUND);
  }
  if (
    error instanceof ConflictException ||
    error instanceof BadRequestException
  ) {
    throw error;
  }
  if (error instanceof ErrorEmailNotSent) {
    throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
  throw new HttpException('Failed', HttpStatus.INTERNAL_SERVER_ERROR);
};
