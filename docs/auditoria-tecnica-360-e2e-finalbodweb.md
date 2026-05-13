# Auditoría técnica 360 — FinalBodWeb (E2E Playwright + cruce PRD/código)

**Fecha de referencia:** 2026-05-13  
**Alcance:** frontend React existente, suite Playwright en `frontend/tests/`, contrato API documentado en PRD/tickets, historias backend en `docs/user-stories.md`.

---

## 1. Resumen ejecutivo

El PRD declara explícitamente el **desarrollo de frontend como no objetivo** (`docs/PRD.md`, sección No Objetivos). Aun así, el repositorio incluye una aplicación React que consume los endpoints canónicos y una **suite E2E con mocks de red** que cubre flujos críticos de listado, badge de stock bajo, navegación al formulario de movimiento y validaciones del formulario (entrada/salida, bloqueo por stock, errores de inventario, estados de carga).

La auditoría concluye que el **backend documentado y las user stories** siguen siendo la fuente de verdad del dominio; el frontend **amplía el alcance documentado** de forma razonable y los E2E reducen regresiones en UX y contrato, con la limitación inherente de **no sustituir** contratos verificados contra un API real en cada push.

---

## 2. Criterios de aceptación (cruce PRD / historias / implementación)

| Área | Documentación | Estado respecto al código actual |
|------|----------------|-----------------------------------|
| Frontend en alcance PRD | No objetivo | **Parcial / extendido:** existe UI sin actualizar formalmente el PRD. |
| Endpoints canónicos | PRD lista rutas REST | **Cumplido en intención:** la app y los E2E asumen esas rutas; validación real depende de contrato backend + tipos. |
| Stock mínimo y alertas | Regla `stock_actual <= stock_minimo` | **Cumplido en UI probada:** listado + `StockBadge` con escenario E2E; endpoint dedicado de alertas no cubierto en E2E de esta iteración. |
| Movimientos entrada/salida, razones | Enums en PRD | **Cumplido en formulario + tests:** flujos felices y bloqueo de salida ilegal en cliente; POST mockeado valida cuerpo en casos de éxito. |
| DELETE producto lógico | Solo desactivación | **No evaluado en profundidad en esta auditoría E2E** (flujo `window.confirm` opcional según plan). |
| Calidad backend (Jest, PBT, Stryker) | PRD / EPIC-QA | **Fuera del diff E2E:** se asume backlog según tickets; no se ejecutó backend en esta revisión. |

**User stories y tickets:** `docs/user-stories.md` y `docs/tickets.md` describen trabajo mayoritariamente **backend**. La suite Playwright añade cobertura a nivel **producto entregable** (UI + contrato asumido), alineada con INV-005 a INV-010 en comportamiento esperado del usuario final, no con la totalidad de criterios Gherkin de migraciones o seeds.

---

## 3. Calidad E2E

**Fortalezas**

- Estructura separada (`frontend/tests/e2e`, `fixtures`, `mocks`, `utils`) y configuración endurecida (retries en CI, trace/screenshot en fallo, reporters).
- Selectores estables (`data-testid` en tarjeta y badge, roles donde aplica).
- Mocks centralizados con matching por pathname/origen configurable (`E2E_API_ORIGIN`), reduciendo fragilidad por `localhost` vs `127.0.0.1`.
- Corrección de producto detectada por pruebas: sincronía `productId` en URL con React Hook Form tras carga de productos; inventario sin reintentos largos en error controlado.

**Riesgos**

| Severidad | Problema | Recomendación |
|-----------|----------|----------------|
| Media | Los E2E no ejecutan Nest ni PostgreSQL; el mock puede desviarse del JSON real. | Mantener fixtures alineadas con respuestas de tests de integración backend o generar ejemplos desde OpenAPI si se añade. |
| Baja | Paralelismo y timings pueden enmascarar condiciones de carrera reales. | Job opcional en CI: E2E contra API real con base sembrada (más lento, mayor confianza). |

---

## 4. Deuda y mejoras (formato Severidad / Problema / Recomendación)

### Backend

| Severidad | Problema | Recomendación |
|-----------|----------|----------------|
| Baja | PRD no refleja el frontend existente. | Añadir anexo “Cliente web” o derivar PRD de producto unificado. |

### Frontend

| Severidad | Problema | Recomendación |
|-----------|----------|----------------|
| Media | Documentación de pantallas no está en el PRD original. | Documentar rutas, estados vacíos/error y mapa de datos en `docs/` o wiki del equipo. |
| Baja | Cobertura E2E no incluye desactivación de producto ni listado de alertas low-stock vía API. | Añadir specs cuando la UI exponga esos flujos de forma estable. |

### Testing

| Severidad | Problema | Recomendación |
|-----------|----------|----------------|
| Media | Solo Chromium en proyecto Playwright. | Valorar Firefox/WebKit en CI si el público lo requiere. |
| Baja | Sin pipeline descrito en este documento. | Integrar `npm run test:e2e` en CI con artefactos HTML/trace. |

### Seguridad

| Severidad | Problema | Recomendación |
|-----------|----------|----------------|
| Media | Sin autenticación en PRD; la UI asume API abierta en red local. | Antes de exponer a internet, añadir auth, CORS explícito y HTTPS. |

### Escalabilidad / operación

| Severidad | Problema | Recomendación |
|-----------|----------|----------------|
| Baja | Mocks fijos de latencia cero. | Pruebas de red lenta opcionales para UX de timeouts. |

### DX (experiencia de desarrollo)

| Severidad | Problema | Recomendación |
|-----------|----------|----------------|
| Baja | Variables Vite/Playwright repartidas. | Ya existe `.env.example`; mantener sincronizado con `playwright.config.ts`. |

---

## 5. Riesgos globales del proyecto

1. **Deriva documentación–código** por frontend fuera del PRD formal.
2. **Confianza en mocks** frente a cambios de serialización en Nest (nombres de campos, códigos HTTP).
3. **Regresiones de negocio** en salidas concurrentes: el cliente valida UX; el servidor debe seguir siendo la autoridad (ya contemplado en tickets BE-006).

---

## 6. Mejoras priorizadas (corto plazo)

1. Job CI `test:e2e` con variables fijas y publicación de `playwright-report`.
2. E2E opcional “contra API real” en rama nocturna o manual.
3. Ampliar specs a `/inventory/alerts/low-stock` cuando la navegación de usuario lo priorice.

---

## 7. Aprendizajes

- Los E2E forzaron **comportamiento correcto** en navegación SPA (`?productId=`) con formularios controlados y datos asíncronos.
- Unificar **origen del API** entre Vite (`VITE_API_URL`) e interceptores evita fallos silenciosos por host distinto.
- Añadir **atributos de accesibilidad mínimos** en componentes pequeños (`StockBadge`) mejora tanto a11y como estabilidad de pruebas.

---

## 8. Verificación ejecutada (referencia)

- `npx playwright test` en `frontend/`: **14 pruebas pasando** (Chromium).
- `npx eslint tests playwright.config.ts` sin advertencias en el ámbito configurado.
