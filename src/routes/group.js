const { Router } = require("express");
const groupController = require("../controllers/groupController");
const router = Router();

router.post("/",groupController.cekToken, groupController.createGroup);
router.post("/:code/join",groupController.cekToken, groupController.joinGroup);
// router.get("/:id",groupController.cekToken, groupController.getGroupById);
router.post("/addMeeting",groupController.cekToken, groupController.addMeeting);
router.put("/deleteMeeting",groupController.cekToken, groupController.deleteMeeting);
router.get("/getMeetingDetail",groupController.cekToken, groupController.getMeetingDetail);

module.exports = router;