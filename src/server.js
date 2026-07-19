const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); // Permite que tu app Ionic hable con este servidor

// Configura la conexión a tu base de datos 'santrix'
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Santrix2026
  password: 'Santrix2026', // Santrix2026
  database: 'santrix'
});

// Esta es la ruta que tu app llama para obtener los servicios
app.get('/servicios', (req, res) => {
  db.query('SELECT * FROM Servicios', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.listen(3000, () => console.log('Servidor de Lavandería corriendo en el puerto 3000'));