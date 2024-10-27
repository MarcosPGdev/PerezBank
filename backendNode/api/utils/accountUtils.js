const crypto = require('crypto');

function hashPasswordMD5(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

function generateAccountNumber(connection) {
  return new Promise((resolve, reject) => {
    const accountPrefix = 'ES';
    const randomNumber = Math.floor(1000000000000000 + Math.random() * 9000000000000000);
    const accNumber = accountPrefix + randomNumber;
    const checkAccount = 'SELECT * FROM accounts WHERE AccountNumber = ?';
    connection.query(checkAccount, [accNumber], (err, results) => {
      if (err) {
        return reject(err);
      }
      if (results.length > 0) {
        return resolve(generateAccountNumber());
      } else {
        resolve(accNumber);
      }
    });
  });
}

module.exports = { hashPasswordMD5, generateAccountNumber };