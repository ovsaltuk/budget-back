const jwt = require('jsonwebtoken');
const pool = require("../config/database");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = {
  bcrypt,
  SALT_ROUNDS,
  jwt,
  JWT_SECRET
};