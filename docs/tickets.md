# Tickets Tecnicos - Backend Inventario

## DB-001 (INV-001) - Modelo relacional base
- **Descripcion:** crear tablas `products` y `movements` con PK UUID, FK, enums y campos obligatorios.
- **Definition of Done:** migracion aplica y revierte; constraints activos; integridad referencial validada.
- **Estimacion:** M
- **Riesgos/Notas:** definir unicidad de producto para evitar conflictos ambiguos.

## DB-002 (INV-002) - Migraciones e indices
- **Descripcion:** implementar versionado de schema e indices para consultas por producto, tipo y fecha.
- **Definition of Done:** `migrations:run` y `migrations:revert` funcional en local/CI; indices presentes.
- **Estimacion:** S
- **Riesgos/Notas:** sobreindexacion puede impactar escrituras.

## DB-003 (INV-003) - Seed minima idempotente
- **Descripcion:** crear script de seeds con productos iniciales y movimientos de entrada.
- **Definition of Done:** ejecucion repetida sin duplicados criticos; documentacion de uso agregada.
- **Estimacion:** S
- **Riesgos/Notas:** evitar dependencia de IDs hardcodeados.

## BE-001 (INV-004) - Arquitectura modular NestJS
- **Descripcion:** crear modulos `products`, `movements`, `inventory`, `common`; wiring y convenciones.
- **Definition of Done:** app levanta; rutas base disponibles; controllers sin logica de negocio.
- **Estimacion:** M
- **Riesgos/Notas:** deuda tecnica temprana si no se estandariza manejo de errores.

## BE-002 (INV-005) - Alta de productos
- **Descripcion:** implementar `POST /products` con DTOs, validaciones y control de duplicados.
- **Definition of Done:** respuestas 201, 400 y 409 cubiertas por tests.
- **Estimacion:** M
- **Riesgos/Notas:** alinear regla de unicidad entre DB y servicio.

## BE-003 (INV-006) - Consulta de productos
- **Descripcion:** implementar `GET /products` y `GET /products/:id`.
- **Definition of Done:** listado y detalle operativos; 404 para inexistente.
- **Estimacion:** S
- **Riesgos/Notas:** acordar si se incluyen inactivos por defecto.

## BE-004 (INV-007) - Actualizacion y desactivacion logica
- **Descripcion:** implementar `PATCH /products/:id` y `DELETE /products/:id` sin borrado fisico.
- **Definition of Done:** solo desactivacion logica; historial preservado; 404 cubierto.
- **Estimacion:** M
- **Riesgos/Notas:** validar politica para movimientos sobre productos inactivos.

## BE-005 (INV-008) - Registro de entradas
- **Descripcion:** implementar `POST /movements` para tipo `entrada` con validaciones de dominio.
- **Definition of Done:** altas validas y errores 400 cubiertos; stock reflejado en inventario.
- **Estimacion:** M
- **Riesgos/Notas:** definir normalizacion de fechas.

## BE-006 (INV-009) - Registro de salidas con guardia de stock
- **Descripcion:** implementar validacion transaccional para impedir salida mayor al stock disponible.
- **Definition of Done:** respuestas 201/404/422; no persiste salidas invalidas.
- **Estimacion:** L
- **Riesgos/Notas:** riesgo de condiciones de carrera; evaluar locking/transaction.

## BE-007 (INV-010) - Endpoints de inventario
- **Descripcion:** implementar `GET /inventory` y `GET /inventory/:productId` con calculo oficial.
- **Definition of Done:** formula validada por test; 404 por producto inexistente.
- **Estimacion:** M
- **Riesgos/Notas:** rendimiento de agregaciones al crecer volumen.

## BE-008 (INV-011) - Endpoint low-stock
- **Descripcion:** implementar `GET /inventory/alerts/low-stock`.
- **Definition of Done:** filtra exactamente `stock_actual <= stock_minimo`; borde de igualdad cubierto.
- **Estimacion:** S
- **Riesgos/Notas:** reutilizar fuente unica de calculo de stock para evitar divergencias.

## BE-009 (INV-012) - Historial y filtros de movimientos
- **Descripcion:** implementar `GET /movements` con filtros y `GET /movements/:id`.
- **Definition of Done:** filtros combinables por producto/tipo/fechas; 400 en rango invalido; 404 en id inexistente.
- **Estimacion:** M
- **Riesgos/Notas:** revisar plan de indices para consultas compuestas.

## BE-010 (INV-013) - Manejo estandar de errores
- **Descripcion:** crear excepciones de dominio + filtro global para contrato uniforme de errores.
- **Definition of Done:** estructura consistente en 400/404/409/422/500.
- **Estimacion:** S
- **Riesgos/Notas:** mapear correctamente errores de infraestructura a codigos HTTP.

