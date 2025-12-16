const pool = require("../config/database");

const userController = {
  createUser: async (req, res) => {
    const { name, username } = req.body;

    

    try {
      const insertResult = await pool.query(
        `INSERT INTO users (name, username)
         VALUES($1, $2)
         RETURNING *`,
        [ name, username]
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
