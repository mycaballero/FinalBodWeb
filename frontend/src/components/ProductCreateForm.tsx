import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createProduct, normalizeApiError, updateProduct } from '../services/api';
import type { Product, UnitMeasure } from '../types/domain';

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

const defaultFormValues: CreateProductValues = {
  name: '',
  description: '',
  unitMeasure: 'unidades',
  minimumStock: 0,
};

interface ProductCreateFormProps {
  editTarget?: Product | null;
  onCancelEdit?: () => void;
}

export function ProductCreateForm({ editTarget = null, onCancelEdit }: ProductCreateFormProps) {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(editTarget);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    if (editTarget) {
      queueMicrotask(() => {
        setSuccessMessage(null);
      });
      reset({
        name: editTarget.name,
        description: editTarget.description ?? '',
        unitMeasure: editTarget.unitMeasure,
        minimumStock: editTarget.minimumStock,
      });
    } else {
      reset(defaultFormValues);
    }
  }, [editTarget, reset]);

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async () => {
      updateMutation.reset();
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      reset(defaultFormValues);
      setSuccessMessage('Producto creado correctamente.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name: string; description?: string; unitMeasure: UnitMeasure } }) =>
      updateProduct(id, payload),
    onSuccess: async () => {
      createMutation.reset();
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      reset(defaultFormValues);
      setSuccessMessage('Producto actualizado correctamente.');
      onCancelEdit?.();
    },
  });

  const activeMutation = isEditMode ? updateMutation : createMutation;
  const savePending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: CreateProductValues) => {
    if (editTarget) {
      await updateMutation.mutateAsync({
        id: editTarget.id,
        payload: {
          name: values.name.trim(),
          description: values.description?.trim() ? values.description.trim() : undefined,
          unitMeasure: values.unitMeasure,
        },
      });
      return;
    }

    await createMutation.mutateAsync({
      name: values.name.trim(),
      description: values.description?.trim() ? values.description.trim() : undefined,
      unitMeasure: values.unitMeasure,
      minimumStock: values.minimumStock,
    });
  };

  const handleCancelEdit = () => {
    createMutation.reset();
    updateMutation.reset();
    setSuccessMessage(null);
    reset(defaultFormValues);
    onCancelEdit?.();
  };

  return (
    <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        {isEditMode ? 'Actualizar producto' : 'Crear producto'}
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        {isEditMode
          ? 'Modifica nombre, descripción y unidad. El stock mínimo no se cambia desde aquí.'
          : 'Agrega nuevos productos al inventario para registrar movimientos.'}
      </p>

      {activeMutation.isError ? (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {normalizeApiError(activeMutation.error)}
        </p>
      ) : null}

      {successMessage ? (
        <p
          role="status"
          aria-live="polite"
          className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
        >
          <span className="mt-0.5 shrink-0 text-base leading-none" aria-hidden>
            ✓
          </span>
          <span>{successMessage}</span>
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
              disabled={isEditMode}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100"
              {...register('minimumStock', { valueAsNumber: true })}
            />
            {errors.minimumStock ? (
              <p className="mt-1 text-xs text-rose-600">{errors.minimumStock.message}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={isSubmitting || savePending}
            className="inline-flex cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting || savePending
              ? 'Guardando...'
              : isEditMode
                ? 'Guardar cambios'
                : 'Crear producto'}
          </button>
          {isEditMode ? (
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={savePending}
              className="inline-flex cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar edición
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
