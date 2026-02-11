const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { createUserRequestValidation } = require("../validators/createUserRequestValidation");
const { handleValidation } = require("../middlewares/handleValidation");
const auth = require("../middlewares/auth");


router.get("/",auth, userController.getAllUsers);
router.post("/create", createUserRequestValidation, handleValidation, userController.createUser);
router.post('/login', userController.login);


module.exports = router;