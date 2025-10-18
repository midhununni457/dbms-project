const router = require("express").Router();
const { questionController } = require("../controllers");
const { validateQuestion } = require("../middlewares/question");

router.get("/", questionController.getQuestions);
router.get("/:id", questionController.getQuestionById);
router.post("/", validateQuestion, questionController.createQuestion);
router.put("/:id", validateQuestion, questionController.updateQuestion);
router.delete("/:id", questionController.deleteQuestion);

module.exports = router;
