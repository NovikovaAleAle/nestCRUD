export class ErrorNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
    this.name = 'ErrorNotFound';
  }
}
