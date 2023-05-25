const userRouter = require("./user");
const groupRouter = require("./group");
const scheduleRouter = require("./schedule");
const { Router } = require("express");

const router = Router();
router.use("/users", userRouter);
router.use("/groups", groupRouter);
router.use("/schedules", scheduleRouter);

module.exports = router;