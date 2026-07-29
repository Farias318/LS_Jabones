import { sql } from 'drizzle-orm';
import { db } from './index.js';
import { combos, comboItems, products } from './schema.js';

/*
  Fase 2 del roadmap (ROADMAP-BACKEND-ADMIN.md): migró el catálogo que antes
  vivía hardcodeado en el frontend (client/src/data/*.mock.ts, ya borrados
  tras la Fase 6) a filas reales. Es un script idempotente (trunca y vuelve a
  insertar) pensado para desarrollo, no para correr contra producción con
  pedidos reales ya cargados.
*/

const productsMock = [
  {
    slug: 'prod-lavanda',
    name: 'Jabón de lavanda',
    perfume: 'Lavanda',
    description: 'Aroma relajante, ideal para antes de dormir. Con avena molida para exfoliar suave.',
    attributes: ['relajante', 'piel sensible', 'vegano'],
    price: 3200,
  },
  {
    slug: 'prod-avena-miel',
    name: 'Jabón de avena y miel',
    perfume: 'Avena y miel',
    description: 'Hidratante y suave, pensado para pieles secas. Miel pura de productores locales.',
    attributes: ['hidratante', 'piel seca'],
    price: 3400,
  },
  {
    slug: 'prod-citrico',
    name: 'Jabón cítrico energizante',
    perfume: 'Naranja y pomelo',
    description: 'Aroma fresco y despertador, con ralladura natural de cítricos.',
    attributes: ['energizante', 'vegano'],
    price: 3200,
  },
  {
    slug: 'prod-carbon',
    name: 'Jabón de carbón activado',
    perfume: 'Tea tree',
    description: 'Purificante, recomendado para piel grasa o con tendencia acneica.',
    attributes: ['purificante', 'piel grasa'],
    price: 3600,
  },
  {
    slug: 'prod-rosa-mosqueta',
    name: 'Jabón de rosa mosqueta',
    perfume: 'Rosa mosqueta',
    description: 'Regenerador, con aceite de rosa mosqueta prensado en frío.',
    attributes: ['regenerador', 'piel sensible'],
    price: 3800,
  },
  {
    slug: 'prod-coco',
    name: 'Jabón de coco',
    perfume: 'Coco',
    description: 'Espuma cremosa y aroma tropical suave. Apto para todo tipo de piel.',
    attributes: ['hidratante', 'vegano'],
    price: 3200,
  },
  {
    slug: 'prod-romero',
    name: 'Jabón de romero y menta',
    perfume: 'Romero y menta',
    description: 'Refrescante, recomendado para uso en ducha matutina.',
    attributes: ['energizante', 'piel mixta'],
    price: 3200,
  },
  {
    slug: 'prod-calendula',
    name: 'Jabón de caléndula',
    perfume: 'Caléndula',
    description: 'Calmante, formulado pensando en pieles muy sensibles o irritadas.',
    attributes: ['calmante', 'piel sensible', 'vegano'],
    price: 3400,
  },
];

const combosMock = [
  {
    name: 'Combo relax',
    comboPrice: 8500,
    description: 'Lavanda + rosa mosqueta + caléndula — para una rutina nocturna relajante.',
    productSlugs: ['prod-lavanda', 'prod-rosa-mosqueta', 'prod-calendula'],
  },
  {
    name: 'Combo energía',
    comboPrice: 8000,
    description: 'Cítrico + romero y menta + carbón activado — para arrancar el día.',
    productSlugs: ['prod-citrico', 'prod-romero', 'prod-carbon'],
  },
];

async function seed() {
  console.log('Limpiando catálogo existente...');
  await db.execute(sql`TRUNCATE TABLE combo_items, combos, products CASCADE`);

  console.log('Insertando productos...');
  const slugToId = new Map<string, string>();
  for (const p of productsMock) {
    const [row] = await db
      .insert(products)
      .values({
        name: p.name,
        perfume: p.perfume,
        description: p.description,
        attributes: p.attributes,
        price: p.price.toString(),
      })
      .returning({ id: products.id });
    slugToId.set(p.slug, row.id);
  }

  console.log('Insertando combos...');
  for (const c of combosMock) {
    const [row] = await db
      .insert(combos)
      .values({
        name: c.name,
        comboPrice: c.comboPrice.toString(),
        description: c.description,
      })
      .returning({ id: combos.id });

    for (const slug of c.productSlugs) {
      const productId = slugToId.get(slug);
      if (!productId) throw new Error(`Producto no encontrado para combo "${c.name}": ${slug}`);
      await db.insert(comboItems).values({ comboId: row.id, productId, quantity: 1 });
    }
  }

  console.log(`Seed completo ✓ (${productsMock.length} productos, ${combosMock.length} combos)`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error en el seed:', err);
  process.exit(1);
});
