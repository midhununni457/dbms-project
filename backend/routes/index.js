const router = require("express").Router();
const authRouter = require("./authRouter");
const testRouter = require("./testRouter");

router.use("/auth", authRouter);
router.use("/test", testRouter);

module.exports = router;