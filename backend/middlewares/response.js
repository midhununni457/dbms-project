const { BadRequestError, NotFoundError } = require("../utils/error");
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const validateResponse = (req, res, next) => {
  const { answer, questionId } = req.body;

  if (!answer || !questionId) {
    throw new BadRequestError("Answer and questionId are required");
  }

  next();
};

const isValidResponseID = async (req, res, next) => {
  const { responseId } = req.params;

  if (!responseId || isNaN(parseInt(responseId))) {
    throw new BadRequestError("Invalid response ID");
  }

  const response = await prisma.response.findUnique({
    where: { id: parseInt(responseId) },
  });

  if (!response) {
    throw new NotFoundError("Response not found");
  }

  next();
};

const isValidQuestionID = async (req, res, next) => {
  const { questionId } = req.params;

  if (!questionId || isNaN(parseInt(questionId))) {
    throw new BadRequestError("Invalid question ID");
  }

  const question = await prisma.question.findUnique({
    where: { id: parseInt(questionId) },
  });

  if (!question) {
    throw new NotFoundError("Question not found");
  }

  next();
};

module.exports = {
  validateResponse,
  isValidResponseID,
  isValidQuestionID,
};
