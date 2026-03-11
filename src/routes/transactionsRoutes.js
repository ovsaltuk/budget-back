const express = require("express");
const router = express.Router();
const {transactionsController, upload} = require("../controllers/transactionsController");
const auth = require("../middlewares/auth");
const { createTransactionValidation, createTransactionsBulkValidation } = require('../validators/transactionsValidation');

router.post(
  "/create",
  auth,
  createTransactionValidation,
  transactionsController.createTransaction,
);
router.post(
  "/bulk-create",
  auth,
  createTransactionsBulkValidation,
  transactionsController.createTransactions,
);

router.get(
  "/",
  auth,
  transactionsController.getAllTransactions,
);

router.delete('/:id', auth, transactionsController.deleteTransaction);
router.post('/upload-excel', auth, upload.single('excel'), transactionsController.uploadExcelTransactions);


module.exports = router;
