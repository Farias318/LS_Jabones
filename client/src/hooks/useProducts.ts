import { useMemo, useState } from 'react';
import { productsMock } from '../data/products.mock';
import { combosMock } from '../data/combos.mock';

/*
  Fuente de datos mock — reemplazar por fetch a /api/products y /api/combos
  cuando exista el backend (Fase 1 en ../../../docs/especificacion-tecnica.md).
  La forma del hook (products, combos, perfumes, filtro) no debería cambiar.
*/
export function useProducts() {
  const [perfumeFilter, setPerfumeFilter] = useState<string | null>(null);

  const products = useMemo(() => productsMock.filter((p) => p.active), []);
  const combos = useMemo(() => combosMock.filter((c) => c.active), []);

  const perfumes = useMemo(
    () => Array.from(new Set(products.map((p) => p.perfume))).sort(),
    [products],
  );

  const filteredProducts = useMemo(
    () => (perfumeFilter ? products.filter((p) => p.perfume === perfumeFilter) : products),
    [products, perfumeFilter],
  );

  return { products, combos, perfumes, perfumeFilter, setPerfumeFilter, filteredProducts };
}
