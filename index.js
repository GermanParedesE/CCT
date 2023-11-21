const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');


const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configuración de la conexión a la base de datos
const connection = mysql.createPool({
    host     : process.env.MYSQL_HOST,
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DATABASE
});

  // CRUD ACCOUNT
  // INSERT ACCOUNT
app.post('/insertAccount', (req, res) => {
    const {
        useraccount,
        emailaccount,
        passaccount,
        type_user_id_user,
        agrupation_id_agrupation
    } = req.body;

    // Primero, verificar si ya existe una cuenta con el mismo email
    connection.query('SELECT emailaccount FROM account WHERE emailaccount = ?', [emailaccount], (error, results, fields) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al verificar el email' });
        }

        // Si ya existe una cuenta con ese email
        if (results.length > 0) {
            return res.status(409).json({ message: 'El email ya está en uso' });
        }

        // Si no existe, hashear la contraseña y crear la cuenta
        bcrypt.hash(passaccount, saltRounds, (err, hash) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error al hashear la contraseña' });
            }

            // Llamar al procedimiento almacenado con la contraseña hashada
            connection.query('CALL sp_insert_account(?, ?, ?, ?, ?)',
                [useraccount, emailaccount, hash, type_user_id_user, agrupation_id_agrupation],
                (error, results, fields) => {
                    if (error) {
                        console.error(error);
                        return res.status(500).json({ message: 'Error al ejecutar el procedimiento almacenado' });
                    }
                    // Enviar una respuesta exitosa al cliente
                    res.status(200).json({ message: 'Cuenta creada con éxito'});
                }
            );
        });
    });
});



  //READ ACCOUNT
app.get('/readAccount/:id', (req, res) => {
    const id_account = req.params.id;

    // Usar la conexión para llamar al procedimiento almacenado con el parámetro necesario
    connection.query('CALL sp_read_account(?)', [id_account], (error, results, fields) => {
        if (error) {
            console.error(error); // Log del error para depuración interna
            return res.status(500).json({ message: 'Error al ejecutar el procedimiento almacenado' }); // Respuesta de error
        }
        // Enviar los resultados de la consulta al cliente
        res.status(200).json(results[0]);
    });
});

//GET ACCOUNT
app.get('/getAccounts', (req, res) => {
    // Usar la conexión para llamar al procedimiento almacenado
    connection.query('CALL sp_get_account()', (error, results, fields) => {
        if (error) {
            console.error(error); // Log del error para depuración interna
            return res.status(500).json({ message: 'Error al ejecutar el procedimiento almacenado' }); // Respuesta de error
        }
        // Enviar los resultados de la consulta al cliente
        res.status(200).json(results[0]);
    });
});

//UPDATE ACCOUNT
app.put('/updateAccount/:id', (req, res) => {
    const id_account = req.params.id;
    const { useraccount, emailaccount, passaccount, type_user_id_user, agrupation_id_agrupation } = req.body;

    // Llamada al procedimiento almacenado
    connection.query('CALL sp_update_account(?, ?, ?, ?, ?, ?)', 
        [id_account, useraccount, emailaccount, passaccount, type_user_id_user, agrupation_id_agrupation],
        (error, results, fields) => {
            if (error) {
                console.error(error); // Log del error para depuración interna
                return res.status(500).json({ message: 'Error al actualizar la cuenta' }); // Respuesta de error
            }
            res.status(200).json({ message: 'Cuenta actualizada con éxito' });
        }
    );
});


//DELETE ACCOUNT
app.delete('/deleteAccount/:id', (req, res) => {
    const id_account = req.params.id;

    // Llamada al procedimiento almacenado
    connection.query('CALL sp_delete_account(?)', [id_account], (error, results, fields) => {
        if (error) {
            console.error(error); // Log del error para depuración interna
            return res.status(500).json({ message: 'Error al eliminar la cuenta' }); // Respuesta de error
        }
        res.status(200).json({ message: 'Cuenta eliminada con éxito' });
    });
});

  // CRUD TYPE_ACCOUNT
  //-----------------------------------
  //INSERT TYPE_ACCOUNT
