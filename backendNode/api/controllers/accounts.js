const { generateAccountNumber } = require('../utils/accountUtils');
const jwt = require('jsonwebtoken');
const connection = require('../config/db');
const secretKey = 'perez_bank';

const blockAccount = async (req, res) => {
    const { username } = req.body;
    const blockAcc = 'UPDATE usuarios SET IsBlocked = 1, last_failed_attempt = CURRENT_TIMESTAMP WHERE Username = ?';

    connection.query(blockAcc, [username], (err, userResults) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err);
            return res.status(500).json({ message: 'Error al consultar la base de datos' });
        }
        return res.status(200).json({ message: 'Su cuenta ha sido suspendida temporalmente' });
    });
};

const createAccount = async (req, res) => {
    const { UserId } = req.body;

    console.log("ENTRA accounts");
    try {
        let accountNumber = await generateAccountNumber(connection);
        const insertAccountQuery = 'INSERT INTO accounts (AccountNumber, UserId) VALUES (?, ?)';

        connection.query(insertAccountQuery, [accountNumber, UserId], (err, accountResults) => {
            if (err) {
                console.error('Error al insertar la cuenta:', err);
                return res.status(401).json({ message: 'No se ha podido crear la cuenta' });
            } else {
                return res.status(200).json({ message: 'La cuenta se ha creado con éxito' });
            }
        });
    } catch (error) {
        console.error('Error al crear la cuenta:', error);
        return res.status(500).json({ message: 'Error al crear la cuenta' });
    }
};

const getAccounts = async (req, res) => {
    const decoded = jwt.verify(req.query.token, secretKey);
    const userId = decoded.userId;

    try {
        const selectAccounts = `
            SELECT accounts.*, usuarios.Name, usuarios.Surname 
            FROM accounts 
            INNER JOIN usuarios ON usuarios.Id = accounts.UserId 
            WHERE accounts.UserId = ?
        `;
        
        connection.query(selectAccounts, [userId], async (err, accountResults) => {
            if (err) {
                console.error('Error al consultar la base de datos:', err);
                return res.status(500).json({ message: 'Error al consultar la base de datos' });
            }
            if (accountResults.length === 0) {
                return res.status(200).json({ message: 'El usuario no tiene cuentas' });
            }
            
            let userAccounts = await Promise.all(accountResults.map(async (account) => {
                return new Promise((resolve, reject) => {
                    const getTransactions = `
                        SELECT t.*, o.AccountNumber AS OriginAccountNumber, 
                               DATE_FORMAT(t.Date, "%Y-%m-%d") AS Date, 
                               ta.AccountNumber AS TargetAccountNumber 
                        FROM transactions t 
                        LEFT JOIN accounts o ON t.OriginAccount = o.Id 
                        LEFT JOIN accounts ta ON t.TargetAccount = ta.Id 
                        WHERE OriginAccount = ? OR TargetAccount = ? 
                        ORDER BY Date ASC;
                    `;

                    connection.query(getTransactions, [account.Id, account.Id], (err, transactionsResults) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({
                                account: account,
                                transactions: transactionsResults
                            });
                        }
                    });
                });
            }));
            
            res.status(200).json({ userAccounts });
        });
    } catch (error) {
        console.error('Error general:', error);
        return res.status(500).send('Error inesperado');
    }
};

module.exports = { blockAccount, createAccount, getAccounts };