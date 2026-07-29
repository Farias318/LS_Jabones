import { useEffect, useMemo, useState } from 'react';
import type { Combo, Product } from '../types';
import { fetchCombos, fetchProducts } from '../services/api';

export function useProducts() {
  const [perfumeFilter, setPerfumeFilter] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((err) => console.error('Error cargando productos:', err));
    fetchCombos()
      .then(setCombos)
      .catch((err) => console.error('Error cargando combos:', err));
  }, []);

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
