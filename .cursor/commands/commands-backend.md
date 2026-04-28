---
description: Comandos Backend — NestJS + TypeORM + PostgreSQL + Jest
globs: ["backend/**"]
alwaysApply: false
---

# ⚡ Commands Backend — Gestión de Inventario

## Desarrollo

| Comando | Descripción | Cuándo usarlo |
|---|---|---|
| `npm run start:dev` | Iniciar en modo watch con hot-reload | Al comenzar el día de trabajo |
| `npm run start` | Iniciar sin watch | Para probar sin recarga automática |
| `npm run build` | Compilar TypeScript a `dist/` | Antes de desplegar |
| `npm run start:prod` | Iniciar desde el build compilado | Para probar el build de producción |

## Calidad de código

| Comando | Descripción | Cuándo usarlo |
|---|---|---|
| `npm run lint` | Ejecutar ESLint sobre `src/` | Antes de hacer commit |
| `npm run lint:fix` | Corregir automáticamente errores de ESLint | Cuando hay errores fácilmente corregibles |
| `npm run format` | Aplicar Prettier sobre `src/` | Antes de hacer commit |

## Pruebas con Jest

| Comando | Descripción | Cuándo usarlo |
|---|---|---|
| `npm run test` | Ejecutar todas las pruebas unitarias | Antes de hacer commit |
| `npm run test:watch` | Jest en modo watch (re-ejecuta al guardar) | Al desarrollar pruebas |
| `npm run test:cov` | Ejecutar pruebas y generar reporte de cobertura | Para verificar cobertura >= 80% |
| `npm run test -- --testPathPattern=movements` | Ejecutar solo las pruebas de un módulo | Al trabajar en un módulo específico |
| `npm run test -- --verbose` | Output detallado de cada prueba | Para depurar fallos |

## Base de datos

| Comando | Descripción | Cuándo usarlo |
|---|---|---|
| `docker compose up -d` | Levantar PostgreSQL con Docker | Al iniciar el entorno por primera vez |
| `docker compose down` | Detener los contenedores | Al terminar el día |
| `docker compose down -v` | Detener y eliminar volúmenes (reset de BD) | Para limpiar datos de prueba |

## Scripts en `package.json` (configuración esperada)

```json
{
  "scripts": {
    "start":       "node dist/main",
    "start:dev":   "nest start --watch",
    "start:prod":  "node dist/main",
    "build":       "nest build",
    "lint":        "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "format":      "prettier --write \"src/**/*.ts\"",
    "test":        "jest",
    "test:watch":  "jest --watch",
    "test:cov":    "jest --coverage"
  }
}
```

## Variables de entorno

```bash
# .env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=inventario
NODE_ENV=development
PORT=3000
```

## Docker Compose recomendado

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: inventario
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

## Flujo de trabajo diario recomendado

```bash
# 1. Iniciar entorno
docker compose up -d
npm run start:dev

# 2. Antes de cada commit
npm run lint
npm run test

# 3. Antes de merge o entrega
npm run test:cov
npm run build
```
