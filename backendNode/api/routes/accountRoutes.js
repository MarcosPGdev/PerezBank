const express = require('express');
const { blockAccount, createAccount, getAccounts } = require('../controllers/accounts');
const router = express.Router();


console.log("ENTRA ACCOUNTS ROUTES");

router.post('/blockAccount', blockAccount);
router.post('/createAccount', createAccount);
router.get('/get_accounts', getAccounts);

module.exports = router;
