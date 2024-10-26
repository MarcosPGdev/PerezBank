const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const secretKey = 'perezbank';

const app = express();
const PORT = 5000;

const cors = require('cors');
app.use(cors());
app.use(express.json());

// Conexión a la base de datos MySQL utilizando 'mysql2' o 'mysql'
const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bank_deharohub'
});


function hashPasswordMD5(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

function generateAccountNumber() {
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

app.post('/register', async (req, res) => {
    const { username, password, name, surname, direction, province, cp, dni } = req.body;
    const hashedPassword = hashPasswordMD5(password);
    console.log(hashedPassword);
    connection.beginTransaction(async (err) => {
        if (err) {
            console.error('Error al iniciar la transacción:', err);
            return res.status(500).send('Ha ocurrido un error inesperado');
        }
        const checkUserOrDNI = 'SELECT * FROM usuarios WHERE Username = ? OR DNI = ?';
        connection.query(checkUserOrDNI, [username, dni], async (err, results) => {
            if (err) {
                console.error('Error al consultar la base de datos:', err);
                return connection.rollback(() => {
                    res.status(500).send('Ha ocurrido un error inesperado');
                });
            }

            if (results.length > 0) {
                const existingUser = results[0];
                if (existingUser.Username === username) {
                    return connection.rollback(() => {
                        res.status(400).send('El nombre de usuario ya está en uso');
                    });
                }
                if (existingUser.DNI === dni) {
                    return connection.rollback(() => {
                        res.status(400).send('El DNI ya está en uso');
                    });
                }
            }

            let accountNumber;
            try {
                accountNumber = await generateAccountNumber();
            } catch (error) {
                console.error('Error al generar el número de cuenta:', error);
                return connection.rollback(() => {
                    res.status(500).send('Error al generar el número de cuenta');
                });
            }

            const insertUserQuery = 'INSERT INTO usuarios (Username, Password, Name, Surname, Direction, Province, CP, DNI) VALUES (?, ?, ?, ?, ?, ?, ?, ?);';
            connection.query(insertUserQuery, [username, hashedPassword, name, surname, direction, province, cp, dni], (err, userResults) => {
                if (err) {
                    console.error('Error al insertar el usuario:', err);
                    return connection.rollback(() => {
                        res.status(500).send('Error al insertar el usuario');
                    });
                }

                const userId = userResults.insertId;

                const insertAccountQuery = 'INSERT INTO accounts (AccountNumber, UserId) VALUES (?, ?)';
                connection.query(insertAccountQuery, [accountNumber, userId], (err, accountResults) => {
                    if (err) {
                        console.error('Error al insertar la cuenta:', err);
                        return connection.rollback(() => {
                            res.status(500).send('Error al crear la cuenta');
                        });
                    }

                    connection.commit((err) => {
                        if (err) {
                            console.error('Error al realizar el commit:', err);
                            return connection.rollback(() => {
                                res.status(500).send('Error al registrar el usuario y la cuenta');
                            });
                        }

                        res.status(201).send('Usuario y cuenta creados con éxito');
                    });
                });
            });
        });
    });
});


app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = hashPasswordMD5(password);
    const checkUser = 'SELECT * FROM usuarios WHERE Username = ? AND Password = ?';
  
    connection.query(checkUser, [username, hashedPassword], (err, userResults) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err);
            return res.status(500).json({ message: 'Error al consultar la base de datos' });
        }
        if (userResults.length > 0) {
            if(userResults[0].IsBlocked == 1){
                return res.status(401).json({ message: 'Esta cuenta ha sido bloqueada durante 1h' });
            }
            const user = userResults[0];
            const token = jwt.sign({ userId: user.Id, username: user.Username }, secretKey, { expiresIn: '1h' });
            return res.status(200).json({ message: 'Autenticación exitosa', token });
        } else {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }
    });
});

app.post('/blockAccount', async (req, res) => {
    const { username} = req.body;
    const blockAcc = 'UPDATE usuarios SET IsBlocked = 1, last_failed_attempt = CURRENT_TIMESTAMP WHERE Username = ?';
    console.log(blockAcc);
    connection.query(blockAcc, [username], (err, userResults) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err);
            return res.status(500).json({ message: 'Error al consultar la base de datos' });
        } 
        return res.status(200).json({ message: 'Su cuenta ha sido suspendida temporalmente'});
    });
});


app.post('/createAccount', async (req, res) => {
    const { UserId } = req.body;
    console.log(req.body);
    let accountNumber = await generateAccountNumber();
    const insertAccountQuery = 'INSERT INTO accounts (AccountNumber, UserId) VALUES (?, ?)';
    connection.query(insertAccountQuery, [accountNumber, UserId], (err, accountResults) => {
        if (err) {
            console.error('Error al insertar la cuenta:', err);
            return res.status(401).json({ message: 'No se ha podido crear la cuenta' });
        }else {
            return res.status(200).json({ message: 'La cuenta se ha creado con éxito' });
        } 
    });
})


app.get('/get_accounts', async (req, res) => {
    const decoded = jwt.verify(req.query.token, secretKey); // Decodificar el token
    const userId = decoded.userId;
    try {
        const selectAccounts = 'SELECT accounts.*, usuarios.Name, usuarios.Surname FROM accounts '+
                               'INNER JOIN usuarios ON usuarios.Id = accounts.UserId '+
                               'WHERE accounts.UserId = ?';
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
                    const getTransactions = 'SELECT t.*, o.AccountNumber AS OriginAccountNumber, DATE_FORMAT(t.Date, "%Y-%m-%d") AS Date, ta.AccountNumber AS TargetAccountNumber '+
                                            'FROM transactions t '+
                                            'LEFT JOIN accounts o ON t.OriginAccount = o.Id '+
                                            'LEFT JOIN accounts ta ON t.TargetAccount = ta.Id '+
                                            'WHERE OriginAccount = ? OR TargetAccount = ? '+
                                            'ORDER BY Date ASC;';
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
});



app.post('/transactions', async (req, res) => {
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

                    if (destinationAccountResults.length === 0 || originAccount === IdDestination) {
                        console.log("entraa");
                        connection.rollback(() => {
                            return res.status(400).json({ message: 'Cuenta de destino no válida o es la misma que la de origen' });
                        });
                    }else{
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
});




app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log("SIUUUUU");
});
