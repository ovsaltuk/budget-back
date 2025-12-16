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
];

module.exports = { createUserRequestValidation };
