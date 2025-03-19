export class ErrorUserNotFound extends Error {
  constructor() {
    super();
    this.message = 'User not found';
    this.name = 'ErrorUserNotFound';
  }
}
