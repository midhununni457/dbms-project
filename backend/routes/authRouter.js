const router = require("express").Router();
const { userController } = require("../controllers");

router.post("/signup", userController.register);
router.post("/login", userController.login);

router.post("/reset-password", userController.resetPassword);
router.post("/get-security-question", userController.getSecurityQuestion);

module.exports = router;
