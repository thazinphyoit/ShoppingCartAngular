// db.js

const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'P@ssw0rd',
  database: 'node_backend_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export a function to execute queries
module.exports = {
  query: (sql, values) => {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          return reject(err);
        }
        connection.query(sql, values, (error, results) => {
          connection.release();
          if (error) {
            return reject(error);
          }
          resolve(results);
        });
      });
    });
  }
};
