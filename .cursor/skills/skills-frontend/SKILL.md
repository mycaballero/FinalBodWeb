---
description: Skills de implementación Frontend — React + Axios + TypeScript
globs: ["frontend/**/*.tsx", "frontend/**/*.ts"]
alwaysApply: false
---

# 🛠️ Skills Frontend — Gestión de Inventario

## SK1 — Configurar api.ts (base de todos los servicios)

```typescript
// frontend/src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

// Tipos de dominio
export interface Product {
  id: number;
  nombre: string;
  categoria: string;
  unidadMedida: 'unidades' | 'kg' | 'litros';
  stockMinimo: number;
  activo: boolean;
}

export interface InventoryItem extends Product {
  stockActual: number;
}

export interface CreateMovementPayload {
  productoId: number;
  tipo: 'entrada' | 'salida';
  cantidad: number;
  razon: 'compra' | 'venta' | 'ajuste' | 'merma' | 'devolucion';
}

// Funciones del servicio
export const getProducts = () =>
  api.get<Product[]>('/products').then(r => r.data);

export const getInventory = () =>
  api.get<InventoryItem[]>('/inventory').then(r => r.data);

export const getProductStock = (productId: number) =>
  api.get<{ stockActual: number }>(`/inventory/${productId}`).then(r => r.data);

export const createMovement = (payload: CreateMovementPayload) =>
  api.post('/movements', payload).then(r => r.data);

export default api;
```

## SK2 — Implementar ProductList con StockBadge

```tsx
// frontend/src/pages/ProductList.tsx
import { useEffect, useState } from 'react';
import { getInventory, InventoryItem } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function ProductList() {
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getInventory()
      .then(setProducts)
      .catch(() => setError('No se pudo cargar el inventario.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p>{error}</p>;
  if (products.length === 0) return <p>No hay productos registrados.</p>;

  return (
    <ul>
      {products.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </ul>
  );
}
```

```tsx
// frontend/src/components/StockBadge.tsx
interface StockBadgeProps {
  stockActual: number;
  stockMinimo: number;
}

export default function StockBadge({ stockActual, stockMinimo }: StockBadgeProps) {
  const bajo = stockActual <= stockMinimo;
  return (
    <span style={{ color: bajo ? 'red' : 'green', fontWeight: 'bold' }}>
      {bajo ? 'Stock bajo' : 'Stock OK'}
    </span>
  );
}
```

## SK3 — Implementar MovementForm con validación en tiempo real

**Pasos de implementación:**
1. Cargar lista de productos con `GET /products` al montar el componente.
2. Al cambiar el producto o el tipo, consultar `GET /inventory/:productId` si tipo === 'salida'.
3. Validar cantidad en `onChange`: entero positivo, y en salida no superar `stockDisponible`.
4. Deshabilitar el botón submit si hay errores de validación o petición en curso.
5. Al enviar exitosamente: limpiar el formulario y mostrar mensaje de éxito.

```tsx
// Fragmento clave — lógica de validación
const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const valor = parseInt(e.target.value, 10);
  if (isNaN(valor) || valor < 1) {
    setErrorCantidad('Debe ser un número entero mayor a 0.');
  } else if (tipo === 'salida' && stockDisponible !== null && valor > stockDisponible) {
    setErrorCantidad(`No puede superar el stock disponible (${stockDisponible}).`);
  } else {
    setErrorCantidad(null);
  }
  setCantidad(valor);
};

// Fragmento clave — submit
const handleSubmit = async () => {
  if (errorCantidad || !productoId || !tipo || !razon) return;
  setSubmitting(true);
  try {
    await createMovement({ productoId, tipo, cantidad, razon });
    setSuccess('Movimiento registrado correctamente.');
    resetForm();
  } catch (err) {
    setApiError(
      axios.isAxiosError(err)
        ? err.response?.data?.message || 'Error al registrar el movimiento.'
        : 'Error inesperado.'
    );
  } finally {
    setSubmitting(false);
  }
};
```

## SK4 — Manejo de errores de Axios en componentes

```typescript
// Patrón reutilizable para capturar errores de la API
import axios from 'axios';

function extractApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.message;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) return msg.join(', ');
  }
  return 'Ocurrió un error inesperado.';
}
```

## SK5 — Prompt para generar componentes con context engineering

```
Actúa como un desarrollador React senior.

CONTEXTO DEL ENDPOINT:
GET /inventory retorna:
[
  {
    "id": 1,
    "nombre": "Arroz",
    "categoria": "Alimentos",
    "unidadMedida": "kg",
    "stockMinimo": 10,
    "stockActual": 8,
    "activo": true
  }
]

CONVENCIONES DEL PROYECTO (rules-frontend.mdc):
- Tipado estricto, prohibido any
- Tres estados: loading, error, data
- Separación: lógica HTTP en api.ts, no en componentes
- Nomenclatura: PascalCase para componentes

CRITERIOS DE ACEPTACIÓN:
- ProductList muestra nombre, categoría, unidad de medida y stock actual
- StockBadge es rojo si stockActual <= stockMinimo
- Estado vacío manejado con mensaje descriptivo

Implementa ProductList y StockBadge siguiendo todas las convenciones.
```
