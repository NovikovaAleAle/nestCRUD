export class ErrorCredentialNotFound extends Error {
  constructor() {
    super();
    this.message = 'Credential not found';
    this.name = 'ErrorCredentialNotFound';
  }
}
