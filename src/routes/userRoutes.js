const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { createUserRequestValidation } = require("../validators/userValidation");
const { handleValidation } = require("../middlewares/handleValidation");


router.get("/", userController.getAllUsers);
router.post("/create", createUserRequestValidation, handleValidation, userController.createUser);

module.exports = router;