app.post('/insertTypeUser', (req, res) => {
    const { typeuser } = req.body;

    // Llamada al procedimiento almacenado
    connection.query('CALL sp_insert_type_user(?)', [typeuser], (error, results, fields) => {
        if (error) {
            console.error(error); // Log del error para depuración interna
            return res.status(500).json({ message: 'Error al insertar el tipo de usuario' }); // Respuesta de error
        }
        res.status(200).json({ message: 'Tipo de usuario insertado con éxito' });
    });
});

  //READ TYPE_ACCOUNT
app.get('/readTypeUser/:id', (req, res) => {
    const id_user = req.params.id;

    // Llamada al procedimiento almacenado
    connection.query('CALL sp_read_type_user(?)', [id_user], (error, results, fields) => {
        if (error) {
            console.error(error); // Log del error para depuración interna
            return res.status(500).json({ message: 'Error al leer el tipo de usuario' }); // Respuesta de error
        }
        // Enviar los resultados de la consulta al cliente
        res.status(200).json(results[0]);
    });
});

  //GET TYPE_ACCOUNT
app.get('/getTypeUsers', (req, res) => {
    // Usar la conexión para llamar al procedimiento almacenado
    connection.query('CALL sp_get_type_user()', (error, results, fields) => {
        if (error) {
            console.error(error); // Log del error para depuración interna
            return res.status(500).json({ message: 'Error al obtener los tipos de usuario' }); // Respuesta de error
        }
        // Enviar los resultados de la consulta al cliente
        res.status(200).json(results[0]);
    });
});

  //UPDATE TYPE_ACCOUNT
app.put('/updateTypeUser/:id', (req, res) => {
    const id_user = req.params.id;
    const { typeuser } = req.body;

    // Llamada al procedimiento almacenado
    connection.query('CALL sp_update_type_user(?, ?)', 
        [id_user, typeuser],
        (error, results, fields) => {
            if (error) {
                console.error(error); // Log del error para depuración interna
                return res.status(500).json({ message: 'Error al actualizar el tipo de usuario' }); // Respuesta de error
            }
            res.status(200).json({ message: 'Tipo de usuario actualizado con éxito' });
        }
    );
});

  //DELETE TYPE_ACCOUNT
app.delete('/deleteTypeUser/:id', (req, res) => {
    const id_user = req.params.id;

    // Llamada al procedimiento almacenado
    connection.query('CALL sp_delete_type_user(?)', [id_user], (error, results, fields) => {
        if (error) {
            console.error(error); // Log del error para depuración interna
            return res.status(500).json({ message: 'Error al eliminar el tipo de usuario' }); // Respuesta de error
        }
        res.status(200).json({ message: 'Tipo de usuario eliminado con éxito' });
    });
});


  // CRUD REPRESENTATIVE
  //-----------------------------------
  //INSERT REPRESENTATIVE
app.post('/insertRepresentative', (req, res) => {
    const { namerep, emailrep } = req.body;

    // Llamada al procedimiento almacenado con parámetro OUT para el ID
    connection.query('CALL sp_insert_representative(?, ?, @newId)', [namerep, emailrep], (error, results, fields) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al insertar el representante' });
        }
        // Consulta para obtener el ID generado
        connection.query('SELECT @newId AS newId', (error, results, fields) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Error al obtener el ID del representante' });
            }
            res.status(200).json({ id: results[0].newId });
        });
    });
});


  //READ REPRESENTATIVE
