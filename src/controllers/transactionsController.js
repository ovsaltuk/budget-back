const { types } = require("pg");
const pool = require("../config/database");
const multer = require("multer");
const XLSX = require("xlsx");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

function excelSerialToDate(serial) {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date = new Date(utc_value * 1000);
  return date.toISOString().split("T")[0];
}

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
      return res
        .status(400)
        .json({ error: "transactions должен быть непустым массивом" });
    }

    try {
      const values = transactions.map((t) => [
        req.user.userId,
        t.category,
        t.subcategory,
        t.date,
        t.comment,
        t.amount,
      ]);

      const insertResult = await pool.query(
        `INSERT INTO transactions (user_id, category, subcategory, date, comment, amount)
           VALUES ${transactions.map((_, i) => `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`).join(", ")}
           RETURNING *`,
        values.flat(),
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
    const { category, subcategory, date, comment, amount, type } = req.body;

    try {
      const insertResult = await pool.query(
        `INSERT INTO transactions (user_id, category, subcategory, date, amount, type)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING *`,
        [req.user.userId, category, subcategory, date, amount, type],
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

  deleteTransaction: async (req, res) => {
    const { id } = req.params; // ID из URL: /transactions/:id
    const userId = req.user.userId;

    // Валидация ID
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: "ID должен быть числом" });
    }

    try {
      const deleteResult = await pool.query(
        `DELETE FROM transactions 
         WHERE id = $1 AND user_id = $2 
         RETURNING id, category, amount`,
        [parseInt(id), userId],
      );

      if (deleteResult.rowCount === 0) {
        return res
          .status(404)
          .json({ error: "Транзакция не найдена или не принадлежит вам" });
      }

      res.json({
        message: "Транзакция удалена",
        deleted: deleteResult.rows[0], // Возвращаем удаленную запись
      });
    } catch (error) {
      console.error("Ошибка удаления транзакции:", error);
      res.status(500).json({ error: error.message });
    }
  },
  uploadExcelTransactions: async (req, res) => {
    console.log("📤 Upload Excel:", req.file.originalname);

    if (!req.file) {
      return res.status(400).json({ error: "Файл Excel обязателен" });
    }

    try {
      // ✅ Читаем Excel из памяти
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(worksheet);

      console.log("📊 Excel строк:", excelData.length);
      console.log("📋 Первая строка:", excelData[0]);

      if (excelData.length === 0) {
        return res.status(400).json({ error: "Excel пустой" });
      }

      // ✅ Преобразуем в транзакции (точно как createTransactions)
      const transactions = excelData.map((row, index) => {
        const category = String(row.category || "").trim();
        const subcategory = String(row.subcategory || "").trim();
        let date = String(row.date || "").trim();
        const amount = parseFloat(row.amount);
        const comment = String(row.comment || "").trim();

        // ✅ Фикс Excel серийной даты (46092 → 2026-03-11)
        if (!isNaN(parseFloat(date)) && parseFloat(date) > 40000) {
          date = excelSerialToDate(parseFloat(date));
          console.log(`🔄 Excel дата ${row.date} → ${date}`);
        }

        console.log(`📝 Строка ${index + 1}:`, { category, date, amount });

        if (!category || isNaN(amount) || amount <= 0 || !date) {
          console.warn(`⚠️ Пропускаем строку ${index + 1}:`, row);
          return null;
        }

        return [req.user.userId, category, subcategory, date, comment, amount];
      });

      if (transactions.length === 0) {
        return res
          .status(400)
          .json({ error: "Нет валидных транзакций в Excel" });
      }

      // ✅ Bulk INSERT (ваш стиль!)
      const insertResult = await pool.query(
        `INSERT INTO transactions (user_id, category, subcategory, date, comment, amount)
       VALUES ${transactions.map((_, i) => `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`).join(", ")}
       RETURNING id, category, amount, date`,
        transactions.flat(),
      );

      console.log("✅ Импортировано:", insertResult.rowCount);

      res.status(201).json({
        message: `✅ Импортировано транзакций: ${insertResult.rowCount} из ${excelData.length}`,
        imported: insertResult.rowCount,
        skipped: excelData.length - insertResult.rowCount,
      });
    } catch (error) {
      console.error("❌ Excel парсинг:", error);
      res.status(400).json({ error: error.message });
    }
  },
};

module.exports = { transactionsController, upload };
