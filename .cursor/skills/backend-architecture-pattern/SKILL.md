---
name: backend-architecture-pattern
description: Define e implementa el patron de arquitectura backend para FinalBodWeb con NestJS, TypeORM y PostgreSQL. Use when creating or refactoring backend modules, controllers, services, DTOs, entities, business rules, and tests for products, movements, inventory, or common layers.
---

# Backend Architecture Pattern (FinalBodWeb)

## Objetivo

Aplicar una arquitectura modular y por capas en `backend/src` con responsabilidades claras:

- `controllers`: orquestacion HTTP sin logica de negocio
- `services`: logica de negocio, validaciones criticas, transacciones
- `dto`: validacion de entrada con `class-validator`
- `entities`: mapeo TypeORM sin reglas de negocio
- `common`: utilidades transversales (pipes/guards)

## Estructura obligatoria

Usar esta organizacion base:

```text
backend/src/
  products/   (dto, entities, controller, service)
  movements/  (dto, entities, controller, service)
  inventory/  (controller, service)
  common/     (pipes, guards)
```

No mover ni renombrar esta estructura sin consenso del equipo.

## Reglas de negocio criticas

1. **Movimientos validos**
   - `tipo`: `entrada | salida`
   - `razon`: `compra | venta | ajuste | merma | devolucion`
2. **No sobreventa**
   - Si es `salida`, `cantidad` nunca puede ser mayor al stock disponible.
3. **Productos**
   - `unidadMedida`: `unidades | kg | litros`
   - `DELETE /products/:id` realiza desactivacion logica (no borrado fisico si hay movimientos).
4. **Stock minimo**
   - Si `stock_actual <= stock_minimo`, debe aparecer en `GET /inventory/alerts/low-stock`.

## Endpoints canonicos

- `POST /products`
- `GET /products`
- `GET /products/:id`
- `PATCH /products/:id`
- `DELETE /products/:id` (desactivacion logica)
- `POST /movements`
- `GET /movements` (filtros: producto, tipo, fecha)
- `GET /movements/:id`
- `GET /inventory`
- `GET /inventory/:productId`
- `GET /inventory/alerts/low-stock`

## Flujo de implementacion

### 1) Crear contrato de entrada/salida

- Definir DTOs con `class-validator` para cada endpoint nuevo.
- Mantener mensajes de validacion claros para cliente.
- Evitar validaciones duplicadas entre DTO y service.

### 2) Implementar servicio con reglas de dominio

- Colocar en service toda validacion de negocio.
- Usar excepciones semanticas de NestJS:
  - `BadRequestException`
  - `NotFoundException`
  - `ConflictException`
- No usar `throw new Error(...)`.

### 3) Proteger escrituras criticas con transaccion

Para operaciones que afecten stock (`POST /movements`), usar `queryRunner`:

1. iniciar transaccion
2. calcular stock actual dentro de la misma transaccion
3. validar disponibilidad
4. guardar movimiento
5. commit/rollback/release correctamente

### 4) Mantener controller delgado

- Controller recibe request, delega y responde.
- No calcular stock ni aplicar reglas de negocio en controller.

### 5) Exponer consultas de inventario con aggregate

- Calcular stock con suma de entradas menos salidas.
- Reusar criterio de low-stock (`stock_actual <= stock_minimo`) en consultas y alertas.

## Checklist de calidad antes de cerrar tarea

- [ ] No hay `any` en TypeScript.
- [ ] DTOs tienen validaciones completas.
- [ ] Controllers no contienen logica de negocio.
- [ ] Services implementan reglas criticas y errores HTTP correctos.
- [ ] Movimientos de escritura critica usan transaccion.
- [ ] Endpoints respetan contrato canonico.
- [ ] Se agregaron/actualizaron tests unitarios (Jest).
- [ ] Se cubrieron propiedades clave con fast-check cuando aplica.
- [ ] Mutation testing (Stryker) no baja el nivel acordado por el equipo.

## Plantilla de trabajo (copiar y ejecutar)

```markdown
Contexto:
- Modulo: <products|movements|inventory|common>
- Endpoint: <metodo y ruta>
- Regla critica involucrada: <regla>

Implementa en NestJS + TypeORM cumpliendo:
1) DTOs con class-validator
2) Controller sin logica de negocio
3) Service con validaciones y errores semanticos
4) Transaccion con queryRunner si afecta stock
5) Tests unitarios y casos borde
```

## Criterios de rechazo (no merge)

- Logica de dominio en controller.
- Salidas que permiten stock negativo.
- Borrado fisico de productos con movimientos asociados.
- Falta de validacion de tipos/razones/unidad de medida.
- Cambios de estructura de carpetas sin consenso.
