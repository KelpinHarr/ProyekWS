const { Router } = require("express");
const groupController = require("../controllers/groupController");
const router = Router();

router.post("/",groupController.cekToken, groupController.createGroup);
router.post("/:id/join",groupController.cekToken, groupController.joinGroup);
router.get("/:id",groupController.cekToken, groupController.getGroupById);
router.post("/addSchedule", groupController.cekToken, groupController.addSchedule);

module.exports = router;