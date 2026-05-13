import { Link } from 'react-router-dom';
import type { Product } from '../types/domain';
import { isLowStock } from '../utils/stock';
import { StockBadge } from './StockBadge';
import { StatusBadge } from './StatusBadge';

interface ProductCardProps {
  product: Product;
  isDeactivating?: boolean;
  onDeactivate?: (product: Product) => void;
  onEdit?: (product: Product) => void;
}

export function ProductCard({
  product,
  isDeactivating = false,
  onDeactivate,
  onEdit,
}: ProductCardProps) {
  const lowStock = isLowStock(product.currentStock, product.minimumStock);
  const isInactive = product.status === 'inactivo';

  return (
    <article
      className={`rounded-2xl border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
        lowStock
          ? 'border-rose-200 bg-gradient-to-br from-white via-rose-50/50 to-white'
          : 'border-indigo-200 bg-gradient-to-br from-white via-indigo-50/50 to-white'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
          <p className="mt-1 text-sm text-slate-500">
            Unidad: {product.unitMeasure} · Minimo: {product.minimumStock}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit?.(product)}
              disabled={isInactive}
              title="Editar nombre, descripción y unidad"
              aria-label="Editar producto"
              className="group inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200/90 bg-slate-100 p-1.5 text-slate-500 shadow-sm transition-colors duration-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              <span
                className="inline-block origin-center text-base leading-none transition-transform duration-200 ease-out group-hover:scale-110 group-disabled:scale-100"
                aria-hidden
              >
                ⚙
              </span>
            </button>
            <StatusBadge status={product.status} />
          </div>
          <StockBadge currentStock={product.currentStock} minimumStock={product.minimumStock} />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200/80 bg-white/90 p-3">
        <p className="text-xs uppercase tracking-wide text-slate-500">Stock actual</p>
        <p className={`text-2xl font-semibold ${lowStock ? 'text-rose-600' : 'text-indigo-700'}`}>
          {product.currentStock}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          to={`/movements/new?productId=${product.id}`}
          className={`inline-flex rounded-lg px-4 py-2 text-sm font-medium text-white ${
            isInactive
              ? 'cursor-not-allowed bg-slate-400 pointer-events-none'
              : 'cursor-pointer bg-indigo-600 hover:bg-indigo-500'
          }`}
        >
          Registrar movimiento
        </Link>
        <button
          type="button"
          onClick={() => onDeactivate?.(product)}
          disabled={isInactive || isDeactivating}
          className="inline-flex cursor-pointer rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeactivating ? 'Desactivando...' : 'Desactivar'}
        </button>
      </div>
    </article>
  );
}
