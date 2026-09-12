import 'dotenv/config';
import express from 'express';
import clientUpload from './api/media/client-upload';
import drive from './api/media/drive';
import driveImage from './api/media/drive-image';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');
app.all('/api/media/client-upload', express.json({ limit: '64kb' }), (request, response) => { void clientUpload(request,response); });
app.get('/api/media/drive', (request, response) => { void drive(request,response); });
app.get('/api/media/drive-image', (request, response) => { void driveImage(request,response); });
app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));

app.use('/api', (_request, response) => response.status(404).json({ error: 'Endpoint introuvable.' }));

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
