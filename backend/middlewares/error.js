const {
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
  InternalServerError,
} = require("../utils/error");

const errorHandler = (err, req, res, next) => {
  if (err instanceof BadRequestError)
    return res.status(400).json({ error: err.message });
  else if (err instanceof UnauthorizedError)
    return res.status(401).json({ error: err.message });
  else if (err instanceof ForbiddenError)
    return res.status(403).json({ error: err.message });
  else if (err instanceof NotFoundError)
    return res.status(404).json({ error: err.message });
  else if (err instanceof InternalServerError) {
    console.error({
      message: err.message,
      stack: err.stack,
      err: err,
      debug: err.debug,
    });
    return res.status(500).json({ error: err.message });
  } else {
    console.error({
      message: err.message,
      stack: err.stack,
      err: err,
      debug: err.debug,
    });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = errorHandler;
