export class ErrorPostNotFound extends Error {
  constructor() {
    super();
    this.message = 'Post not found';
    this.name = 'ErrorPostNotFound';
  }
}
