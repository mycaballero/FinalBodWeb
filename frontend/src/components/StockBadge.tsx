import { isLowStock } from '../utils/stock';

interface StockBadgeProps {
  currentStock: number;
  minimumStock: number;
}

export function StockBadge({ currentStock, minimumStock }: StockBadgeProps) {
  const low = isLowStock(currentStock, minimumStock);

  const label = low
    ? `Alerta: stock bajo (${currentStock}, mínimo ${minimumStock})`
    : `Stock en niveles aceptables (${currentStock}, mínimo ${minimumStock})`;

  return (
    <span
      role="status"
      aria-label={label}
      data-testid="stock-badge"
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        low
          ? 'border-rose-300 bg-rose-50 text-rose-700'
          : 'border-indigo-300 bg-indigo-50 text-indigo-700'
      }`}
    >
      {low ? 'Stock bajo' : 'Stock OK'}
    </span>
  );
}
