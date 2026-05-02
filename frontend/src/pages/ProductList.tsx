import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deactivateProduct, getProducts, normalizeApiError } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { ProductCreateForm } from '../components/ProductCreateForm';
import type { Product } from '../types/domain';

export function ProductList() {
  const queryClient = useQueryClient();
  const [deactivateError, setDeactivateError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');
  const [sortBy, setSortBy] = useState<'alphabetical' | 'stock'>('alphabetical');

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    retry: false,
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (mutationError) => {
      setDeactivateError(normalizeApiError(mutationError));
    },
  });

  const handleDeactivate = (product: Product) => {
    setDeactivateError(null);
    const confirmed = window.confirm(`¿Deseas desactivar el producto "${product.name}"?`);
    if (!confirmed) {
      return;
    }
    void deactivateMutation.mutateAsync(product.id);
  };

  if (isLoading) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Panel de productos</h1>
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 p-5">
          <p className="text-sm text-indigo-700">Cargando productos...</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Panel de productos</h1>
        <div className="space-y-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm text-rose-700">{normalizeApiError(error)}</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-lg border border-rose-300 px-3 py-2 text-sm text-rose-700 hover:bg-rose-100"
          >
            {isFetching ? 'Reintentando...' : 'Reintentar'}
          </button>
        </div>
        <ProductCreateForm />
      </section>
    );
  }

  if (!data || data.length === 0) {
    return (
      <section className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-semibold text-slate-900">Panel de productos</h1>
          <p className="mt-2 text-sm text-slate-500">No hay productos registrados todavia.</p>
        </div>
        <ProductCreateForm />
      </section>
    );
  }

  const activeProducts = data.filter((product) => product.status === 'activo');
  const normalizedFilter = filterText.trim().toLowerCase();
  const filteredProducts = activeProducts.filter((product) =>
    product.name.toLowerCase().includes(normalizedFilter),
  );
  const orderedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'stock') {
      return a.currentStock - b.currentStock;
    }
    return a.name.localeCompare(b.name, 'es');
  });

  const activeCount = activeProducts.length;
  const lowStockCount = activeProducts.filter((product) => product.currentStock <= product.minimumStock).length;

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold">Panel de productos</h1>
          <p className="mt-1 text-sm text-indigo-100">
            Listado visual del inventario con estados y acceso directo a movimientos.
          </p>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-xl bg-white/15 p-3">
            <p className="text-indigo-100">Total productos</p>
            <p className="text-xl font-semibold">{data.length}</p>
          </div>
          <div className="rounded-xl bg-white/15 p-3">
            <p className="text-indigo-100">Activos</p>
            <p className="text-xl font-semibold">{activeCount}</p>
          </div>
          <div className="rounded-xl bg-white/15 p-3">
            <p className="text-indigo-100">Stock bajo</p>
            <p className="text-xl font-semibold">{lowStockCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Listado de productos</h2>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={filterText}
                onChange={(event) => setFilterText(event.target.value)}
                placeholder="Filtrar producto por nombre..."
                className="w-56 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() =>
                  setSortBy((current) => (current === 'alphabetical' ? 'stock' : 'alphabetical'))
                }
                className="rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
              >
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden>🔎</span>
                  <span>{sortBy === 'alphabetical' ? 'A-Z' : '1-9'}</span>
                  <span>Ordenar por {sortBy === 'alphabetical' ? 'alfabético' : 'stock'}</span>
                </span>
              </button>
            </div>
          </div>
          {deactivateError ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {deactivateError}
            </p>
          ) : null}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {orderedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDeactivate={handleDeactivate}
                isDeactivating={deactivateMutation.isPending && deactivateMutation.variables === product.id}
              />
            ))}
          </div>
          {orderedProducts.length === 0 ? (
            <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              No hay productos activos que coincidan con el filtro.
            </p>
          ) : null}
        </div>
        <div>
          <ProductCreateForm />
        </div>
      </div>
    </section>
  );
}
