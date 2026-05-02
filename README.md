# FinalBodWeb

## Backend y Database

### Stack tecnico
- NestJS + TypeORM + PostgreSQL.
- Validacion de entrada con `class-validator`.
- Testing con Jest, fast-check y Stryker.

### Estructura backend
```text
backend/src/
  products/   (dto, entities, controller, service)
  movements/  (dto, entities, controller, service)
  inventory/  (controller, service)
  common/     (filters, health)
  database/   (data-source, migrations, seeds)
```

### Levantar entorno local
1. Levantar PostgreSQL:
   - `docker compose up -d`
2. Entrar al backend:
   - `cd backend`
3. Instalar dependencias:
   - `npm install`
4. Crear variables de entorno:
   - copiar `backend/.env.example` a `backend/.env`
5. Aplicar migraciones:
   - `npm run migration:run`
6. Cargar seed minima:
   - `npm run seed:run`
7. Iniciar backend:
   - `npm run start:dev`

### Scripts backend clave
- `npm run migration:run`: aplica migraciones.
- `npm run migration:revert`: revierte ultima migracion.
- `npm run seed:run`: ejecuta seed idempotente.
- `npm run test`: pruebas unitarias Jest.
- `npm run test:pbt`: property-based tests (fast-check).
- `npm run test:mutation`: mutation testing (Stryker).
- `npm run test:e2e`: smoke e2e (`GET /health`) sin requerir PostgreSQL levantado.

### Reglas de negocio implementadas
- Unidades validas: `unidades | kg | litros`.
- Movimientos validos:
  - tipo: `entrada | salida`
  - razon: `compra | venta | ajuste | merma | devolucion`
- No sobreventa: una `salida` no puede superar stock disponible.
- Productos se desactivan logicamente con `DELETE /products/:id`.
- Low stock: `stock_actual <= stock_minimo`.

### Endpoints canónicos
- `POST /products`
- `GET /products`
- `GET /products/:id`
- `PATCH /products/:id`
- `DELETE /products/:id`
- `POST /movements`
- `GET /movements`
- `GET /movements/:id`
- `GET /inventory`
- `GET /inventory/:productId`
- `GET /inventory/alerts/low-stock`

### Protocolo obligatorio de preguntas (antes de implementar cada historia)
1. Regla funcional exacta: que casos borde deben aceptarse y rechazarse.
2. Contrato API: payload, respuesta y codigos HTTP obligatorios.
3. Persistencia: constraints, indices y unicidad requeridos.
4. Concurrencia: riesgo de race condition y estrategia transaccional.
5. Pruebas: casos minimos felices, negativos y bordes para DoD.

### Trazabilidad inicial de historias (backend/database)
- INV-001/002/003: `backend/src/database/*`.
- INV-004: `backend/src/{products,movements,inventory,common}`.
- INV-005 a INV-012: controllers/services por modulo.
- INV-013: filtro global de errores en `backend/src/common/filters/http-exception.filter.ts`.
- INV-014: base de pruebas en `backend/src/**/*.spec.ts` y `backend/src/movements/movements.pbt.spec.ts`.

## Frontend

### Stack tecnico frontend
- React + Vite + TypeScript estricto.
- TailwindCSS para UI.
- Axios para integracion HTTP.
- React Query para fetching/cache.
- React Hook Form + Zod para validacion de formularios.
- Playwright para e2e.

### Estructura frontend
```text
frontend/src/
  pages/       (ProductList, MovementForm)
  components/  (ProductCard, StockBadge)
  services/    (api)
  types/       (domain)
  e2e/         (Playwright specs)
```

### Levantar frontend local
1. Entrar al frontend:
   - `cd frontend`
2. Instalar dependencias:
   - `npm install`
3. Configurar variables:
   - copiar `frontend/.env.example` a `frontend/.env`
4. Iniciar entorno de desarrollo:
   - `npm run dev`

### Scripts frontend clave
- `npm run dev`: levanta frontend en modo desarrollo.
- `npm run build`: valida TypeScript y compila Vite.
- `npm run lint`: validaciones estáticas de código.
- `npm run test:e2e`: ejecuta pruebas e2e de `INV-015` y `INV-016`.

### Integracion frontend-backend
- Base URL API: `VITE_API_URL` (default `http://localhost:3000`).
- Endpoints consumidos por frontend:
  - `GET /products` (incluye `currentStock` y `minimumStock` para lista).
  - `GET /products/:id`.
  - `GET /inventory/:productId`.
  - `POST /movements`.
- Contrato de error consumido:
  - `code`, `message`, `details`, `path`, `timestamp`.

### Trazabilidad frontend (historias y tickets)
- INV-015 / FE-001 / FE-002:
  - `frontend/src/pages/ProductList.tsx`
  - `frontend/src/components/ProductCard.tsx`
  - `frontend/src/components/StockBadge.tsx`
- INV-016 / FE-003 / FE-004:
  - `frontend/src/pages/MovementForm.tsx`
  - `frontend/src/services/api.ts`
- FE-005:
  - `frontend/src/e2e/product-list.spec.ts`
  - `frontend/src/e2e/movement-form.spec.ts`
