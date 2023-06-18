const { Router } = require("express");
const meetingController = require("../controllers/meetingController");
const router = Router();

router.post("/addMeeting",meetingController.cekToken, meetingController.addMeeting);
router.put("/deleteMeeting",meetingController.cekToken, meetingController.deleteMeeting);
router.get("/getMeetingDetail",meetingController.cekToken, meetingController.getMeetingDetail);
router.get("/getAlternativeMeeting",meetingController.cekToken, meetingController.getAlternativeMeeting);

module.exports = router;