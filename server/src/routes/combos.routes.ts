import { eq, inArray } from 'drizzle-orm';
import { Router } from 'express';
import { db } from '../db/index.js';
import { comboItems, combos } from '../db/schema.js';

export const combosRouter = Router();

combosRouter.get('/', async (_req, res, next) => {
  try {
    const comboRows = await db.select().from(combos).where(eq(combos.active, true));
    const comboIds = comboRows.map((c) => c.id);
    const itemRows = comboIds.length
      ? await db.select().from(comboItems).where(inArray(comboItems.comboId, comboIds))
      : [];

    const productIdsByCombo = new Map<string, string[]>();
    for (const item of itemRows) {
      const list = productIdsByCombo.get(item.comboId) ?? [];
      list.push(item.productId);
      productIdsByCombo.set(item.comboId, list);
    }

    res.json(
      comboRows.map((c) => ({
        id: c.id,
        name: c.name,
        comboPrice: Number(c.comboPrice),
        description: c.description ?? '',
        productIds: productIdsByCombo.get(c.id) ?? [],
        active: c.active,
      })),
    );
  } catch (err) {
    next(err);
  }
});