## QA-001 (INV-014) - Estrategia de pruebas y calidad
- **Descripcion:** implementar suite con Jest (unitarias), fast-check (PBT) y Stryker (mutation).
- **Definition of Done:** pipeline CI ejecuta pruebas; umbral mutation definido y medible.
- **Estimacion:** L
- **Riesgos/Notas:** costo de Stryker; considerar corrida nocturna si el tiempo de CI crece.

## FE-001 (INV-015) - Pantalla Lista de Productos
- **Descripcion:** implementar `ProductList` con layout consistente (tabla/cards), render de `name`, `category`, `unit`, `currentStock` e indicador low-stock.
- **Definition of Done:** consume `GET /products`; soporta estados `loading` con skeleton, `error` con retry y `empty` con mensaje "No hay productos disponibles"; cada item es clickeable y navega a registro con `productId`.
- **Estimacion:** M
- **Riesgos/Notas:** alinear nombres de campos (`currentStock`, `minStock`) segun contrato real para evitar transformaciones ad-hoc.

## FE-002 (INV-015) - Componentes reutilizables de feedback visual
- **Descripcion:** crear componentes reutilizables de UI para celda/lista de producto e indicador de stock minimo con estados visuales consistentes.
- **Definition of Done:** componente de indicador aplica condicion `stock_actual <= stock_minimo`; estados visuales de input/feedback siguen guideline de 8px grid y jerarquia tipografica.
- **Estimacion:** S
- **Riesgos/Notas:** evitar duplicacion de estilos entre lista y formulario; centralizar tokens/base styles.

## FE-003 (INV-016) - Formulario Registro de Movimiento
- **Descripcion:** implementar `MovementForm` con campos `productId`, `type`, `quantity`, `reason`, inicializacion por `productId` de navegacion y validaciones en tiempo real.
- **Definition of Done:** valida requeridos, `quantity` entera `> 0`, `type` en `entrada|salida`, `reason` en valores permitidos; para `salida` muestra "Stock disponible: X", bloquea submit si `quantity > stock`; en success muestra feedback y redirige a lista.
- **Estimacion:** L
- **Riesgos/Notas:** desacople entre validacion de frontend y backend puede generar falsos positivos/negativos si no se versiona el contrato.

## FE-004 (INV-016) - Servicios API y manejo robusto de errores
- **Descripcion:** implementar/ajustar `services/api.ts` para `GET /products` y `POST /movements`, con normalizacion de errores de red, validacion y negocio.
- **Definition of Done:** errores de backend se mapean por campo cuando exista metadata; fallback a error general cuando no haya detalle; el formulario conserva estado tras error y permite reintento sin perder datos.
- **Estimacion:** M
- **Riesgos/Notas:** contratos de error inconsistentes entre endpoints pueden requerir adaptador comun.

## FE-005 (INV-015, INV-016) - Pruebas E2E de pantallas frontend
- **Descripcion:** crear escenarios Playwright para lista de productos y registro de movimientos cubriendo flujo feliz, errores y bordes criticos.
- **Definition of Done:** se prueban estados `loading/error/empty` en lista, navegacion con `productId`, validacion de salida con stock insuficiente, submit exitoso con redireccion y manejo de error de red sin perdida de datos.
- **Estimacion:** M
- **Riesgos/Notas:** fixtures/mocks de red deben ser deterministas para evitar flakes en CI.

---

## Orden sugerido de ejecucion
1. DB-001, DB-002, DB-003, BE-001  
2. BE-002, BE-003, BE-005, BE-006  
3. BE-004, BE-007, BE-008, BE-009  
4. BE-010, FE-001, FE-002, FE-003, FE-004  
5. FE-005, QA-001

## Matriz de trazabilidad resumida
- INV-005 -> `POST /products` -> `products` -> unit/integration + negativos 400/409
- INV-007 -> `PATCH/DELETE /products/:id` -> `products`, `movements` -> no borrado fisico
- INV-009 -> `POST /movements` (salida) -> `movements` -> 422 + PBT stock no negativo
- INV-010 -> `GET /inventory*` -> `movements`, `products` -> formula de stock
- INV-011 -> `GET /inventory/alerts/low-stock` -> `products`, `movements` -> borde `<=`
- INV-012 -> `GET /movements*` -> `movements` -> filtros + rango invalido
- INV-015 -> `GET /products` -> `frontend/pages/ProductList`, `frontend/components/StockBadge` -> loading/error/empty + low-stock + navegacion con `productId`
- INV-016 -> `POST /movements` -> `frontend/pages/MovementForm`, `frontend/services/api` -> validaciones realtime + bloqueo por stock + feedback y redireccion
