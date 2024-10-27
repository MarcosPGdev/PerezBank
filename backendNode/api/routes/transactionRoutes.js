const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactions');

console.log("ENTRA EN TRANSACTION ROUTES");

router.post('/transactions', transactionsController.handleTransactions);

module.exports = router;