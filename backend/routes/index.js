const router = require("express").Router();
const authRouter = require("./authRouter");
const testRouter = require("./testRouter");
const questionRouter = require("./questionRouter");
const responseRouter = require("./responseRouter");
const AuthMiddleware = require("../middlewares/auth");

router.use("/auth", authRouter);

// except auth routes, all routes require the user to be logged in
router.use(AuthMiddleware.authenticateUser); 
router.use("/tests", testRouter);
router.use("/questions", questionRouter);
router.use("/responses", responseRouter);

module.exports = router;