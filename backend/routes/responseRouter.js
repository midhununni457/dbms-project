const router = require("express").Router();
const { responseController } = require("../controllers");
const AuthMiddleware = require("../middlewares/auth");
const { validateResponse, isValidResponseID, isValidQuestionID } = require("../middlewares/response");

// Public routes (faculty can view all responses)
router.get("/", AuthMiddleware.authorizeFaculty, responseController.getAllResponses);
router.get("/:responseId", isValidResponseID, responseController.getResponseById);
router.get("/question/:questionId", isValidQuestionID, responseController.getAllResponsesByQuestion);

// Student routes
router.use(AuthMiddleware.authorizeStudent);
router.post("/create", validateResponse, responseController.createResponse);
router.get("/test/:testId", responseController.getAllResponsesByStudentForTest);
router.delete("/:responseId", isValidResponseID, responseController.deleteResponse);

// Faculty grading routes
router.use(AuthMiddleware.authorizeFaculty);
router.put("/:responseId", isValidResponseID, responseController.updateResponse);
router.get("/test/:testId/student", responseController.getAllResponsesByStudentForTest);

module.exports = router;
