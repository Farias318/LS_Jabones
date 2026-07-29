import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.middleware.js';
import { loginSchema } from '../schemas/auth.schema.js';
import { InvalidCredentialsError, login } from '../services/auth.service.js';

export const authRouter = Router();

authRouter.post('/login', async (req, res, next) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() });
    return;
  }

  try {
    const result = await login(parsed.data);
    res.json(result);
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      res.status(401).json({ error: err.message });
      return;
    }
    next(err);
  }
});

// Smoke test de la Fase 4: confirma que un token emitido por /login efectivamente autentica.
authRouter.get('/me', requireAdmin, (req, res) => {
  res.json({ user: req.user });
});
