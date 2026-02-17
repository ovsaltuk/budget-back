const express = require("express");
const router = express.Router();
const transactionsController = require("../controllers/transactionsController");
const auth = require("../middlewares/auth");
const { createTransactionValidation } = require('../validators/transactionsValidation');

router.post(
  "/create",
  auth,
  createTransactionValidation,
  transactionsController.createTransaction,
);

router.get(
  "/",
  auth,
  transactionsController.getAllTransactions,
);

module.exports = router;
