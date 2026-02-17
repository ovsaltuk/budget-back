const express = require("express");
const cors = require("cors");

const app = express();

const userRoutes = require("./routes/userRoutes");

//middlewear
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Подключаем маршруты
app.use("/api/users", userRoutes);

// Корневой маршрут
app.get("/", (req, res) => {
  res.json({
    message: "API для бюджета работает!",
    endpoints: {
      users: "/api/users",
    },
  });
});

// Обработка 404 ошибок
app.use((req, res) => {
  res.status(404).json({
    error: "Маршрут не найден",
  });
});

module.exports = app;
