---
description: Comandos Testing — Jest + fast-check + Stryker + Playwright
globs: ["backend/**/*.spec.ts", "frontend/src/e2e/**/*.spec.ts", "stryker.config.*"]
alwaysApply: false
---

# ⚡ Commands Testing & QA — Gestión de Inventario

## Jest — Pruebas unitarias y PBT

| Comando | Descripción | Cuándo usarlo |
|---|---|---|
| `npm run test` | Ejecutar todas las pruebas unitarias | Antes de cada commit |
| `npm run test:watch` | Jest en modo watch | Al desarrollar o depurar pruebas |
| `npm run test:cov` | Pruebas + reporte de cobertura en `coverage/` | Para verificar cobertura >= 80% |
| `npm run test -- --verbose` | Output detallado prueba a prueba | Para identificar qué prueba falla |
| `npm run test -- --testPathPattern=movements` | Solo pruebas de un módulo | Al trabajar en un módulo específico |
| `npm run test -- --testNamePattern="P1"` | Solo pruebas cuyo nombre contiene "P1" | Para ejecutar una propiedad PBT específica |

## Stryker — Mutation Testing

| Comando | Descripción | Cuándo usarlo |
|---|---|---|
| `npx stryker run` | Ejecutar mutation testing completo | Al finalizar las pruebas unitarias (Día 9) |
| `npx stryker run --reporters html` | Generar solo reporte HTML | Para revisar visualmente los mutantes |
| `open reports/mutation/index.html` | Abrir el reporte HTML en el navegador | Tras ejecutar Stryker |

**Interpretación rápida del reporte Stryker:**
- 🟢 **Killed** — el mutante fue detectado por las pruebas. ✅
- 🔴 **Survived** — el mutante no fue detectado. Necesita una prueba más fuerte.
- ⚪ **No coverage** — ninguna prueba cubre esa línea. Verificar cobertura Jest.
- ⏭️ **Timeout** — la prueba tardó demasiado con el mutante. Posible bucle infinito.

## Playwright — Pruebas E2E (ejecutar desde `frontend/`)

| Comando | Descripción | Cuándo usarlo |
|---|---|---|
| `npm run test:e2e` | Ejecutar todos los flujos E2E en headless | Antes de entrega o merge |
| `npm run test:e2e:ui` | Abrir la UI de Playwright para debug | Al desarrollar pruebas E2E |
| `npm run test:e2e:headed` | E2E con navegador visible | Para ver el flujo en tiempo real |
| `npm run test:e2e:report` | Abrir reporte HTML de Playwright | Tras ejecutar E2E |
| `npx playwright test product-list` | Solo las pruebas de product-list.spec.ts | Al trabajar en esa pantalla |
| `npx playwright test --debug` | Modo debug paso a paso | Para depurar un flujo que falla |
| `npx playwright install` | Instalar navegadores | Solo al configurar el proyecto |

## Instalación de dependencias de testing

```bash
# Backend — fast-check y Stryker
cd backend
npm install --save-dev fast-check
npm install --save-dev @stryker-mutator/core @stryker-mutator/jest-runner

# Frontend — Playwright
cd frontend
npm install --save-dev @playwright/test
npx playwright install
```

## Flujo de trabajo de QA recomendado (Semana 2)

```bash
# Día 8 — Pruebas unitarias + PBT
cd backend
npm run test:watch           # Desarrollar pruebas en modo watch
npm run test:cov             # Verificar cobertura >= 80%

# Día 9 — Mutation Testing
cd backend
npm run test                 # Asegurar que todas las pruebas pasan primero
npx stryker run              # Ejecutar Stryker
open reports/mutation/index.html  # Revisar mutantes supervivientes
# → Analizar con el prompt de skills-testing.mdc SK6
# → Escribir pruebas adicionales
npx stryker run              # Ejecutar de nuevo y comparar el score

# Día 10 — E2E
cd frontend
npm run dev &                # Backend debe estar corriendo también
npm run test:e2e:ui          # Desarrollar pruebas E2E visualmente
npm run test:e2e             # Ejecutar en headless
npm run test:e2e:report      # Revisar reporte
```
