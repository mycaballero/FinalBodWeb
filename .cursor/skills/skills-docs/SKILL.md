---
description: Skills y prompts de Documentación — PRD, Gherkin, Tickets, revisiones técnicas
globs: ["docs/**/*", "**/*.md"]
alwaysApply: false
---

# 🛠️ Skills Documentación — Gestión de Inventario

## SK1 — Generar PRD con IA (Día 1)

**Prompt base — copiar y completar:**
```
Actúa como un product manager senior.

CONTEXTO DEL NEGOCIO:
[PEGAR: descripción del sistema, usuarios, problema que resuelve]

Genera un PRD completo con estas secciones:
1. Objetivo del sistema
2. Alcance (qué incluye y qué está fuera)
3. Funcionalidades principales con reglas de negocio detalladas
4. Restricciones técnicas (NestJS, TypeORM, PostgreSQL, React, Vite)
5. Criterios de aceptación verificables por funcionalidad
6. Descripción de las pantallas: Lista de Productos y Formulario de Movimiento

ITERACIÓN: Genera primero un borrador. Luego identifica al menos 3 casos borde
no cubiertos y produce una versión refinada con criterios más precisos.
```

**Funcionalidades mínimas que debe cubrir el PRD:**
- Gestión de productos (CRUD + desactivación segura)
- Movimientos de inventario (entrada/salida con validación de stock)
- Consulta de stock actual (aggregate functions en tiempo real)
- Alertas de stock mínimo
- Historial con filtros (producto, tipo, rango de fechas)
- Pantalla: Lista de productos con StockBadge
- Pantalla: Formulario de registro de movimiento

---

## SK2 — Generar User Stories en Gherkin (Día 1)

**Prompt base — copiar y completar:**
```
Dado este PRD [PEGAR PRD]:

Genera 8 user stories en formato Gherkin:
- 6 de backend: productos, movimientos, inventario, alertas, filtros, validaciones
- 2 de frontend: lista de productos, formulario de movimiento

Para cada historia:
- Actor explícito (admin, usuario, sistema)
- Mínimo 2 escenarios: caso feliz + caso de error
- Lenguaje de dominio, sin mencionar clases o endpoints
- ID en formato US-01 a US-08
```

**Ejemplo de output esperado:**
```gherkin
Feature: Registrar salida de stock

  Scenario: Salida válida con stock suficiente
    Given un producto "Arroz" con stock actual de 20 kg
    When el admin registra una salida de 15 kg con razón "venta"
    Then el sistema registra el movimiento exitosamente
    And el stock del producto queda en 5 kg

  Scenario: Salida que supera el stock disponible
    Given un producto "Arroz" con stock actual de 5 kg
    When el admin intenta registrar una salida de 10 kg
    Then el sistema rechaza la operación
    And muestra el mensaje "La cantidad de salida supera el stock disponible"
```

---

## SK3 — Crear tickets a partir de User Stories (Día 1)

**Prompt base:**
```
Dado este conjunto de user stories [PEGAR STORIES]:

Genera un ticket por cada historia con este formato exacto:
- ID: BE-### o FE-###
- Título en imperativo
- User Story de referencia
- Descripción (2-4 oraciones de contexto)
- Criterios de aceptación verificables y binarios (checkbox)
- Notas técnicas (endpoints, entidades, reglas de negocio)
- Estimación: S / M / L / XL
```

**Tickets backend esperados:**

| ID | Título | Estimación |
|---|---|---|
| BE-001 | Implementar CRUD de productos con validaciones | M |
| BE-002 | Implementar desactivación segura de productos con movimientos | S |
| BE-003 | Registrar movimiento de entrada con validación de datos | M |
| BE-004 | Validar stock disponible al registrar salida | M |
| BE-005 | Calcular stock actual con aggregate functions | M |
| BE-006 | Retornar productos en alerta de stock mínimo | S |

**Tickets frontend esperados:**

| ID | Título | Estimación |
|---|---|---|
| FE-001 | Implementar pantalla de lista de productos con StockBadge | M |
| FE-002 | Implementar formulario de movimiento con validaciones en tiempo real | L |

