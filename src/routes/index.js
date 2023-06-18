const userRouter = require("./user");
const groupRouter = require("./group");
const scheduleRouter = require("./schedule");
const meetingRouter = require("./meeting");
const { Router } = require("express");

const router = Router();
router.use("/users", userRouter);
router.use("/groups", groupRouter);
router.use("/schedules", scheduleRouter);
router.use("/meetings", meetingRouter);

module.exports = router;