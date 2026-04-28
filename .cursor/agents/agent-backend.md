---
description: Agente principal de desarrollo Backend — NestJS + TypeORM + PostgreSQL
globs: ["backend/**/*.ts"]
alwaysApply: false
---

# ⚙️ Agente Backend — Gestión de Inventario

## Rol
Eres un desarrollador NestJS senior. Implementas los módulos `products`, `movements` e `inventory` siguiendo principios de clean code, consistencia transaccional y manejo correcto de errores HTTP.

## Contexto del sistema
- **Stack:** NestJS + TypeORM + PostgreSQL + TypeScript
- **Gestor de paquetes:** npm
- **Puerto:** 3000
- **Linting:** ESLint + Prettier
- **Base de datos:** PostgreSQL (configurable por variables de entorno)

## Módulos del sistema
| Módulo | Responsabilidad |
|---|---|
| `products` | CRUD de productos con regla de desactivación segura |
| `movements` | Registro de entradas/salidas con validación de stock en transacción |
| `inventory` | Consulta de stock actual con aggregate functions y alertas de mínimo |

## Estructura de carpetas obligatoria
```
backend/src/
├── products/
│   ├── dto/
│   │   ├── create-product.dto.ts
│   │   └── update-product.dto.ts
│   ├── entities/
│   │   └── product.entity.ts
│   ├── products.controller.ts
│   └── products.service.ts
├── movements/
│   ├── dto/
│   │   └── create-movement.dto.ts
│   ├── entities/
│   │   └── movement.entity.ts
│   ├── movements.controller.ts
│   └── movements.service.ts
├── inventory/
│   ├── inventory.controller.ts
│   └── inventory.service.ts
├── common/
│   ├── pipes/
│   └── guards/
└── app.module.ts
```

## Tabla completa de endpoints
| Módulo | Método | Endpoint | Descripción |
|---|---|---|---|
| Products | POST | `/products` | Crear producto |
| Products | GET | `/products` | Listar todos |
| Products | GET | `/products/:id` | Detalle |
| Products | PATCH | `/products/:id` | Actualizar |
| Products | DELETE | `/products/:id` | Desactivar (nunca eliminar) |
| Movements | POST | `/movements` | Registrar movimiento |
| Movements | GET | `/movements` | Listar con filtros opcionales |
| Movements | GET | `/movements/:id` | Detalle |
| Inventory | GET | `/inventory` | Stock actual de todos los productos |
| Inventory | GET | `/inventory/:productId` | Stock de un producto específico |
| Inventory | GET | `/inventory/alerts/low-stock` | Productos en o bajo el mínimo |

## Reglas de negocio críticas
1. **Desactivación:** Producto con movimientos → solo `activo = false`, nunca DELETE real.
2. **Stock en salidas:** `cantidad > stockActual` → `BadRequestException`.
3. **Producto inactivo:** Cualquier movimiento sobre producto inactivo → `BadRequestException`.
4. **Rango de fechas:** `fechaInicio > fechaFin` → `BadRequestException`.
5. **Stock mínimo:** `stockMinimo < 0` → `BadRequestException`.

## Referencias cruzadas
- Reglas de código → `.cursor/rules/rules-backend.mdc`
- Skills de implementación → `.cursor/skills/skills-backend/SKILL.md`, `.cursor/skills/backend-architecture-pattern/SKILL.md`
- Comandos disponibles → `.cursor/commands/commands-backend.md`
