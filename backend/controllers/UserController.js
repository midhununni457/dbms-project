const { BadRequestError } = require("../utils/error");

class UserController {
  register = async (req, res) => {
    if (!req.body) throw new BadRequestError("No request body provided");
    const { email, password, name, role } = req.body;
    if (!email || !password || !name || !role) {
      throw new BadRequestError("All fields are required");
    }
    res.status(200).json({});
  };
}

module.exports = UserController;
