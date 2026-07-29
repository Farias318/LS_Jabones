import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { combosRouter } from './routes/combos.routes.js';
import { ordersRouter } from './routes/orders.routes.js';
import { productsRouter } from './routes/products.routes.js';

export function createApp() {
  const app = express();

  // Dev: CORS_ORIGIN sin definir → asume el puerto default de Vite. En producción
  // (Fase 8 del roadmap) se fija al origen real de GitHub Pages.
  const corsOrigin = process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173'];
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/products', productsRouter);
  app.use('/api/combos', combosRouter);
  app.use('/api/orders', ordersRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: 'No encontrado' });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  });

  return app;
}
