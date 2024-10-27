const express = require('express');
const { registerUser, loginUser } = require('../controllers/users');
const router = express.Router();

console.log("ENTRA USERS ROUTS");

router.post('/registerUser', registerUser);
router.post('/loginUser', loginUser);

module.exports = router;