const { Router } = require("express");
const groupController = require("../controllers/groupController");
const router = Router();

router.post("/",groupController.cekToken, groupController.createGroup);
router.post("/:code/join",groupController.cekToken, groupController.joinGroup);
router.get("/:id",groupController.cekToken, groupController.getGroupById);
router.post("/inviteGroup",groupController.cekToken, groupController.inviteGroup);
router.delete("/removeFromGroup",groupController.cekToken, groupController.removeFromGroup);

module.exports = router;