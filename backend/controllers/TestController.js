const { BadRequestError } = require("../utils/error");
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

class TestController {
  createTest = async (req, res) => {
    if (!req.body) throw new BadRequestError("No request body provided");
    const { title, description } = req.body;

    if (!title || !description) {
      throw new BadRequestError("title & description are required");
    }

    const newTest = await prisma.test.create({
      data: {
        title,
        description,
        facultyId: req.user.id,
      },
    });

    return res
      .status(201)
      .json({ message: "Test created succesfully", test: newTest });
  };

  updateTest = async (req, res) => {
    const { testId } = req.params;

    if (!req.body) throw new BadRequestError("No request body provided");

    const { title, description } = req.body;

    const test = await prisma.test.findUnique({
      where: { id: parseInt(testId) },
    });
    if (!test) throw new NotFoundError("Test not found");
    if (test.facultyId !== req.user.id)
      throw new ForbiddenError("You are not authorized to update this test.");

    const updatedTest = await prisma.test.update({
      data: { title, description },
      where: { id: parseInt(testId), facultyId: req.user.id },
    });

    return res
      .status(201)
      .json({ message: "Test updated succesfully", test: test });
  };

  getTestByID = async (req, res) => {
    const { testId } = req.params;

    const test = await prisma.test.findUnique({
      where: { id: parseInt(testId) },
      include: {
        questions: true,
        faculty: {
          select: {
            name: true,
          },
        },
      },
    });
    if (!test) throw new NotFoundError("Test not found");

    return res
      .status(200)
      .json({ message: "Test fetched successfully", test: test });
  };

  getAllTests = async (req, res) => {
    const tests = await prisma.test.findMany({
      include: {
        faculty: {
          select: {
            name: true,
          },
        },
      },
    });

    const testsWithFacultyName = tests.map((test) => {
      return {
        id: test.id,
        title: test.title,
        description: test.description,
        createdAt: test.createdAt,
        updatedAt: test.updatedAt,
        facultyName: test.faculty.name,
        facultyId: test.facultyId,
      };
    });
    return res
      .status(200)
      .json({ message: "All tests fetched successfully", tests: testsWithFacultyName });
  };

  getAllTestsByFaculty = async (req, res) => {
    const tests = await prisma.test.findMany({
      where: { facultyId: req.user.id },
      include: {
        faculty: {
          select: {
            name: true,
          },
        },
        responses: {
          select: {
            studentId: true,
          },
          distinct: ["studentId"],
        },
      },
    });

    const testsWithStudentCount = tests.map((test) => {
      return {
        id: test.id,
        title: test.title,
        description: test.description,
        createdAt: test.createdAt,
        updatedAt: test.updatedAt,
        facultyId: test.facultyId,
        facultyName: test.faculty.name,
        attemptedStudents: test.responses.length,
      };
    });

    return res.status(200).json({
      message: "All tests fetched successfully",
      tests: testsWithStudentCount,
    });
  };

  deleteTest = async (req, res) => {
    const { testId } = req.params;

    const test = await prisma.test.findUnique({
      where: { id: parseInt(testId) },
    });
    if (!test) throw new NotFoundError("Test not found");
    if (test.facultyId !== req.user.id)
      throw new ForbiddenError("You are not authorized to delete this test.");

    await prisma.test.delete({
      where: { id: parseInt(testId), facultyId: req.user.id },
    });
    return res.status(200).json({ message: "Test deleted successfully" });
  };
}

module.exports = TestController;
