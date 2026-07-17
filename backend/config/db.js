const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1906",
  database: "mymparfums",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(connection => {
    console.log("Base de datos conectada");
    connection.release();
  })
  .catch(err => {
    console.error("Error al conectar:", err);
  });

module.exports = { pool };