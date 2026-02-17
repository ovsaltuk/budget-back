const express = require("express");
const router = express.Router();
const transactionsController = require("../controllers/transactionsController");
const auth = require("../middlewares/auth");

router.post(
  "/create",
  auth,
  createTransactionValidation,
  transactionsController.createTransaction,
);

module.exports = router;
