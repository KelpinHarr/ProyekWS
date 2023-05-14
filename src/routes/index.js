const userRouter = require("./user");
const groupRouter = require("./group");
const { Router } = require("express");

const router = Router();
router.use("/users", userRouter);
router.use("/groups", groupRouter);

module.exports = router;