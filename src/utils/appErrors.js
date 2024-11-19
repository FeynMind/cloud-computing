// eslint-disable-next-line max-classes-per-file
export class QueryError extends Error {
    constructor(message, statusCode = 400) {
      super(message);
  
      this.statusCode = statusCode;
      this.name = 'QueryError';
    }
  }
  
  export class QueryNotFound extends Error {
    constructor(message, statusCode = 404) {
      super(message);
  
      this.statusCode = statusCode;
      this.name = 'QueryNotFound';
    }
  }
  
  export class ValidationError extends Error {
    constructor(message, statusCode = 400) {
      super(message);
  
      this.statusCode = statusCode;
      this.name = 'ValidationError';
    }
  }
  