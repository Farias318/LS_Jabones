import { eq } from 'drizzle-orm';
import { Router } from 'express';
import { db } from '../db/index.js';
import { products } from '../db/schema.js';

export const productsRouter = Router();

productsRouter.get('/', async (_req, res, next) => {
  try {
    const rows = await db.select().from(products).where(eq(products.active, true));
    res.json(
      rows.map((p) => ({
        id: p.id,
        name: p.name,
        perfume: p.perfume,
        description: p.description ?? '',
        attributes: p.attributes ?? [],
        price: Number(p.price),
        imageUrl: p.imageUrl ?? undefined,
        active: p.active,
      })),
    );
  } catch (err) {
    next(err);
  }
});
