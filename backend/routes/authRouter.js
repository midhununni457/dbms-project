const router = require("express").Router();
const { userController } = require("../controllers");

router.post("/signup", userController.register)

module.exports = router;
