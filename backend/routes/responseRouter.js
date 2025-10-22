const router = require("express").Router();
const { responseController } = require("../controllers");
const AuthMiddleware = require("../middlewares/auth");
const {
  validateResponse,
  isValidResponseID,
  isValidQuestionID,
  isValidTestID,
} = require("../middlewares/response");
const { isValidTestID: validateTestIdParam } = require("../middlewares/test");

router.get(
  "/test/:testId/student",
  validateTestIdParam,
  responseController.getAllResponsesByStudentForTest
);

router.get(
  "/test/:testId/all",
  validateTestIdParam,
  responseController.getAllStudentsWhoAttemptedTest
);

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

module.exports = router;
