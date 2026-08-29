import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');
app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const dist = path.join(process.cwd(), 'dist');
    app.use(express.static(dist, { maxAge: '1h' }));
    app.get('*', (_request, response) => response.sendFile(path.join(dist, 'index.html')));
  }

  app.listen(port, '0.0.0.0', () => console.log(`La Maloka listening on port ${port}`));
}

start();
