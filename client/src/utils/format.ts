export function formatPrice(amount: number): string {
  return '$' + amount.toLocaleString('es-AR');
}

/** "Jabón de lavanda" / "Jabón cítrico energizante" -> "lavanda" / "cítrico energizante" */
export function shortProductName(name: string): string {
  return name.replace('Jabón de ', '').replace('Jabón ', '');
}