app.get('/readRepresentative/:id', (req, res) => {
    const id_rep = req.params.id;

    // Llamada al procedimiento almacenado
    connection.query('CALL sp_read_representative(?)', [id_rep], (error, results, fields) => {
        if (error) {
            console.error(error); // Log del error para depuración interna
            return res.status(500).json({ message: 'Error al leer el representante' }); // Respuesta de error
        }
        // Enviar los resultados de la consulta al cliente
        res.status(200).json(results[0]);
    });
});

  //GET REPRESENTATIVE
app.get('/getRepresentatives', (req, res) => {
    // Usar la conexión para llamar al procedimiento almacenado
    connection.query('CALL sp_get_representative()', (error, results, fields) => {
        if (error) {
            console.error(error); // Log del error para depuración interna
            return res.status(500).json({ message: 'Error al obtener los representantes' }); // Respuesta de error
        }
        // Enviar los resultados de la consulta al cliente
        res.status(200).json(results[0]);
    });
});

  //UPDATE REPRESENTATIVE
app.put('/updateRepresentative/:id', (req, res) => {
    const id_rep = req.params.id;
    const { namerep, emailrep } = req.body;

    // Llamada al procedimiento almacenado
    connection.query('CALL sp_update_representative(?, ?, ?)', 
        [id_rep, namerep, emailrep],
        (error, results, fields) => {
            if (error) {
                console.error(error); // Log del error para depuración interna
                return res.status(500).json({ message: 'Error al actualizar el representante' }); // Respuesta de error
            }
            res.status(200).json({ message: 'Representante actualizado con éxito' });
        }
    );
});

  //DELETE REPRESENTATIVE
app.delete('/deleteRepresentative/:id', (req, res) => {
    const id_rep = req.params.id;

    // Llamada al procedimiento almacenado
    connection.query('CALL sp_delete_representative(?)', [id_rep], (error, results, fields) => {
        if (error) {
            console.error(error); // Log del error para depuración interna
            return res.status(500).json({ message: 'Error al eliminar el representante' }); // Respuesta de error
        }
        res.status(200).json({ message: 'Representante eliminado con éxito' });
    });
});

  // CRUD AGRUPATION
  //-----------------------------------
  //INSERT AGRUPATION
app.post('/insertAgrupation', (req, res) => {
    const { nameagrupation, emailagrupation, fundationdate, addressagrupation, phoneagrupation, typeagrupation, membersagrupation, webagrupation, descriptionagrupation, logoagrupation, commune_id_commune, representative_id_rep } = req.body;

    // Llamada al procedimiento almacenado
    connection.query('CALL sp_insert_agrupation(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
        [nameagrupation, emailagrupation, fundationdate, addressagrupation, phoneagrupation, typeagrupation, membersagrupation, webagrupation, descriptionagrupation, logoagrupation, commune_id_commune, representative_id_rep],
        (error, results, fields) => {
            if (error) {
                console.error(error); // Log del error para depuración interna
                return res.status(500).json({ message: 'Error al insertar la agrupación' }); // Respuesta de error
            }
            res.status(200).json({ message: 'Agrupación creada con éxito' });
        }
    );
});

  //READ AGRUPATION
app.get('/readAgrupation/:id', (req, res) => {
    const id_agrupation = req.params.id;

    // Llamada al procedimiento almacenado
    connection.query('CALL sp_read_agrupation(?)', [id_agrupation], (error, results, fields) => {
        if (error) {
            console.error(error); // Log del error para depuración interna
            return res.status(500).json({ message: 'Error al leer la agrupación' }); // Respuesta de error
        }
        // Enviar los resultados de la consulta al cliente
        res.status(200).json(results[0]);
    });
});

//LIST AGRUPATIONS
app.get('/listAgrupations', (req, res) => {
    // Usar la conexión para llamar al procedimiento almacenado
    connection.query('CALL sp_list_agrupations()', (error, results, fields) => {
        if (error) {
            console.error(error); // Log del error para depuración interna
            return res.status(500).json({ message: 'Error al listar las agrupaciones' }); // Respuesta de error
        }
        // Enviar los resultados de la consulta al cliente
        res.status(200).json(results[0]);
    });
});

  //GET AGRUPATION
