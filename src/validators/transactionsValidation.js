const { z } = require('zod');

// ✅ Схема валидации транзакции
const createTransactionSchema = z.object({
    category: z.string()
        .min(1, 'Категория обязательна')
        .max(100, 'Категория слишком длинная'),
    
    subcategory: z.string()
        .max(100, 'Подкатегория слишком длинная')
        .optional()
        .default(''),
    
    date: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата в формате YYYY-MM-DD'),
    
    amount: z.string()
        .transform(Number)
        .refine(val => val > 0, 'Сумма должна быть больше 0')
});

// ✅ Экспорт middleware-обёртки (как у users)
const createTransactionValidation = (req, res, next) => {
    try {
        const result = createTransactionSchema.parse(req.body);
        req.validatedData = result;  // ✅ Типизированные данные для контроллера
        next();
    } catch (error) {
        res.status(400).json({
            error: 'Неверные данные',
            details: error.errors.map(e => ({
                field: e.path[0],
                message: e.message
            }))
        });
    }
};

module.exports = { 
    createTransactionValidation,
    createTransactionSchema  // Для TypeScript позже
};