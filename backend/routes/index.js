const router = require("express").Router();
const authRouter = require("./authRouter");
const testRouter = require("./testRouter");
const AuthMiddleware = require("../middlewares/auth");

router.use("/auth", authRouter);

// except auth routes, all routes require the user to be logged in
router.use(AuthMiddleware.authenticateUser); 
router.use("/tests", testRouter);

module.exports = router;