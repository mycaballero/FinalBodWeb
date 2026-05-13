# FinalBodWeb

Monorepo de inventario: **backend** NestJS + TypeORM + PostgreSQL y **frontend** React + Vite. Las reglas de negocio críticas (stock mínimo, salidas acotadas al disponible, desactivación lógica de productos) viven en el servidor; el cliente las refuerza en UX y está cubierto por **E2E con Playwright**.

---

## Análisis final del estado del proyecto

- **Documentación vs código:** el PRD original (`docs/PRD.md`) describe sobre todo el backend; el frontend amplía el alcance con historias INV-015/INV-016 y tickets FE-*. El contrato HTTP canónico es la columna vertebral entre ambos paquetes.
- **Calidad backend:** Jest en servicios y rutas, fast-check en propiedades de movimientos, Stryker para mutación, y un smoke E2E de API (`GET /health`) sin depender de Postgres en ese job concreto.
- **Calidad frontend:** build con TypeScript estricto, ESLint, y E2E en Chromium con mocks de red alineados a `VITE_API_URL` (ver `frontend/playwright.config.ts` y `docs/auditoria-tecnica-360-e2e-finalbodweb.md`).
- **Riesgo principal a vigilar:** los E2E del frontend no sustituyen contratos verificados contra Nest en cada commit; conviene un job opcional contra API real + seed cuando el equipo lo priorice.

---

## Trazabilidad (documentos → trabajo → código)

### Fuentes de verdad

| Documento | Contenido |
|-----------|------------|
| [`docs/PRD.md`](docs/PRD.md) | Objetivo, alcance, reglas de negocio, endpoints canónicos, arquitectura backend. |
| [`docs/user-stories.md`](docs/user-stories.md) | Historias **INV-001** … **INV-016** (Gherkin y criterios). |
| [`docs/tickets.md`](docs/tickets.md) | Tickets **DB-***, **BE-***, **QA-001**, **FE-001** … **FE-005** enlazados a INV y matriz resumida. |

### Matriz historia (INV) / ticket → implementación principal

| Historia | Ticket(s) típicos | Ubicación en código |
|----------|-------------------|---------------------|
| INV-001 Modelo relacional | DB-001 | `backend/src/database/entities`, migraciones iniciales |
| INV-002 Migraciones e índices | DB-002 | `backend/src/database/migrations` |
| INV-003 Seed mínima | DB-003 | `backend/src/database/seeds` |
| INV-004 Arquitectura NestJS | BE-001 | `backend/src/app.module.ts`, módulos `products`, `movements`, `inventory`, `common` |
| INV-005 Alta producto | BE-002 | `backend/src/products/*` |
| INV-006 Consulta productos | BE-003 | `backend/src/products/*` |
| INV-007 PATCH / DELETE lógico | BE-004 | `backend/src/products/*` |
| INV-008 Entrada inventario | BE-005 | `backend/src/movements/*` |
| INV-009 Salida con tope de stock | BE-006 | `backend/src/movements/*` |
| INV-010 Stock por producto | BE-007 | `backend/src/inventory/*` |
| INV-011 Low stock | BE-008 | `backend/src/inventory/*` |
| INV-012 Historial / filtros movimientos | BE-009 | `backend/src/movements/*` |
| INV-013 Errores uniformes | BE-010 | `backend/src/common/filters/http-exception.filter.ts` |
| INV-014 Estrategia de pruebas | QA-001 | `backend/src/**/*.spec.ts`, `backend/src/movements/movements.pbt.spec.ts`, Stryker |
| INV-015 Lista de productos (UI) | FE-001, FE-002 | `frontend/src/pages/ProductList.tsx`, `frontend/src/components/ProductCard.tsx`, `frontend/src/components/StockBadge.tsx` |
| INV-016 Formulario movimiento (UI) | FE-003, FE-004 | `frontend/src/pages/MovementForm.tsx`, `frontend/src/services/api.ts` |
| INV-015 / INV-016 E2E UI | FE-005 | `frontend/tests/e2e/*.spec.ts`, `frontend/tests/mocks`, `frontend/tests/fixtures`, `frontend/tests/utils` |

### Auditoría reciente

- [`docs/auditoria-tecnica-360-e2e-finalbodweb.md`](docs/auditoria-tecnica-360-e2e-finalbodweb.md) — cruce PRD / código / E2E, deuda y riesgos.

---

## Backend y base de datos

### Stack

- NestJS + TypeORM + PostgreSQL  
- Validación de entrada con `class-validator`  
- Jest, fast-check (PBT), Stryker  

### Estructura backend

```text
backend/src/
  products/    (dto, entities, controller, service)
  movements/   (dto, entities, controller, service)
  inventory/     (controller, service)
  common/        (filters, health)
  database/      (data-source, migrations, seeds)
```

### Levantar entorno local (backend)

