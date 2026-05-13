/** Datos de ejemplo alineados con el contrato del backend (Product). */

export const PRODUCT_ID_LOW = '34f5ad27-b6a8-4538-9f67-92c2344be2d1';
export const PRODUCT_ID_OK = '22222222-2222-4222-a222-222222222222';

const now = () => new Date().toISOString();

export function productArrozBajoStock() {
  return {
    id: PRODUCT_ID_LOW,
    name: 'Arroz integral',
    description: 'Semilla',
    unitMeasure: 'kg' as const,
    minimumStock: 10,
    status: 'activo' as const,
    currentStock: 8,
    createdAt: now(),
    updatedAt: now(),
  };
}

export function productAceiteOkStock() {
  return {
    id: PRODUCT_ID_OK,
    name: 'Aceite oliva',
    description: null,
    unitMeasure: 'litros' as const,
    minimumStock: 2,
    status: 'activo' as const,
    currentStock: 15,
    createdAt: now(),
    updatedAt: now(),
  };
}

export function inventoryFor(productId: string, name: string, minimumStock: number, currentStock: number) {
  return {
    productId,
    name,
    minimumStock,
    currentStock,
  };
}
