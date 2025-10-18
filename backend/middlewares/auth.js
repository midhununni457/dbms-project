const { ForbiddenError, UnauthorizedError } = require("../utils/error");
const JWTUtil = require("../utils/jwt");

class AuthMiddleware {
  authenticateUser = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      throw new UnauthorizedError("No authorization header");
    }

    const tokenParts = authorizationHeader.split(" ");

    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      throw new UnauthorizedError("Invalid authorization header");
    }

    const token = tokenParts[1];
    try {
      JWTUtil.verify(token);
    } catch (err) {
      console.log(err)
      throw new UnauthorizedError("Invalid token");
    }

    const user = JWTUtil.decode(token);

    req.user = user;

    next();
  };

  authorizeFaculty = (req, res, next) => {
    if (!req.user)
      throw new ForbiddenError("You do not have permission to access this.");

    if (req.user.role === "faculty") next();
    else throw new ForbiddenError("You do not have permission to access this.");
  };
}

module.exports = new AuthMiddleware();