---

## SK4 — Documentar el modelo de datos (Día 2)

**Contenido esperado en `docs/data-model.md`:**

```markdown
## Entidad: Product

| Campo | Tipo DB | Tipo TS | Restricción | Descripción |
|---|---|---|---|---|
| id | serial | number | PK | Identificador único |
| nombre | varchar(100) | string | NOT NULL | Nombre del producto |
| descripcion | text | string | NULLABLE | Descripción opcional |
| unidad_medida | enum | 'unidades'\|'kg'\|'litros' | NOT NULL | Unidad de medida |
| categoria | varchar(50) | string | NOT NULL | Categoría del producto |
| stock_minimo | int | number | NOT NULL, >= 0 | Mínimo de stock permitido |
| activo | boolean | boolean | NOT NULL, default true | Estado del producto |

## Entidad: Movement

| Campo | Tipo DB | Tipo TS | Restricción | Descripción |
|---|---|---|---|---|
| id | serial | number | PK | Identificador único |
| tipo | enum | 'entrada'\|'salida' | NOT NULL | Tipo de movimiento |
| cantidad | int | number | NOT NULL, >= 1 | Cantidad del movimiento |
| razon | enum | string | NOT NULL | Razón del movimiento |
| fecha | timestamp | Date | NOT NULL, default NOW | Fecha del movimiento |
| producto_id | int | number | FK → Product | Producto afectado |

## Relaciones
- Movement N:1 Product (un movimiento pertenece a un producto)
- Un producto puede tener N movimientos

## Índices
| Tabla | Columna | Justificación |
|---|---|---|
| movements | producto_id | Filtros frecuentes por producto |
| movements | tipo | Filtros por tipo en historial |
| movements | fecha | Filtros por rango de fechas |
```

---

## SK5 — Revisión técnica de código con IA (Día 7)

**Prompt base:**
```
Actúa como un senior developer revisando este código:
[PEGAR SERVICIO O COMPONENTE COMPLETO]

Analiza en exactamente estas 3 categorías:

1. MANTENIBILIDAD
   - Nomenclatura y consistencia
   - Separación de responsabilidades
   - Duplicación de código

2. CORRECTITUD
   - Lógica incorrecta o casos borde no manejados
   - Errores que se tragan silenciosamente
   - Condiciones de carrera o problemas de concurrencia

3. RENDIMIENTO
   - Queries N+1 o ineficientes
   - Renders o llamadas HTTP redundantes
   - Cálculos repetidos que podrían cachearse

Para CADA hallazgo:
- Describe el problema específico
- Explica el impacto en el sistema
- Muestra el código corregido
```

**Plantilla `docs/revision-log.md`:**
```markdown
## Revisión — YYYY-MM-DD — [Área: ProductsService / MovementForm / etc.]

### Hallazgos
#### Mantenibilidad
1. **[Descripción]** — Impacto: [X]. Corrección: ver commit [hash].

#### Correctitud
1. **[Descripción]** — Impacto: [X]. Corrección: ver commit [hash].

#### Rendimiento
1. **[Descripción]** — Impacto: [X]. Corrección: ver commit [hash].

### Cambios aplicados
- [Lista de archivos modificados y qué cambió]

### Aprendizajes
- [Qué aprendí del proceso de revisión con IA]
```

---

## SK6 — Revisión 360 final del proyecto (Día 10)

**Prompt base:**
```
Dado este PRD inicial [PEGAR PRD] y este código final [PEGAR CÓDIGO]:

1. ¿Qué criterios de aceptación del PRD no se cumplieron completamente?
   Lista cada uno con evidencia en el código.

2. ¿Qué deuda técnica quedó pendiente?
   Separa por: backend, frontend, testing y documentación.

3. ¿Qué mejorarías si tuvieras más tiempo?
   Prioriza por impacto en el usuario y en la mantenibilidad del código.

4. ¿Qué aprendiste del proceso de desarrollo con IA en este proyecto?
   Menciona al menos 3 aprendizajes concretos.
```
