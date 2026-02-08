const { body } = require("express-validator");

const createUserRequestValidation = [
  body("email")
    .notEmpty()
    .withMessage("Email обязателен для заполнения")
    .isEmail()
    .withMessage("Введите корректный email адрес")
    .normalizeEmail() // нормализует email (приводит к нижнему регистру, убирает пробелы)
    .isLength({ max: 320 })
    .withMessage("Email не должен превышать 320 символов"),
  
  body("password")
    .notEmpty()
    .withMessage("Пароль не может быть пустым")
    .isLength({ min: 8, max: 50 })
    .withMessage("Пароль должен содержать от 8 до 50 символов")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1, // минимум 1 строчная буква
      minUppercase: 1, // минимум 1 заглавная буква
      minNumbers: 1,   // минимум 1 цифра
      minSymbols: 0,   // символы не обязательны
    })
    .withMessage(
      "Пароль должен содержать минимум 8 символов, включая хотя бы одну заглавную букву, одну строчную букву и одну цифру"
    ),
];

module.exports = { createUserRequestValidation };