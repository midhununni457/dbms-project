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

// Student only route
router.post(
  "/create",
  AuthMiddleware.authorizeStudent,
  validateResponse,
  responseController.createResponse
);

router.get(
  "/test/:testId/student",
  validateTestIdParam,
  responseController.getAllResponsesByStudentForTest
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
