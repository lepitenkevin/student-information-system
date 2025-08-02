const mysql = require('mysql');
const util = require('util');

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "students"
});

db.query = util.promisify(db.query); // allows async/await

module.exports = db;
