const { Pool, types } = require("pg");
require("./env");

// Parse DATE type (OID 1082) as raw 'YYYY-MM-DD' string to avoid timezone corruption
types.setTypeParser(1082, (val) => val);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

module.exports = pool;