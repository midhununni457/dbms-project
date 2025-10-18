class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
    this.name = "UnauthorizedError";
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
    this.name = "ForbiddenError";
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
    this.name = "NotFoundError";
  }
}

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
    this.name = "BadRequestError";
  }
}

class InternalServerError extends Error {
  debug;
  constructor(message, debug) {
    super(message);
    Object.setPrototypeOf(this, InternalServerError.prototype);
    this.name = "InternalServerError";
    this.debug = debug;
  }
}

module.exports = {
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
  InternalServerError,
};
