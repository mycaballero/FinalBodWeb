import axios from 'axios';
import type {
  ApiError,
  CreateMovementPayload,
  CreateProductPayload,
  InventoryItem,
  Movement,
  Product,
} from '../types/domain';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export function normalizeApiError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Ocurrio un error inesperado.';
  }

  const payload = error.response?.data as ApiError | undefined;
  if (!payload) {
    return 'No fue posible contactar el servidor.';
  }

  if (Array.isArray(payload.message)) {
    return payload.message.join(', ');
  }
  return payload.message ?? 'Ocurrio un error en la solicitud.';
}

export async function getProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>('/products');
  return response.data;
}

export async function getProductById(id: string): Promise<Product> {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
}

export async function getInventoryByProductId(productId: string): Promise<InventoryItem> {
  const response = await api.get<InventoryItem>(`/inventory/${productId}`);
  return response.data;
}

export async function createMovement(payload: CreateMovementPayload): Promise<Movement> {
  const response = await api.post<Movement>('/movements', payload);
  return response.data;
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const response = await api.post<Product>('/products', payload);
  return response.data;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export async function updateProduct(id: string, payload: UpdateProductPayload): Promise<Product> {
  const response = await api.patch<Product>(`/products/${id}`, payload);
  return response.data;
}

export async function deactivateProduct(productId: string): Promise<void> {
  await api.delete(`/products/${productId}`);
}

export default api;
