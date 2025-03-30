const express = require("express");
const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/api/crypto/:symbol", (req, res) => {
  const { symbol } = req.params;
  const filename = `${symbol}_USD_2020_2025_Daily.csv`;
  const filepath = path.join(__dirname, "datasets", "raw", filename);

  try {
    const csv = fs.readFileSync(filepath, "utf8");
    Papa.parse(csv, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const data = results.data.slice(-90); // últimos 90 dias
        res.json(data);
      },
      error: (err) => {
        console.error("Erro ao ler CSV:", err);
        res.status(500).json({ error: "Erro ao ler CSV" });
      },
    });
  } catch (err) {
    res.status(404).json({ error: "Arquivo não encontrado" });
  }
});

app.listen(PORT, () => {
  console.log(`API Node.js ativa em http://localhost:${PORT}`);
});
