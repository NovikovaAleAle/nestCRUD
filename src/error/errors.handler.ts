import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorUserNotFound } from './error.user-not-found';

export const errorsHandler = (error: Error): HttpException => {
  if (error instanceof ErrorUserNotFound) {
    throw new HttpException(error.message, HttpStatus.NOT_FOUND);
  }
  throw new HttpException(
    'Failed to fetch users',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
};
