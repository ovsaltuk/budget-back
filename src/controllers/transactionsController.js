const pool = require("../config/database");

const transactionsController = {
  getAllTransactions: async (req, res) => {
    const { userId } = req.user;

    try {
      const insertResult = await pool.query(
        `SELECT * FROM transactions
            WHERE user_id = $1
            ORDER BY created_at DESC`,
        [userId],
      );

      res.json(insertResult.rows);
    } catch (error) {
      console.error("Ошибка получения транзакций:", error);
      res.status(500).json({ error: error.message });
    }
  },
  createTransactions: async (req, res) => {
  const { transactions } = req.body;
  
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return res.status(400).json({ error: "transactions должен быть непустым массивом" });
  }

  try {
    const values = transactions.map(t => [
      req.user.userId, 
      t.category, 
      t.subcategory, 
      t.date, 
      t.comment, 
      t.amount
    ]);

    const insertResult = await pool.query(
      `INSERT INTO transactions (user_id, category, subcategory, date, comment, amount)
       VALUES ${transactions.map((_, i) => `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`).join(', ')}
       RETURNING *`,
      values.flat()
    );

    res.status(201).json({
      message: `Создано транзакций: ${insertResult.rowCount}`,
      transactions: insertResult.rows,
    });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(400).json({ error: "Пользователь не найден" });
    }
    if (error.code === "23505") {
      return res.status(400).json({ error: "Транзакция уже существует" });
    }
    console.log("Ошибка: ", error);
    res.status(500).json({ error: error.message });
  }
},

  createTransaction: async (req, res) => {
    const { category, subcategory, date, comment, amount } = req.body;

    try {
      const insertResult = await pool.query(
        `INSERT INTO transactions (user_id, category, subcategory, date, comment, amount)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
        [req.user.userId, category, subcategory, date, comment, amount],
      );

      res.status(201).json({
        message: "Транзакция создана",
        transactions: insertResult.rows[0],
      });
    } catch (error) {
      if (error.code === "23503") {
        return res.status(400).json({ error: "Пользователь не найден" });
      }
      if (error.code === "23505") {
        return res.status(400).json({ error: "Транзакция уже существует" });
      }
      console.log("Ошибка: ", error);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = transactionsController;
