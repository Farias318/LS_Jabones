import type { Product } from '../types';

/*
  Datos de prueba con la misma forma que va a tener la API real (ver
  ../../../docs/especificacion-tecnica.md §5). Se reemplaza por un fetch a
  /api/products cuando exista el backend — los componentes no deberían
  necesitar cambios más allá de eso.

  imageUrl queda sin definir a propósito: sin foto real, ProductCard muestra
  un placeholder ilustrado. Completar con la URL real cuando lleguen las fotos.
*/
export const productsMock: Product[] = [
  {
    id: 'prod-lavanda',
    name: 'Jabón de lavanda',
    perfume: 'Lavanda',
    description: 'Aroma relajante, ideal para antes de dormir. Con avena molida para exfoliar suave.',
    attributes: ['relajante', 'piel sensible', 'vegano'],
    price: 3200,
    active: true,
  },
  {
    id: 'prod-avena-miel',
    name: 'Jabón de avena y miel',
    perfume: 'Avena y miel',
    description: 'Hidratante y suave, pensado para pieles secas. Miel pura de productores locales.',
    attributes: ['hidratante', 'piel seca'],
    price: 3400,
    active: true,
  },
  {
    id: 'prod-citrico',
    name: 'Jabón cítrico energizante',
    perfume: 'Naranja y pomelo',
    description: 'Aroma fresco y despertador, con ralladura natural de cítricos.',
    attributes: ['energizante', 'vegano'],
    price: 3200,
    active: true,
  },
  {
    id: 'prod-carbon',
    name: 'Jabón de carbón activado',
    perfume: 'Tea tree',
    description: 'Purificante, recomendado para piel grasa o con tendencia acneica.',
    attributes: ['purificante', 'piel grasa'],
    price: 3600,
    active: true,
  },
  {
    id: 'prod-rosa-mosqueta',
    name: 'Jabón de rosa mosqueta',
    perfume: 'Rosa mosqueta',
    description: 'Regenerador, con aceite de rosa mosqueta prensado en frío.',
    attributes: ['regenerador', 'piel sensible'],
    price: 3800,
    active: true,
  },
  {
    id: 'prod-coco',
    name: 'Jabón de coco',
    perfume: 'Coco',
    description: 'Espuma cremosa y aroma tropical suave. Apto para todo tipo de piel.',
    attributes: ['hidratante', 'vegano'],
    price: 3200,
    active: true,
  },
  {
    id: 'prod-romero',
    name: 'Jabón de romero y menta',
    perfume: 'Romero y menta',
    description: 'Refrescante, recomendado para uso en ducha matutina.',
    attributes: ['energizante', 'piel mixta'],
    price: 3200,
    active: true,
  },
  {
    id: 'prod-calendula',
    name: 'Jabón de caléndula',
    perfume: 'Caléndula',
    description: 'Calmante, formulado pensando en pieles muy sensibles o irritadas.',
    attributes: ['calmante', 'piel sensible', 'vegano'],
    price: 3400,
    active: true,
  },
];
