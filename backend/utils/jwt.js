const { JWT_SECRET } = require("./env");
const jwt = require("jsonwebtoken");

class JWTUtil {
  sign = (id, email, role) => {
    return jwt.sign({ id, email, role }, JWT_SECRET);
  }

  verify = () => {
    return jwt.verify(token, JWT_SECRET);
  }
}

module.exports = new JWTUtil();
