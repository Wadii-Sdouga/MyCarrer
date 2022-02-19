const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

// Connection Pool
let conn = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
});

conn.connect(function(err) {
    if (err) throw err;
    console.log('Database is connected successfully !');
  });
    
module.exports = conn;