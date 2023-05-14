const { Router } = require("express");
const userController = require("../controllers/userController");
const router = Router();

router.get("/", userController.getAll);
router.post("/register", userController.registerUser);
router.post("/login", userController.login);
router.post("/topup", userController.cekToken, userController.topupSaldo);
router.post("/subscribe", userController.cekToken, userController.subscribe);
router.put("/editProfile", userController.cekToken, userController.updateProfilePic);

module.exports = router;