---
description: Comandos Frontend — React + Vite + Playwright
globs: ["frontend/**"]
alwaysApply: false
---

# ⚡ Commands Frontend — Gestión de Inventario

## Desarrollo

| Comando | Descripción | Cuándo usarlo |
|---|---|---|
| `npm run dev` | Iniciar servidor de desarrollo Vite en `localhost:5173` | Al comenzar el día de trabajo |
| `npm run build` | Compilar TypeScript y empaquetar para producción | Antes de desplegar |
| `npm run preview` | Previsualizar el build de producción localmente | Para verificar el build antes de deploy |

## Calidad de código

| Comando | Descripción | Cuándo usarlo |
|---|---|---|
| `npm run lint` | Ejecutar ESLint sobre todos los archivos `.tsx` y `.ts` | Antes de hacer commit |
| `npm run lint:fix` | Corregir automáticamente errores de ESLint | Cuando hay errores de lint fácilmente corregibles |
| `npm run format` | Aplicar Prettier sobre todos los archivos del proyecto | Antes de hacer commit |
| `npm run type-check` | Verificar tipos TypeScript sin compilar (`tsc --noEmit`) | Antes de hacer commit o PR |

## Pruebas E2E con Playwright

| Comando | Descripción | Cuándo usarlo |
|---|---|---|
| `npm run test:e2e` | Ejecutar todas las pruebas E2E en modo headless | En CI o antes de merge |
| `npm run test:e2e:ui` | Abrir la UI de Playwright para debug visual | Al desarrollar o depurar pruebas E2E |
| `npm run test:e2e:headed` | Ejecutar E2E con navegador visible | Para ver el flujo en tiempo real |
| `npm run test:e2e:report` | Abrir el reporte HTML de Playwright | Tras ejecutar E2E para revisar resultados |
| `npx playwright install` | Instalar navegadores de Playwright | Solo al configurar el proyecto por primera vez |

## Scripts en `package.json` (configuración esperada)

```json
{
  "scripts": {
    "dev":              "vite",
    "build":            "tsc && vite build",
    "preview":          "vite preview",
    "lint":             "eslint src --ext .ts,.tsx",
    "lint:fix":         "eslint src --ext .ts,.tsx --fix",
    "format":           "prettier --write src",
    "type-check":       "tsc --noEmit",
    "test:e2e":         "playwright test",
    "test:e2e:ui":      "playwright test --ui",
    "test:e2e:headed":  "playwright test --headed",
    "test:e2e:report":  "playwright show-report"
  }
}
```

## Variables de entorno

```bash
# .env.local
VITE_API_URL=http://localhost:3000
```

## Flujo de trabajo diario recomendado

```bash
# 1. Iniciar desarrollo
npm run dev

# 2. Antes de cada commit
npm run type-check
npm run lint:fix
npm run format

# 3. Antes de merge o entrega
npm run build
npm run test:e2e
npm run test:e2e:report
```
