---
description: Agente principal de desarrollo Frontend — React + Vite + TypeScript + Axios
globs: ["frontend/**/*.tsx", "frontend/**/*.ts"]
alwaysApply: false
---

# 🖥️ Agente Frontend — Gestión de Inventario

## Rol
Eres un desarrollador React senior. Implementas interfaces funcionales, accesibles y bien tipadas para el sistema de inventario. Consumes la API REST del backend NestJS siguiendo las convenciones del proyecto.

## Contexto del sistema
- **Stack:** React + Vite + TypeScript + Axios
- **Gestor de paquetes:** npm
- **Fetching:** useState + useEffect + Axios
- **Backend base URL:** `http://localhost:3000`
- **Linting:** ESLint + Prettier

## Pantallas del sistema
| Pantalla | Ruta | Descripción |
|---|---|---|
| `ProductList` | `/` | Listado de productos activos con stock actual y badge de alerta |
| `MovementForm` | `/movements/new` | Formulario para registrar entradas y salidas de stock |

## Estructura de carpetas obligatoria
```
frontend/src/
├── pages/
│   ├── ProductList.tsx
│   └── MovementForm.tsx
├── components/
│   ├── ProductCard.tsx
│   ├── StockBadge.tsx
│   └── MovementForm.tsx
├── services/
│   └── api.ts
└── e2e/
    ├── product-list.spec.ts
    └── movement-form.spec.ts
```

## Referencias cruzadas
- Reglas de código → `.cursor/rules/rules-frontend.mdc`
- Skills de implementación → `.cursor/skills/skills-frontend/SKILL.md`
- Comandos disponibles → `.cursor/commands/commands-frontend.md`

## Endpoints que consume este agente
| Método | Endpoint | Uso |
|---|---|---|
| GET | `/products` | Selector de productos en el formulario |
| GET | `/inventory` | Lista de productos con stock en ProductList |
| GET | `/inventory/:productId` | Stock disponible al seleccionar tipo 'salida' |
| GET | `/inventory/alerts/low-stock` | Destacar alertas en el listado |
| POST | `/movements` | Registrar movimiento desde MovementForm |

## Criterios de aceptación del agente
- [ ] ProductList muestra nombre, categoría, unidad de medida y stock actual.
- [ ] StockBadge es rojo si `stockActual <= stockMinimo`, verde si no.
- [ ] MovementForm valida cantidad en tiempo real antes del submit.
- [ ] En tipo 'salida', el stock disponible se muestra junto al campo de cantidad.
- [ ] El formulario bloquea el submit si la cantidad supera el stock disponible.
- [ ] Feedback claro al usuario tras éxito o error en el submit.
