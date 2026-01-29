const pool = require("../config/database");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

const userController = {
  createUser: async (req, res) => {
    const { name, username, password } = req.body;

    try {
      const hashed_password = await bcrypt.hash(password, SALT_ROUNDS);
      const insertResult = await pool.query(
        `INSERT INTO users (name, username, hashed_password)
         VALUES($1, $2, $3)
         RETURNING *`,
        [name, username, hashed_password]
      );

      res.status(201).json({ user: insertResult.rows[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  getAllUsers: (req, res) => {
    pool.query("SELECT * FROM users", (err, result) => {
      if (err) {
        // Если есть ошибка, отправляем сообщение об ошибке
        console.error("Ошибка при запросе к БД:", err);
        res.status(500).json({
          error: "Ошибка при получении данных из базы данных",
        });
      } else {
        // Если успешно, отправляем данные в формате JSON
        console.log("✅ Данные успешно получены из БД");
        res.json({
          success: true,
          count: result.rows.length,
          users: result.rows,
        });
      }
    });
  },
};

module.exports = userController;
