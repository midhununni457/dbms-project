const router = require("express").Router();
const { questionController } = require("../controllers");
const AuthMiddleware = require("../middlewares/auth");
const { validateQuestion } = require("../middlewares/question");

router.get("/test/:testId", questionController.getQuestionsForTest);
router.get("/:id", questionController.getQuestionById);

// faculty only routes
router.use(AuthMiddleware.authorizeFaculty);
router.post("/", validateQuestion, questionController.createQuestion);
router.put("/:id", validateQuestion, questionController.updateQuestion);
router.delete("/:id", questionController.deleteQuestion);

module.exports = router;
