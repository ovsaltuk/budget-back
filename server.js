require("dotenv").config();

const app = require("./src/app");

const PORT = process.env.SERVER_PORT || 3000

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту http://localhost:${PORT}`);
});


