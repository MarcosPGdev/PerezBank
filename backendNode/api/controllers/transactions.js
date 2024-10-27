const jwt = require('jsonwebtoken');
const connection = require('../config/db');
const secretKey = 'perez_bank'; // Asegúrate de tener tu clave secreta


const transactionsController = {
    handleTransactions: async (req, res) => {
        console.log("ENTRA TRANSACTIONS");
        const { amount, concept, originAccount, destinationAccount, action } = req.body;

        connection.beginTransaction(async (err) => {
            if (err) {
                console.error('Error al iniciar la transacción:', err);
                return res.status(500).json({ message: 'Error al iniciar la transacción' });
            }

            const selectAccounts = 'SELECT * FROM accounts WHERE Id = ?';
            connection.query(selectAccounts, [originAccount], (err, accountResults) => {
                if (err) {
                    return connection.rollback(() => {
                        console.error('Error al consultar la base de datos:', err);
                        return res.status(500).json({ message: 'Error al consultar la base de datos' });
                    });
                }

                if (accountResults.length === 0) {
                    return connection.rollback(() => {
                        return res.status(404).json({ message: 'Cuenta no encontrada' });
                    });
                }

                let balance = parseFloat(accountResults[0].Balance);

                if (action === 'enter') {
                    balance += parseFloat(amount);
                    const updateAmount = 'UPDATE accounts SET Balance = ? WHERE Id = ?';
                    connection.query(updateAmount, [balance, originAccount], (err) => {
                        if (err) {
                            return connection.rollback(() => {
                                console.error('Error al actualizar el balance:', err);
                                return res.status(500).json({ message: 'Error al actualizar el balance' });
                            });
                        }

                        const insertTransaction = 'INSERT INTO transactions (TransactionType, TargetAccount, Amount, Concept) VALUES (?, ?, ?, ?)';
                        connection.query(insertTransaction, [action, originAccount, parseFloat(amount), concept], (err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    console.error('Error al insertar la transacción:', err);
                                    return res.status(500).json({ message: 'Error al insertar la transacción' });
                                });
                            }

                            connection.commit((err) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        console.error('Error al confirmar la transacción:', err);
                                        return res.status(500).json({ message: 'Error al confirmar la transacción' });
                                    });
                                }
                                return res.status(200).json({ message: 'Ingreso realizado con éxito' });
                            });
                        });
                    });
                } else if (action === 'withdraw') {
                    if (balance < parseFloat(amount)) {
                        return connection.rollback(() => {
                            return res.status(400).json({ message: 'Saldo insuficiente' });
                        });
                    }

                    balance -= parseFloat(amount);
                    const updateAmount = 'UPDATE accounts SET Balance = ? WHERE Id = ?';

                    connection.query(updateAmount, [balance, originAccount], (err) => {
                        if (err) {
                            return connection.rollback(() => {
                                console.error('Error al actualizar el balance:', err);
                                return res.status(500).json({ message: 'Error al actualizar el balance' });
                            });
                        }

                        const insertTransaction = 'INSERT INTO transactions (TransactionType, OriginAccount, Amount, Concept) VALUES (?, ?, ?, ?)';
                        connection.query(insertTransaction, [action, originAccount, parseFloat(amount), concept], (err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    console.error('Error al insertar la transacción:', err);
                                    return res.status(500).json({ message: 'Error al insertar la transacción' });
                                });
                            }

                            connection.commit((err) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        console.error('Error al confirmar la transacción:', err);
                                        return res.status(500).json({ message: 'Error al confirmar la transacción' });
                                    });
                                }
                                return res.status(200).json({ message: 'Retiro realizado con éxito' });
                            });
                        });
                    });
                } else if (action === 'transaction') {
                    const selectDestinationAccount = 'SELECT * FROM accounts WHERE AccountNumber = ?';
                    connection.query(selectDestinationAccount, [destinationAccount], (err, destinationAccountResults) => {
                        if (err) {
                            return connection.rollback(() => {
                                console.error('Error al consultar la cuenta de destino:', err);
                                return res.status(500).json({ message: 'Error al consultar la cuenta de destino' });
                            });
                        }

                        if (destinationAccountResults.length === 0 || originAccount === destinationAccountResults[0].Id) {
                            connection.rollback(() => {
                                return res.status(400).json({ message: 'Cuenta de destino no válida o es la misma que la de origen' });
                            });
                        } else {
                            let IdDestination = destinationAccountResults[0].Id;
                            let destinationBalance = parseFloat(destinationAccountResults[0].Balance);

                            if (balance < parseFloat(amount)) {
                                return connection.rollback(() => {
                                    return res.status(400).json({ message: 'Saldo insuficiente en la cuenta de origen' });
                                });
                            }
                            balance -= parseFloat(amount);
                            destinationBalance += parseFloat(amount);

                            const updateOriginAccount = 'UPDATE accounts SET Balance = ? WHERE Id = ?';
                            connection.query(updateOriginAccount, [balance, originAccount], (err) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        console.error('Error al actualizar el saldo de la cuenta de origen:', err);
                                        return res.status(500).json({ message: 'Error al actualizar el saldo de la cuenta de origen' });
                                    });
                                }

                                const updateDestinationAccount = 'UPDATE accounts SET Balance = ? WHERE Id = ?';
                                connection.query(updateDestinationAccount, [destinationBalance, IdDestination], (err) => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            console.error('Error al actualizar el saldo de la cuenta de destino:', err);
                                            return res.status(500).json({ message: 'Error al actualizar el saldo de la cuenta de destino' });
                                        });
                                    }

                                    const insertTransaction = 'INSERT INTO transactions (TransactionType, OriginAccount, TargetAccount, Amount, Concept) VALUES (?, ?, ?, ?, ?)';
                                    connection.query(insertTransaction, [action, originAccount, IdDestination, parseFloat(amount), concept], (err) => {
                                        if (err) {
                                            return connection.rollback(() => {
                                                console.error('Error al insertar la transacción:', err);
                                                return res.status(500).json({ message: 'Error al insertar la transacción' });
                                            });
                                        }

                                        connection.commit((err) => {
                                            if (err) {
                                                return connection.rollback(() => {
                                                    console.error('Error al confirmar la transacción:', err);
                                                    return res.status(500).json({ message: 'Error al confirmar la transacción' });
                                                });
                                            }
                                            return res.status(200).json({ message: 'Transacción realizada con éxito' });
                                        });
                                    });
                                });
                            });
                        }
                    });
                } else {
                    return connection.rollback(() => {
                        return res.status(400).json({ message: 'Acción no válida' });
                    });
                }
            });
        });
    },
};

module.exports = transactionsController;