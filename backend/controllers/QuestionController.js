const { BadRequestError, NotFoundError } = require("../utils/error");
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

class QuestionController {
  getQuestionsForTest = async (req, res) => {
    const { testId } = req.params;

    const test = await prisma.test.findUnique({
      where: { id: parseInt(testId) },
    });
    if (!test) throw new NotFoundError("Test not found");

    const questions = await prisma.question.findMany({
      where: { testId: parseInt(testId) },
    });

    return res.status(200).json({
      message: "Questions fetched successfully",
      questions: questions,
    });
  };

  getQuestionById = async (req, res) => {
    const { id } = req.params;

    const question = await prisma.question.findUnique({
      where: { id: parseInt(id) },
    });
    if (!question) throw new NotFoundError("Question not found");

    return res
      .status(200)
      .json({ message: "Question fetched successfully", question: question });
  };

  createQuestion = async (req, res) => {
    if (!req.body) throw new BadRequestError("No request body provided");
    const { text, type, options, answer } = req.body;

    if (!text || !type) {
      throw new BadRequestError("Text and type are required");
    }

    if (!["mcq", "long", "short"].includes(type)) {
      throw new BadRequestError("Invalid question type");
    }

    const question = await prisma.question.create({
      data: {
        text,
        type,
        options: type === "mcq" ? options : [],
        answer: type === "mcq" ? answer : null,
      },
    });

    return res
      .status(201)
      .json({ message: "Question created successfully", question: question });
  };

  updateQuestion = async (req, res) => {
    const { id } = req.params;

    if (!req.body) throw new BadRequestError("No request body provided");
    const { text, type, options, answer } = req.body;

    const existing = await prisma.question.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existing) throw new NotFoundError("Question not found");

    if (!["mcq", "long", "short"].includes(type)) {
      throw new BadRequestError("Invalid question type");
    }

    const question = await prisma.question.update({
      where: { id: parseInt(id) },
      data: {
        text,
        type,
        options: type === "mcq" ? options : [],
        answer: type === "mcq" ? answer : null,
      },
    });

    return res
      .status(200)
      .json({ message: "Question updated successfully", question: question });
  };

  deleteQuestion = async (req, res) => {
    const { id } = req.params;

    const question = await prisma.question.findUnique({
      where: { id: parseInt(id) },
    });
    if (!question) throw new NotFoundError("Question not found");

    await prisma.question.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({ message: "Question deleted successfully" });
  };
}

module.exports = QuestionController;
