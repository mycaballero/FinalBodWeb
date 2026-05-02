import type { ProductStatus } from '../types/domain';

interface StatusBadgeProps {
  status: ProductStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isActive = status === 'activo';

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        isActive
          ? 'border border-emerald-300 bg-emerald-50 text-emerald-700'
          : 'border border-slate-300 bg-slate-100 text-slate-600'
      }`}
    >
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  );
}
