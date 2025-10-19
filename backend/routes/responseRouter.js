const router = require("express").Router();
const { responseController } = require("../controllers");
const AuthMiddleware = require("../middlewares/auth");
const {
  validateResponse,
  isValidResponseID,
  isValidQuestionID,
} = require("../middlewares/response");

// Public routes (faculty can view all responses)
router.post("/create", validateResponse, responseController.createResponse);

// Faculty only routes
router.use(AuthMiddleware.authorizeFaculty);
router.get(
  "/:responseId",
  isValidResponseID,
  responseController.getResponseById
);
router.get(
  "/question/:questionId",
  isValidQuestionID,
  responseController.getAllResponsesByQuestion
);
router.put(
  "/:responseId",
  isValidResponseID,
  responseController.updateResponse
);
router.get(
  "/test/:testId/student",
  responseController.getAllResponsesByStudentForTest
);
router.get("/test/:testId", responseController.getAllResponsesByStudentForTest);

module.exports = router;
