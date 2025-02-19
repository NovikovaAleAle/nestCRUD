import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorNotFound } from './error-not-found';

export const errorsHandler = (error: Error): HttpException => {
  console.error('Error: ', error);
  if (error instanceof ErrorNotFound) {
    throw new HttpException(error.message, HttpStatus.NOT_FOUND);
  }
  throw new HttpException(
    'Failed to fetch users',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
};
