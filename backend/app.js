const express = require('express');
const { execFile } = require('child_process');
const app = express();
const port = 3001;

app.get('/prever', (req, res) => {
  const days = req.query.days || '7';

  execFile('python3', ['predict.py', days], (error, stdout, stderr) => {
    if (error) {
      console.error('Erro:', error);
      console.error(stderr);
      return res.status(500).json({ error: 'Erro ao gerar previsão' });
    }

    try {
      const json = JSON.parse(stdout);
      res.setHeader('Content-Type', 'application/json');
      res.json(json);
    } catch (e) {
      console.error('Erro ao processar saída do Python:', e);
      res.status(500).json({ error: 'Erro ao interpretar previsão' });
    }
  });
});

app.listen(port, () => {
  console.log(`API ouvindo em http://localhost:${port}`);
});