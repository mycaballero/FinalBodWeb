import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import {
  createMovement,
  getInventoryByProductId,
  getProductById,
  getProducts,
  normalizeApiError,
} from '../services/api';
import type { MovementReason, MovementType, Product } from '../types/domain';

const movementSchema = z.object({
  productId: z.string().uuid('Debes seleccionar un producto valido.'),
  type: z.enum(['entrada', 'salida']),
  reason: z.enum(['compra', 'venta', 'ajuste', 'merma', 'devolucion']),
  quantity: z.number().positive('La cantidad debe ser mayor a 0.'),
});

type MovementFormValues = z.infer<typeof movementSchema>;

const typeOptions: Array<{ value: MovementType; label: string }> = [
  { value: 'entrada', label: 'Entrada' },
  { value: 'salida', label: 'Salida' },
];

const reasonOptions: Array<{ value: MovementReason; label: string }> = [
  { value: 'compra', label: 'Compra' },
  { value: 'venta', label: 'Venta' },
  { value: 'ajuste', label: 'Ajuste' },
  { value: 'merma', label: 'Merma' },
  { value: 'devolucion', label: 'Devolucion' },
];

export function MovementForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const initialProductId = searchParams.get('productId') ?? '';
  const [generalError, setGeneralError] = useState<string | null>(null);

  const productsQuery = useQuery({
    queryKey: ['products-for-select'],
    queryFn: getProducts,
  });

  const activeProducts = useMemo(
    () => productsQuery.data?.filter((product) => product.status === 'activo') ?? [],
    [productsQuery.data],
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<MovementFormValues>({
    resolver: zodResolver(movementSchema),
    mode: 'onChange',
    defaultValues: {
      productId: initialProductId,
      type: 'entrada',
      reason: 'compra',
      quantity: 1,
    },
  });

  const selectedProductId = useWatch({ control, name: 'productId' });
  const selectedType = useWatch({ control, name: 'type' });
  const quantity = useWatch({ control, name: 'quantity' });

  const productQuery = useQuery({
    queryKey: ['product', selectedProductId],
    queryFn: () => getProductById(selectedProductId),
    enabled:
      Boolean(selectedProductId) &&
      !productsQuery.data?.some((product) => product.id === selectedProductId),
  });

  useEffect(() => {
    if (selectedProductId || activeProducts.length === 0) {
      return;
    }
    const defaultProduct = activeProducts[0];
    if (defaultProduct) {
      setValue('productId', defaultProduct.id);
    }
  }, [activeProducts, selectedProductId, setValue]);

  const resolvedProduct: Product | undefined =
    productsQuery.data?.find((product) => product.id === selectedProductId) ?? productQuery.data;

  const stockQuery = useQuery({
    queryKey: ['inventory-item', selectedProductId],
    queryFn: () => getInventoryByProductId(selectedProductId),
    enabled: Boolean(selectedProductId) && selectedType === 'salida',
  });

  useEffect(() => {
    if (selectedType !== 'salida') {
      clearErrors('quantity');
      return;
    }
    if (typeof quantity !== 'number' || !stockQuery.data) {
      return;
    }
    if (quantity > stockQuery.data.currentStock) {
      setError('quantity', {
        type: 'manual',
        message: `La salida no puede superar el stock disponible (${stockQuery.data.currentStock}).`,
      });
    } else {
      clearErrors('quantity');
    }
  }, [quantity, selectedType, setError, clearErrors, stockQuery.data]);

  const mutation = useMutation({
    mutationFn: createMovement,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.invalidateQueries({ queryKey: ['products-for-select'] });
      navigate('/products');
    },
    onError: (error) => {
      setGeneralError(normalizeApiError(error));
    },
  });

  const availableStock = useMemo(
    () => (selectedType === 'salida' ? stockQuery.data?.currentStock ?? null : null),
    [selectedType, stockQuery.data?.currentStock],
  );

  const salidaStockBlocked =
    selectedType === 'salida' &&
    Boolean(selectedProductId) &&
    (stockQuery.isLoading || stockQuery.isError || stockQuery.data === undefined);

  const onSubmit = (values: MovementFormValues) => {
    setGeneralError(null);
    if (values.type === 'salida' && availableStock !== null && values.quantity > availableStock) {
      setError('quantity', {
        type: 'manual',
        message: `La salida no puede superar el stock disponible (${availableStock}).`,
      });
      return;
    }

    mutation.mutate({
      ...values,
      date: new Date().toISOString(),
    });
  };

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 rounded-2xl border border-indigo-200 bg-gradient-to-br from-white via-indigo-50/40 to-violet-50 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Registrar movimiento</h1>
          <p className="text-sm text-slate-500">
            {resolvedProduct ? `Producto seleccionado: ${resolvedProduct.name}` : 'Completa los datos del movimiento'}
          </p>
        </div>
        <Link to="/products" className="text-sm font-medium text-indigo-700 hover:text-indigo-900">
          Volver
        </Link>
      </div>

      {generalError ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{generalError}</p>
      ) : null}

      <form className="space-y-4" onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700" htmlFor="productId">
            Producto
          </label>
          <select
            id="productId"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register('productId')}
          >
            <option value="">Selecciona un producto</option>
            {activeProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.unitMeasure})
              </option>
            ))}
          </select>
          {productsQuery.isLoading ? <p className="text-xs text-slate-500">Cargando productos...</p> : null}
          {errors.productId ? <p className="text-sm text-rose-600">{errors.productId.message}</p> : null}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700" htmlFor="type">
              Tipo
            </label>
            <select
              id="type"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              {...register('type')}
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700" htmlFor="reason">
              Razon
            </label>
            <select
              id="reason"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              {...register('reason')}
            >
              {reasonOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700" htmlFor="quantity">
            Cantidad
          </label>
          <input
            id="quantity"
            type="number"
            min="0"
            step="0.01"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register('quantity', { valueAsNumber: true })}
          />
          {selectedType === 'salida' && Boolean(selectedProductId) ? (
            stockQuery.isLoading ? (
              <p className="text-xs text-slate-500">Cargando stock disponible...</p>
            ) : stockQuery.isError ? (
              <div className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
                <p>No se pudo obtener el stock. Reintenta para poder validar la salida.</p>
                <button
                  type="button"
                  onClick={() => void stockQuery.refetch()}
                  className="cursor-pointer rounded border border-amber-400 px-2 py-1 font-medium text-amber-900 hover:bg-amber-100"
                >
                  Reintentar
                </button>
              </div>
            ) : availableStock !== null ? (
              <p className="text-xs text-slate-500">Stock disponible para salida: {availableStock}</p>
            ) : null
          ) : null}
          {errors.quantity ? <p className="text-sm text-rose-600">{errors.quantity.message}</p> : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || mutation.isPending || salidaStockBlocked}
          className="inline-flex cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting || mutation.isPending ? 'Guardando...' : 'Guardar movimiento'}
        </button>
      </form>
    </section>
  );
}
