const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.HOST,
  port: process.env.PORT,
  database: process.env.DB_NAME,
  user: process.env.USER,
  password: process.env.PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool
  .connect()
  .then(() => {
    console.log("✅ Подключение к базе данных успешно!");
  })
  .catch((err) => {
    console.error("❌ Ошибка подключения к базе данных:", err);
  });

module.exports = pool;;
