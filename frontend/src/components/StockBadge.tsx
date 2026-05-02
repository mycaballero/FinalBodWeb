interface StockBadgeProps {
  currentStock: number;
  minimumStock: number;
}

export function StockBadge({ currentStock, minimumStock }: StockBadgeProps) {
  const isLowStock = currentStock <= minimumStock;

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        isLowStock
          ? 'border-rose-300 bg-rose-50 text-rose-700'
          : 'border-indigo-300 bg-indigo-50 text-indigo-700'
      }`}
    >
      {isLowStock ? 'Stock bajo' : 'Stock OK'}
    </span>
  );
}
