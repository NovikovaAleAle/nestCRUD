export class ErrorEmailNotSent extends Error {
  constructor() {
    super();
    this.message = 'Email not sent';
    this.name = 'ErrorEmailNotSent';
  }
}
