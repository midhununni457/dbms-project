const router = require("express").Router();
const { responseController } = require("../controllers");
const AuthMiddleware = require("../middlewares/auth");
const {
  validateResponse,
  isValidResponseID,
  isValidQuestionID,
} = require("../middlewares/response");

// Student only route
router.post(
  "/create",
  AuthMiddleware.authorizeStudent,
  validateResponse,
  responseController.createResponse
);

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

module.exports = router;
