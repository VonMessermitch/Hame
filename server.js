import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'Sombras_sobre_el_Nilo_1909_V.GAI.1.0.html'));
});

app.use(express.static(__dirname, {
  extensions: ['html'],
}));

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
