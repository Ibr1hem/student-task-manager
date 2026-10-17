import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import breakdownHandler from './api/breakdown';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware for parsing JSON payloads
  app.use(express.json({ limit: '1mb' }));

  // Mount the serverless breakdown handler at /api/breakdown
  app.all('/api/breakdown', async (req, res) => {
    try {
      await breakdownHandler(req, res);
    } catch (err) {
      console.error('Unhandled error in /api/breakdown route:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error.' });
      }
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasOpenRouterKey: Boolean(process.env.OPENROUTER_API_KEY),
    });
  });

  // Development: Vite middleware mode
  // Production: Serve static assets from dist
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
