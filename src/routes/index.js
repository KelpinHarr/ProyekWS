const userRouter = require("./user");
const { Router } = require("express");

const router = Router();
router.use("/users", userRouter);

module.exports = router;