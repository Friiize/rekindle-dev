const mysql = require("mysql2");

const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    database: 'rekindle_dev',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();