1. PostgreSQL: desde la raíz del repo, `docker compose up -d` (ver `docker-compose.yml`).
2. `cd backend`
3. `npm install`
4. Copiar `backend/.env.example` → `backend/.env`
5. `npm run migration:run`
6. `npm run seed:run`
7. `npm run start:dev`

### Scripts backend (montaje, calidad y pruebas)

| Script | Uso |
|--------|-----|
| `npm run build` | Compila Nest (`dist/`). |
| `npm run start` | Arranque estándar. |
| `npm run start:dev` | Desarrollo con recarga. |
| `npm run start:debug` | Desarrollo con inspector. |
| `npm run start:prod` | Ejecuta `node dist/main`. |
| `npm run lint` | ESLint (con `--fix` en la definición del script). |
| `npm run format` | Prettier sobre `src` y tests. |
| `npm run migration:run` | Aplica migraciones TypeORM. |
| `npm run migration:revert` | Revierte la última migración. |
| `npm run seed:run` | Seed idempotente. |
| `npm run test` | Unitarios e integración Jest (`*.spec.ts` en `src/` y `tests/`). |
| `npm run test:watch` | Jest en modo watch. |
| `npm run test:cov` | Jest con informe de cobertura. |
| `npm run test:debug` | Jest bajo inspector Node. |
| `npm run test:e2e` | Smoke API (p. ej. `GET /health`) vía Jest + Supertest. |
| `npm run test:pbt` | Property-based tests (fast-check), carpeta `tests/pbt`. |
| `npm run test:mutation` | Stryker mutation testing. |

### Reglas de negocio (recordatorio)

- Unidades: `unidades` \| `kg` \| `litros`.
- Movimientos: tipo `entrada` \| `salida`; razón `compra` \| `venta` \| `ajuste` \| `merma` \| `devolucion`.
- Una salida no supera el stock disponible.
- `DELETE /products/:id` desactiva, no borra físico.
- Alerta de stock mínimo: `stock_actual <= stock_minimo`.

### Endpoints canónicos

- `POST /products` · `GET /products` · `GET /products/:id` · `PATCH /products/:id` · `DELETE /products/:id`
- `POST /movements` · `GET /movements` · `GET /movements/:id`
- `GET /inventory` · `GET /inventory/:productId` · `GET /inventory/alerts/low-stock`

### Protocolo de preguntas (antes de cada historia)

1. Regla funcional y casos borde (aceptar / rechazar).
2. Contrato API: payload, respuesta y códigos HTTP.
3. Persistencia: constraints, índices y unicidad.
4. Concurrencia y transacciones si aplica.
5. Pruebas: feliz, negativos y bordes para DoD.

---

## Frontend

### Stack

- React + Vite + TypeScript estricto  
- TailwindCSS, Axios, TanStack Query  
- React Hook Form + Zod  
- Playwright (E2E)  

### Estructura frontend

```text
frontend/src/
  pages/         (ProductList, MovementForm)
  components/    (ProductCard, StockBadge)
  services/      (api)
  types/         (domain)

frontend/tests/
  e2e/           (specs Playwright)
  fixtures/      (datos de prueba)
  mocks/         (interceptación de red)
  utils/         (page objects, helpers)
```

### Levantar frontend local

1. `cd frontend`
2. `npm install`
3. Copiar `frontend/.env.example` → `frontend/.env` (ajustar `VITE_API_URL` al backend).
4. Primera vez con Playwright: `npx playwright install` (descarga navegadores).
5. `npm run dev`

### Scripts frontend (montaje, calidad y pruebas)

| Script | Uso |
|--------|-----|
| `npm run dev` | Vite en desarrollo (HMR). |
| `npm run build` | `tsc -b` + build de producción Vite. |
| `npm run preview` | Sirve el build localmente. |
| `npm run lint` | ESLint sobre el proyecto. |
| `npm run test:e2e` | Playwright (levanta `webServer` según `playwright.config.ts`). |
| `npm run test:e2e:ui` | Playwright con interfaz UI. |
| `npm run test:e2e:headed` | Playwright con navegador visible (`PW_HEADED=1` también controla headless en config). |

Variables útiles para E2E y Vite: ver `frontend/.env.example` (`VITE_API_URL`, `PLAYWRIGHT_BASE_URL`, etc.).

### Integración frontend ↔ backend

- Base URL API: `VITE_API_URL` (por defecto en ejemplo: `http://localhost:3000`).
- Consumo típico: `GET /products`, `GET /products/:id`, `GET /inventory/:productId`, `POST /movements`.
- Errores API: `code`, `message`, `details`, `path`, `timestamp`.

---

## Flujo sugerido “todo el stack”

1. `docker compose up -d` (raíz)  
2. Backend: migraciones, seed, `start:dev`.  
3. Frontend: `.env` con `VITE_API_URL` apuntando al backend, `npm run dev`.  
4. Calidad: `npm run test` / `test:pbt` en backend; `npm run lint` y `npm run test:e2e` en frontend.
