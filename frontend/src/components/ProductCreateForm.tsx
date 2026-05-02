import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createProduct, normalizeApiError } from '../services/api';
import type { UnitMeasure } from '../types/domain';

const createProductSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.').max(120),
  description: z.string().max(300).optional(),
  unitMeasure: z.enum(['unidades', 'kg', 'litros']),
  minimumStock: z.number().min(0, 'El stock minimo no puede ser negativo.'),
});

type CreateProductValues = z.infer<typeof createProductSchema>;

const unitOptions: Array<{ value: UnitMeasure; label: string }> = [
  { value: 'unidades', label: 'Unidades' },
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'litros', label: 'Litros' },
];

export function ProductCreateForm() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: '',
      description: '',
      unitMeasure: 'unidades',
      minimumStock: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      reset();
    },
  });

  const onSubmit = async (values: CreateProductValues) => {
    await mutation.mutateAsync({
      ...values,
      description: values.description?.trim() ? values.description : undefined,
    });
  };

  return (
    <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Crear producto</h2>
      <p className="mt-1 text-sm text-slate-600">Agrega nuevos productos al inventario para registrar movimientos.</p>

      {mutation.isError ? (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {normalizeApiError(mutation.error)}
        </p>
      ) : null}

      {mutation.isSuccess ? (
        <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          Producto creado correctamente.
        </p>
      ) : null}

      <form className="mt-4 space-y-3" onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="name">
            Nombre
          </label>
          <input
            id="name"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
            {...register('name')}
          />
          {errors.name ? <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="description">
            Descripción
          </label>
          <textarea
            id="description"
            rows={3}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
            {...register('description')}
          />
          {errors.description ? <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p> : null}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="unitMeasure">
              Unidad
            </label>
            <select
              id="unitMeasure"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
              {...register('unitMeasure')}
            >
              {unitOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="minimumStock">
              Stock minimo
            </label>
            <input
              id="minimumStock"
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
              {...register('minimumStock', { valueAsNumber: true })}
            />
            {errors.minimumStock ? (
              <p className="mt-1 text-xs text-rose-600">{errors.minimumStock.message}</p>
            ) : null}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || mutation.isPending}
          className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {isSubmitting || mutation.isPending ? 'Guardando...' : 'Crear producto'}
        </button>
      </form>
    </section>
  );
}
