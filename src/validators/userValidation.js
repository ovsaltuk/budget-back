const { body } = require("express-validator");

const createUserRequestValidation = [
  body("name")
    .notEmpty()
    .withMessage("Имя обязательно для заполнения")
    .isString()
    .withMessage("Имя должно быть строкой")
    .isLength({ min: 3, max: 100 })
    .withMessage("Имя должно сожержать от 3 до 100 символов"),
  body("username")
    .notEmpty()
    .withMessage("Имя пользователя обязательно для заполнения")
    .isString()
    .withMessage("Имя пользователя должно быть строкой")
    .isLength({ min: 3, max: 50 })
    .withMessage("Имя пользователя должно сожержать от 3 до 50 символов")
    .trim(),
  body("password")
    .notEmpty()
    .withMessage("Пароль не может быть пустым")
    .isLength({ min: 8, max: 50 })
    .withMessage("Пароль должен содержать от 8 до 50 символов")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 0,
      minUppercase: 1,
      minNumbers: 0,
      minSymbols: 0,
    })
    .withMessage(
      "Пароль должен содержать минимум одну заглавную букву, длинна от 8 до 50 символов"
    ),
];

module.exports = { createUserRequestValidation };