app.get('/getAgrupations', (req, res) => {
    // Usar la conexión para llamar al procedimiento almacenado
    connection.query('CALL sp_get_agrupation()', (error, results, fields) => {
        if (error) {
            console.error(error); // Log del error para depuración interna
            return res.status(500).json({ message: 'Error al obtener las agrupaciones' }); // Respuesta de error
        }
        // Enviar los resultados de la consulta al cliente
        res.status(200).json(results[0]);
    });
});


  //UPDATE AGRUPATION
app.put('/updateAgrupation/:id', (req, res) => {
    const id_agrupation = req.params.id;
    const { nameagrupation, emailagrupation, fundationdate, addressagrupation, phoneagrupation, typeagrupation, membersagrupation, webagrupation, descriptionagrupation, logoagrupation, commune_id_commune, representative_id_rep } = req.body;

    // Llamada al procedimiento almacenado
    connection.query('CALL sp_update_agrupation(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
        [id_agrupation, nameagrupation, emailagrupation, fundationdate, addressagrupation, phoneagrupation, typeagrupation, membersagrupation, webagrupation, descriptionagrupation, logoagrupation, commune_id_commune, representative_id_rep],
        (error, results, fields) => {
            if (error) {
                console.error(error); // Log del error para depuración interna
                return res.status(500).json({ message: 'Error al actualizar la agrupación' }); // Respuesta de error
            }
            res.status(200).json({ message: 'Agrupación actualizada con éxito' });
        }
    );
});

  //DELETE AGRUPATION
app.delete('/deleteAgrupation/:id', (req, res) => {
    const id_agrupation = req.params.id;

    // Llamada al procedimiento almacenado
    connection.query('CALL sp_delete_agrupation(?)', [id_agrupation], (error, results, fields) => {
        if (error) {
            console.error(error); // Log del error para depuración interna
            return res.status(500).json({ message: 'Error al eliminar la agrupación' }); // Respuesta de error
        }
        res.status(200).json({ message: 'Agrupación eliminada con éxito' });
    });
});


//Validacion Login
app.post('/validateAccount', (req, res) => {
    const { emailaccount, passaccount } = req.body;

    // Primero, obtenemos el hash de la contraseña de la cuenta por email
    connection.query('SELECT id_account, useraccount, emailaccount, passaccount FROM account WHERE emailaccount = ?', [emailaccount], (error, accounts, fields) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al buscar la cuenta' });
        }

        // Si encontramos la cuenta
        if (accounts.length > 0) {
            const account = accounts[0];
            // Comparamos el hash de la contraseña
            bcrypt.compare(passaccount, account.passaccount, (err, isMatch) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Error al verificar la contraseña' });
                }

                // Si la contraseña coincide
                if (isMatch) {
                    // Puedes elegir qué información devolver aquí
                    res.status(200).json({ message: 'Validación exitosa', account: { id_account: account.id_account, useraccount: account.useraccount, emailaccount: account.emailaccount } });
                } else {
                    // Si la contraseña no coincide
                    res.status(401).json({ message: 'Contraseña incorrecta' });
                }
            });
        } else {
            // Si no encontramos la cuenta por email
            res.status(404).json({ message: 'Cuenta no encontrada' });
        }
    });
});

  //GET COMMUNE
app.get('/getAgrupations', (req, res) => {
    // Usar la conexión para llamar al procedimiento almacenado
    connection.query('CALL sp_get_agrupation()', (error, results, fields) => {
        if (error) {
            console.error(error); // Log del error para depuración interna
            return res.status(500).json({ message: 'Error al obtener las agrupaciones' }); // Respuesta de error
        }
        // Enviar los resultados de la consulta al cliente
        res.status(200).json(results[0]);
    });
});

//GET REGION






const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API escuchando en el puerto ${port}`);
});

// node indexe.js Para levantar la API

