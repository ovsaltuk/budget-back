const pool = require("../config/database");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

const userController = {
  createUser: async (req, res) => {
    const { email, password } = req.body;

    try {
      // 1. Проверяем уникальность email
      const existingUser = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email],
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          error: "Email уже зарегистрирован",
        });
      }

      // 2. Хешируем и вставляем
      const hashed_password = await bcrypt.hash(password, SALT_ROUNDS);
      const insertResult = await pool.query(
        `INSERT INTO users (email, hashed_password)
       VALUES($1, $2)
       RETURNING *`,
        [email, hashed_password],
      );

      const newUser = insertResult.rows[0];
      res.status(201).json({
        user: {
          id: newUser.id,
          email: newUser.email,
          created_at: newUser.created_at,
        },
      });
    } catch (err) {
      // 3. Обработка ошибки unique constraint (если SELECT пропустил из-за concurrency)
      if (err.code === "23505") {
        return res.status(409).json({
          error: "Email уже зарегистрирован",
        });
      }
      // Другие ошибки
      console.error("Ошибка создания пользователя:", err);
      res.status(500).json({ error: "Ошибка сервера" });
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
