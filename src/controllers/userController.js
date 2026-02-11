const jwt = require('jsonwebtoken');

const pool = require("../config/database");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

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
    pool.query("SELECT id, email FROM users", (err, result) => {
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
  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      // 1. Ищем пользователя по email
      const result = await pool.query(
        "SELECT id, email, hashed_password FROM users WHERE email = $1",
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Неверный email или пароль" });
      }

      const user = result.rows[0];

      // 2. Проверяем пароль
      const isValidPassword = await bcrypt.compare(password, user.hashed_password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Неверный email или пароль" });
      }

      // 3. Генерируем JWT-токен
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      });
    } catch (err) {
      console.error("Ошибка логина:", err);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  },
};

module.exports = userController;
