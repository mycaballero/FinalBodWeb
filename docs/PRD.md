# PRD - Backend Inventario FinalBodWeb

## Objetivo
Construir desde cero un backend con NestJS + TypeORM + PostgreSQL que permita gestionar productos, movimientos e inventario con reglas de negocio estrictas, trazabilidad completa y calidad verificable con Jest, fast-check y Stryker.

## Alcance
- Gestion de productos con alta, consulta, actualizacion y desactivacion logica.
- Registro de movimientos de inventario (entrada y salida) con razon y fecha.
- Consulta de stock actual por producto y consolidado.
- Alertas de stock minimo mediante endpoint dedicado.
- Historial completo de movimientos con filtros por producto, tipo y rango de fechas.
- Definicion de arquitectura backend por modulos/capas.
- Creacion de base de datos con constraints, indices, migraciones y seed minima.

## No Objetivos
- Desarrollo de frontend.
- Integraciones con ERP o sistemas externos.
- Modulo de autenticacion y autorizacion avanzada.
- Soporte multi-almacen y reservas de stock.

## Supuestos
- Zona horaria unica de operacion.
- PostgreSQL disponible en local y CI.
- TypeScript estricto en todo el backend.
- IDs UUID para entidades principales.
- `DELETE /products/:id` realiza desactivacion logica, no borrado fisico.

## Reglas de Negocio Criticas
- Unidades de medida validas: `unidades`, `kg`, `litros`.
- Tipos de movimiento validos: `entrada`, `salida`.
- Razones validas: `compra`, `venta`, `ajuste`, `merma`, `devolucion`.
- Una salida no puede superar el stock disponible.
- Si un producto tiene movimientos asociados, no puede eliminarse fisicamente.
- Producto en alerta cuando `stock_actual <= stock_minimo`.

## Endpoints Canónicos
- `POST /products`
- `GET /products`
- `GET /products/:id`
- `PATCH /products/:id`
- `DELETE /products/:id` (desactivacion logica)
- `POST /movements`
- `GET /movements`
- `GET /movements/:id`
- `GET /inventory`
- `GET /inventory/:productId`
- `GET /inventory/alerts/low-stock`

## Arquitectura Objetivo
- Modulos: `products`, `movements`, `inventory`, `common`.
- Controllers: solo orquestacion HTTP.
- Services: logica de negocio.
- DTOs con `class-validator` para toda entrada.
- Manejo estandar de errores: `400`, `404`, `409`, `422`, `500`.
- Persistencia con TypeORM sobre PostgreSQL.

## Epicas
- `EPIC-DB`: base de datos (modelo, migraciones, indices, seed).
- `EPIC-ARCH`: arquitectura y estandares transversales.
- `EPIC-PROD`: gestion de productos.
- `EPIC-MOV`: movimientos de inventario.
- `EPIC-INV`: consulta de stock y alertas.
- `EPIC-HIST`: historial y filtros.
- `EPIC-QA`: pruebas unitarias, property-based y mutation testing.

## Fases de Implementacion
### Fase 1 - Fundaciones (MVP Tecnico)
- Modelo de datos, migraciones, indices, seed.
- Estructura modular del backend.

### Fase 2 - Dominio Core (MVP Funcional)
- Productos (`POST`, `GET`, `PATCH`, `DELETE` logico).
- Movimientos (`POST`) con regla de stock insuficiente.

### Fase 3 - Visibilidad Operativa
- Inventario consolidado y por producto.
- Alertas de stock minimo.
- Historial de movimientos con filtros.

### Fase 4 - Hardening de Calidad
- Contrato de errores uniforme.
- Cobertura de pruebas multicapa y mutation score objetivo.

## Criterios de Exito
- Endpoints canonicos funcionando segun contrato.
- Regla de no-sobreventa garantizada.
- Borrado fisico de productos con movimientos bloqueado.
- Alertas de stock minimo correctas.
- Suite de pruebas activa en CI con Jest + fast-check + Stryker.
