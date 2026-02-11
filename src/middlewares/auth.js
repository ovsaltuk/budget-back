const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_fallback';

const auth = (req, res, next) => {
  // 1. Извлекаем токен из заголовка Authorization
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Доступ запрещен. Нет токена' 
    });
  }

  try {
    // 2. Проверяем токен
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 3. Добавляем данные пользователя в req
    req.user = decoded; // { userId: 1, email: "test@example.com" }
    next(); // Продолжаем выполнение роута
  } catch (err) {
    res.status(401).json({ 
      error: 'Неверный или истекший токен' 
    });
  }
};

module.exports = auth;