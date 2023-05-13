const { Router } = require("express");
const userController = require("../controllers/userController");
const router = Router();

router.get("/", userController.getAll);


module.exports = router;