const { Router } = require("express");
const scheduleController = require("../controllers/scheduleController");
const router = Router();

router.post("/add", scheduleController.cekToken, scheduleController.addSchedule);
router.put("/cancel", scheduleController.cekToken, scheduleController.cancelSchedule);
router.get("/list", scheduleController.cekToken, scheduleController.listSchedule);
router.get("/pending", scheduleController.cekToken, scheduleController.showPendingSchedule);
router.put("/approve", scheduleController.cekToken, scheduleController.approveSchedule);
router.get("/details/:id_schedule", scheduleController.cekToken, scheduleController.detailSchedule);
router.get("/getAlternativeSchedule", scheduleController.cekToken, scheduleController.getAlternativeSchedule);

module.exports = router;