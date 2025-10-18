const router = require("express").Router();
const { testController } = require("../controllers");
const AuthMiddleware = require("../middlewares/auth");
const { isValidTestID } = require("../middlewares/test");

router.get("/", testController.getAllTests);
router.get("/test/:testId", isValidTestID, testController.getTestByID);
// Below are routes that reequire faculty role to access
router.use(AuthMiddleware.authorizeFaculty);
router.post("/create", testController.createTest);
router.get("/faculty", testController.getAllTestsByFaculty);
router.put("/test/:testId", isValidTestID, testController.updateTest);
router.delete("/test/:testId", isValidTestID, testController.deleteTest);

module.exports = router;
