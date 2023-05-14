const { Router } = require("express");
const userController = require("../controllers/userController");
const router = Router();

router.get("/", userController.getAll);
router.post("/register", userController.registerUser);
router.post("/login", userController.login);
router.put("/topup", userController.cekToken, userController.topupSaldo);

module.exports = router;