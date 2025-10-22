const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require("../utils/error");
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

class ResponseController {
  createResponse = async (req, res) => {
    if (!req.body) throw new BadRequestError("No request body provided");
    const { answer, questionId } = req.body;

    if (!answer || !questionId) {
      throw new BadRequestError("answer & questionId are required");
    }

    const question = await prisma.question.findUnique({
      where: { id: parseInt(questionId) },
    });
    if (!question) throw new NotFoundError("Question not found");

    // Auto-calculate isCorrect and marksAwarded for MCQ type
    let isCorrect = null;
    let marksAwarded = null;

    if (question.type === "mcq" && question.answer) {
      isCorrect = answer === question.answer;
      marksAwarded = isCorrect ? question.marks : 0;
    }

    const newResponse = await prisma.response.create({
      data: {
        answer,
        questionId: parseInt(questionId),
        studentId: req.user.id,
        isCorrect,
        marksAwarded,
        testId: question.testId,
      },
    });

    return res.status(201).json({
      message: "Response created successfully",
      response: newResponse,
    });
  };

  updateResponse = async (req, res) => {
    const { responseId } = req.params;

    if (!req.body) throw new BadRequestError("No request body provided");
    const { marksAwarded, isCorrect } = req.body;

    if (
      marksAwarded === undefined ||
      marksAwarded === null ||
      isCorrect === undefined ||
      isCorrect === null
    ) {
      throw new BadRequestError("marksAwarded & isCorrect are required");
    }

    const response = await prisma.response.findUnique({
      where: { id: parseInt(responseId) },
      include: { question: { include: { test: true } } },
    });
    if (!response) throw new NotFoundError("Response not found");

    // Only faculty can update responses (for grading purposes)
    if (response.question.test.facultyId !== req.user.id) {
      throw new ForbiddenError(
        "You are not authorized to grade this response."
      );
    }

    const updatedResponse = await prisma.response.update({
      data: {
        marksAwarded: parseFloat(marksAwarded),
        isCorrect: Boolean(isCorrect),
      },
      where: { id: parseInt(responseId) },
    });

    return res.status(200).json({
      message: "Response graded successfully",
      response: updatedResponse,
    });
  };

  getResponseById = async (req, res) => {
    const { responseId } = req.params;

    const response = await prisma.response.findUnique({
      where: { id: parseInt(responseId) },
      include: {
        question: true,
        student: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    if (!response) throw new NotFoundError("Response not found");

    return res
      .status(200)
      .json({ message: "Response fetched successfully", response: response });
  };

  getAllResponsesByStudentForTest = async (req, res) => {
    const { testId } = req.params;
    const { studentId } = req.query;

    const targetStudentId = studentId ? parseInt(studentId) : req.user.id;

    if (studentId && req.user.id !== targetStudentId) {
      const test = await prisma.test.findUnique({
        where: { id: parseInt(testId) },
      });
      if (!test) throw new NotFoundError("Test not found");
      if (test.facultyId !== req.user.id) {
        throw new ForbiddenError(
          "You are not authorized to view these responses."
        );
      }
    }

    const responses = await prisma.response.findMany({
      where: {
        studentId: targetStudentId,
        question: {
          testId: parseInt(testId),
        },
      },
      include: {
        question: true,
        student: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        question: {
          id: "asc",
        },
      },
    });

    return res.status(200).json({
      message: "Student responses for test fetched successfully",
      responses: responses,
    });
  };

  getAllResponsesByQuestion = async (req, res) => {
    const { questionId } = req.params;

    const responses = await prisma.response.findMany({
      where: { questionId: parseInt(questionId) },
      include: {
        student: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Responses for question fetched successfully",
      responses: responses,
    });
  };

  getAllStudentsWhoAttemptedTest = async (req, res) => {
    const { testId } = req.params;

    // Verify test exists and user has permission
    const test = await prisma.test.findUnique({
      where: { id: parseInt(testId) },
    });
    if (!test) throw new NotFoundError("Test not found");

    // Only faculty who created the test can view this
    if (test.facultyId !== req.user.id) {
      throw new ForbiddenError(
        "You are not authorized to view students for this test."
      );
    }

    const responses = await prisma.response.findMany({
      where: {
        testId: parseInt(testId),
      },
      select: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      distinct: ["studentId"],
    });

    const uniqueStudents = responses.map((response) => response.student);

    return res.status(200).json({
      message: "Students who attempted the test fetched successfully",
      students: uniqueStudents,
    });
  };
}

module.exports = ResponseController;
