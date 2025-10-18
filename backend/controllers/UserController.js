const { BadRequestError } = require("../utils/error");
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const JWTUtil = require("../utils/jwt");

class UserController {
  register = async (req, res) => {
    if (!req.body) throw new BadRequestError("No request body provided");
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      throw new BadRequestError("All fields are required");
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestError(
        "User already exists. Register with a different email address"
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { email, password: hashedPassword, name, role },
    });

    res.status(201).json({ message: "User registered successfully" });
  };

  login = async (req, res) => {
    if (!req.body) throw new BadRequestError("No request body provided");
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError("email & password are required fields");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestError("User does not exist");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new BadRequestError("Incorrect password");

    const token = JWTUtil.sign(user.id, user.email, user.role);

    res.json({ message: "Logged in successfully", token });
  };
}

module.exports = UserController;
