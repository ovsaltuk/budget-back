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

const createTransactionsBulkValidation = (req, res, next) => {
    try {
        const result = createTransactionsBulkSchema.parse(req.body);
        req.validatedData = result.transactions; 
        next();
    } catch (error) {
        res.status(400).json({
            error: 'Неверные данные транзакций',
            details: error.errors.map(e => ({
                field: e.path.join('.'), 
                message: e.message
            }))
        });
    }
};

const createTransactionsBulkSchema = z.object({
    transactions: z.array(createTransactionSchema)
        .min(1, 'Должен быть хотя бы 1 транзакция')
        .max(50, 'Максимум 50 транзакций за раз')
});

module.exports = { 
    createTransactionsBulkValidation,
    createTransactionValidation,
    createTransactionSchema,
    createTransactionsBulkSchema  
};