const { BadRequestError } = require("../utils/error");
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const JWTUtil = require("../utils/jwt");

class UserController {
  register = async (req, res) => {
    if (!req.body) throw new BadRequestError("No request body provided");
    const { email, password, name, role, securityQuestion, securityAnswer } =
      req.body;

    if (
      !email ||
      !password ||
      !name ||
      !role ||
      !securityQuestion ||
      !securityAnswer
    ) {
      throw new BadRequestError("All fields are required");
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestError(
        "User already exists. Register with a different email address"
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedSecurityAnswer = await bcrypt.hash(securityAnswer, 10);
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        securityQuestion,
        securityAnswer: hashedSecurityAnswer,
      },
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

  resetPassword = async (req, res) => {
    if (!req.body) throw new BadRequestError("No request body provided");
    const { email, securityAnswer, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestError("User does not exist");

    const isMatch = await bcrypt.compare(securityAnswer, user.securityAnswer);
    if (!isMatch) throw new BadRequestError("Incorrect security answer");

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    res.json({ message: "Password reset successfully" });
  };

  getSecurityQuestion = async (req, res) => {
    if (!req.body) throw new BadRequestError("No request body provided");
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.json({
        error: "User does not exist",
      });

    res.json({
      message: "Security question fetched successfully",
      securityQuestion: user.securityQuestion,
    });
  };
}

module.exports = UserController;
