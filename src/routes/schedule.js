const { Router } = require("express");
const scheduleController = require("../controllers/scheduleController");
const router = Router();

router.post("/add", scheduleController.cekToken, scheduleController.addSchedule);
router.put("/cancel", scheduleController.cekToken, scheduleController.cancelSchedule);

module.exports = router;