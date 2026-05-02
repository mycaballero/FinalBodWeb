export type UnitMeasure = 'unidades' | 'kg' | 'litros';
export type ProductStatus = 'activo' | 'inactivo';
export type MovementType = 'entrada' | 'salida';
export type MovementReason = 'compra' | 'venta' | 'ajuste' | 'merma' | 'devolucion';

export interface ApiError {
  code: number;
  message: string | string[];
  details: unknown;
  path: string;
  timestamp: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  unitMeasure: UnitMeasure;
  minimumStock: number;
  status: ProductStatus;
  currentStock: number;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  unitMeasure: UnitMeasure;
  minimumStock: number;
}

export interface InventoryItem {
  productId: string;
  name: string;
  minimumStock: number;
  currentStock: number;
}

export interface CreateMovementPayload {
  productId: string;
  type: MovementType;
  reason: MovementReason;
  quantity: number;
  date: string;
}

export interface Movement {
  id: string;
  productId: string;
  type: MovementType;
  reason: MovementReason;
  quantity: string;
  date: string;
  createdAt: string;
}
