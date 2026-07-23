import type { Combo } from '../types';

/* Ver nota de datos de prueba en ./products.mock.ts */
export const combosMock: Combo[] = [
  {
    id: 'combo-relax',
    name: 'Combo relax',
    comboPrice: 8500,
    description: 'Lavanda + rosa mosqueta + caléndula — para una rutina nocturna relajante.',
    productIds: ['prod-lavanda', 'prod-rosa-mosqueta', 'prod-calendula'],
    active: true,
  },
  {
    id: 'combo-energia',
    name: 'Combo energía',
    comboPrice: 8000,
    description: 'Cítrico + romero y menta + carbón activado — para arrancar el día.',
    productIds: ['prod-citrico', 'prod-romero', 'prod-carbon'],
    active: true,
  },
];
