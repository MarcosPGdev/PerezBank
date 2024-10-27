const { hashPasswordMD5, generateAccountNumber } = require('../utils/accountUtils');
const connection = require('../config/db');
const jwt = require('jsonwebtoken');
const secretKey = 'perez_bank';

console.log("ENTRA users");

const registerUser = (req, res) => {
    const { username, password, name, surname, direction, province, cp, dni } = req.body;
    const hashedPassword = hashPasswordMD5(password);
    
    connection.beginTransaction((err) => {
        if (err) {
            console.error('Error al iniciar la transacción:', err);
            return res.status(500).send('Ha ocurrido un error inesperado');
        }

        // Comprobar si el nombre de usuario o DNI ya existen
        const checkUserOrDNI = 'SELECT * FROM usuarios WHERE Username = ? OR DNI = ?';
        connection.query(checkUserOrDNI, [username, dni], (err, results) => {
            if (err) {
                console.error('Error al consultar la base de datos:', err);
                return connection.rollback(() => {
                    res.status(500).send('Ha ocurrido un error inesperado');
                });
            }

            if (results.length > 0) {
                const existingUser = results[0];
                if (existingUser.Username === username) {
                    return connection.rollback(() => res.status(400).send('El nombre de usuario ya está en uso'));
                }
                if (existingUser.DNI === dni) {
                    return connection.rollback(() => res.status(400).send('El DNI ya está en uso'));
                }
            }

            generateAccountNumber(connection)
                .then((accountNumber) => {
                    console.log(accountNumber);
                    const insertUserQuery = 'INSERT INTO usuarios (Username, Password, Name, Surname, Direction, Province, CP, DNI) VALUES (?, ?, ?, ?, ?, ?, ?, ?);';
                    connection.query(insertUserQuery, [username, hashedPassword, name, surname, direction, province, cp, dni], (err, userResults) => {
                        if (err) {
                            console.error('Error al insertar el usuario:', err);
                            return connection.rollback(() => res.status(500).send('Error al insertar el usuario'));
                        }

                        const userId = userResults.insertId;

                        const insertAccountQuery = 'INSERT INTO accounts (AccountNumber, UserId) VALUES (?, ?)';
                        connection.query(insertAccountQuery, [accountNumber, userId], (err) => {
                            if (err) {
                                console.error('Error al insertar la cuenta:', err);
                                return connection.rollback(() => res.status(500).send('Error al crear la cuenta'));
                            }

                            connection.commit((err) => {
                                if (err) {
                                    console.error('Error al realizar el commit:', err);
                                    return connection.rollback(() => res.status(500).send('Error al registrar el usuario y la cuenta'));
                                }

                                res.status(201).send('Usuario y cuenta creados con éxito');
                            });
                        });
                    });
                })
                .catch((error) => {
                    console.error('Error al generar el número de cuenta:', error);
                    connection.rollback(() => res.status(500).send('Error al generar el número de cuenta'));
                });
        });
    });
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = hashPasswordMD5(password);

    try {
        const [userResults] = await connection.promise().query(
            'SELECT * FROM usuarios WHERE Username = ? AND Password = ?',
            [username, hashedPassword]
        );

        if (userResults.length > 0) {
            const user = userResults[0];
            if (user.IsBlocked == 1) {
                return res.status(401).json({ message: 'Esta cuenta ha sido bloqueada durante 1h' });
            }
            const token = jwt.sign({ userId: user.Id, username: user.Username }, secretKey, { expiresIn: '1h' });
            return res.status(200).json({ message: 'Autenticación exitosa', token });
        } else {
            res.status(401).json({ message: 'Credenciales incorrectas' });
        }
    } catch (error) {
        console.error('Error al consultar la base de datos:', error);
        res.status(500).json({ message: 'Error al consultar la base de datos' });
    }
};

module.exports = { registerUser, loginUser };