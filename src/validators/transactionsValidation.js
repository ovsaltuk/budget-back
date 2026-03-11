const { z } = require("zod");

// ✅ Схема валидации транзакции
const createTransactionSchema = z.object({
  category: z
    .string()
    .min(1, "Категория обязательна")
    .max(100, "Категория слишком длинная"),

  subcategory: z
    .string()
    .max(100, "Подкатегория слишком длинная")
    .optional()
    .default(""),

  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Дата в формате YYYY-MM-DD"),

  amount: z
    .string()
    .transform(Number)
    .refine((val) => val > 0, "Сумма должна быть больше 0"),
  type: z.enum(["income", "outcome"], "Тип: income или outcome"),
});

const createTransactionValidation = (req, res, next) => {
  try {
    // ✅ Защита от undefined/null
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        error: "Нет данных в запросе",
        details: ["req.body отсутствует или не объект"],
      });
    }

    console.log("📥 req.body:", req.body); // ← ДБАГ

    const result = createTransactionSchema.parse(req.body);
    req.validatedData = result;
    next();
  } catch (error) {
    console.log("❌ Validation error:", error.errors); // ← ДБАГ
    res.status(400).json({
      error: "Неверные данные",
      details: error.errors?.map((e) => ({
        field: e.path[0],
        message: e.message,
      })) || ["Неизвестная ошибка валидации"],
    });
  }
};

const createTransactionsBulkValidation = (req, res, next) => {
  try {
    const result = createTransactionsBulkSchema.parse(req.body);
    req.validatedData = result.transactions;
    next();
  } catch (error) {
    res.status(400).json({
      error: "Неверные данные транзакций",
      details: error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }
};

const createTransactionsBulkSchema = z.object({
  transactions: z
    .array(createTransactionSchema)
    .min(1, "Должен быть хотя бы 1 транзакция")
    .max(50, "Максимум 50 транзакций за раз"),
});

module.exports = {
  createTransactionsBulkValidation,
  createTransactionValidation,
  createTransactionSchema,
  createTransactionsBulkSchema,
};
