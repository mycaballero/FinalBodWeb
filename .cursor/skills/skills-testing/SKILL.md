---
description: Skills de Testing — Jest + fast-check + Stryker + Playwright
globs: ["backend/**/*.spec.ts", "frontend/src/e2e/**/*.spec.ts", "stryker.config.*"]
alwaysApply: false
---

# 🛠️ Skills Testing & QA — Gestión de Inventario

## SK1 — Setup de prueba unitaria con mocks de TypeORM

```typescript
// movements.service.spec.ts — setup completo
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MovementsService } from './movements.service';
import { Movement } from './entities/movement.entity';
import { Product } from '../products/entities/product.entity';

describe('MovementsService', () => {
  let service: MovementsService;

  const mockMovementRepo = { count: jest.fn(), findOne: jest.fn() };
  const mockProductRepo  = { findOne: jest.fn() };

  const mockQueryRunner = {
    connect:             jest.fn(),
    startTransaction:    jest.fn(),
    commitTransaction:   jest.fn(),
    rollbackTransaction: jest.fn(),
    release:             jest.fn(),
    manager: {
      findOne:            jest.fn(),
      create:             jest.fn(),
      save:               jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        select:    jest.fn().mockReturnThis(),
        where:     jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ stock: '20' }),
      }),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovementsService,
        { provide: getRepositoryToken(Movement), useValue: mockMovementRepo },
        { provide: getRepositoryToken(Product),  useValue: mockProductRepo  },
        { provide: DataSource,                   useValue: mockDataSource   },
      ],
    }).compile();
    service = module.get<MovementsService>(MovementsService);
  });
```

## SK2 — Las 10 pruebas unitarias críticas

```typescript
  // U1 — Entrada válida se registra correctamente
  it('debe registrar una entrada correctamente', async () => {
    mockQueryRunner.manager.findOne.mockResolvedValue({ id: 1, activo: true });
    mockQueryRunner.manager.getRawOne = jest.fn().mockResolvedValue({ stock: '20' });
    mockQueryRunner.manager.create.mockReturnValue({ id: 1, tipo: 'entrada', cantidad: 5 });
    mockQueryRunner.manager.save.mockResolvedValue({ id: 1, tipo: 'entrada', cantidad: 5 });

    const result = await service.create({ productoId: 1, tipo: 'entrada', cantidad: 5, razon: 'compra' });
    expect(result.tipo).toBe('entrada');
    expect(result.cantidad).toBe(5);
  });

  // U5 — Salida con cantidad === stockActual es aceptada (caso límite crítico)
  it('debe aceptar una salida cuando la cantidad es exactamente igual al stock disponible', async () => {
    mockQueryRunner.manager.findOne.mockResolvedValue({ id: 1, activo: true });
    // stock = 10, cantidad = 10 → debe pasar
    mockQueryRunner.manager.createQueryBuilder.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ stock: '10' }),
    });
    mockQueryRunner.manager.create.mockReturnValue({ tipo: 'salida', cantidad: 10 });
    mockQueryRunner.manager.save.mockResolvedValue({ tipo: 'salida', cantidad: 10 });

    const result = await service.create({ productoId: 1, tipo: 'salida', cantidad: 10, razon: 'venta' });
    expect(result.cantidad).toBe(10);
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
  });

  // U6 — Salida que supera el stock lanza BadRequestException
  it('debe rechazar una salida cuando la cantidad supera el stock disponible', async () => {
    mockQueryRunner.manager.findOne.mockResolvedValue({ id: 1, activo: true });
    mockQueryRunner.manager.createQueryBuilder.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ stock: '5' }),
    });

    await expect(
      service.create({ productoId: 1, tipo: 'salida', cantidad: 6, razon: 'venta' })
    ).rejects.toThrow('supera el stock disponible');
    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
  });

  // U7 — Producto inactivo rechaza movimientos
  it('debe rechazar un movimiento sobre un producto inactivo', async () => {
    mockQueryRunner.manager.findOne.mockResolvedValue({ id: 1, activo: false });

    await expect(
      service.create({ productoId: 1, tipo: 'entrada', cantidad: 5, razon: 'compra' })
    ).rejects.toThrow('inactivo');
  });

  // U9 — Stock === stockMinimo aparece en alertas
  it('debe incluir en alertas el producto cuyo stock es exactamente igual al mínimo', async () => {
    // Ver implementación completa en inventory.service.spec.ts
  });
```

## SK3 — Pruebas PBT con fast-check

```typescript
import fc from 'fast-check';

describe('PBT — Propiedades de dominio', () => {
  // P1 — Stock nunca negativo
  it('P1: rechaza cualquier salida que llevaría el stock a negativo', () => {
    fc.assert(fc.property(
      fc.integer({ min: 0, max: 1000 }),
      fc.integer({ min: 1, max: 1001 }),
      (stockActual, cantidadSalida) => {
        if (cantidadSalida > stockActual) {
          expect(() => validarSalida(stockActual, cantidadSalida)).toThrow();
        } else {
          expect(() => validarSalida(stockActual, cantidadSalida)).not.toThrow();
        }
      }
    ));
  });

  // P2 — Cantidad siempre entera positiva
  it('P2: rechaza cantidad 0, negativa o decimal', () => {
    fc.assert(fc.property(
      fc.oneof(
        fc.constant(0),
        fc.integer({ max: -1 }),
        fc.float({ min: 0.001, max: 0.999 }),
        fc.float({ min: -0.999, max: -0.001 }),
      ),
      (cantidadInvalida) => {
        expect(() => validarCantidad(cantidadInvalida)).toThrow();
      }
    ));
  });

  // P3 — Stock consistente con movimientos
  it('P3: stockActual = Σentradas - Σsalidas para cualquier secuencia válida', () => {
    fc.assert(fc.property(
      fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 1, maxLength: 20 }),
      fc.array(fc.integer({ min: 1, max: 50 }),  { minLength: 0, maxLength: 10 }),
      (entradas, salidasCandidatas) => {
        const totalEntradas = entradas.reduce((a, b) => a + b, 0);
        let stockAcum = totalEntradas;
        const salidas = salidasCandidatas.filter(s => {
          if (s <= stockAcum) { stockAcum -= s; return true; }
          return false;
        });
        const stockEsperado = totalEntradas - salidas.reduce((a, b) => a + b, 0);
        expect(calcularStock(entradas, salidas)).toBe(stockEsperado);
        expect(stockEsperado).toBeGreaterThanOrEqual(0);
      }
    ));
  });

  // P9 — Alertas deterministas
  it('P9: alerta si y solo si stockActual <= stockMinimo', () => {
    fc.assert(fc.property(
      fc.integer({ min: 0, max: 200 }),
      fc.integer({ min: 0, max: 200 }),
      (stockActual, stockMinimo) => {
        const debeAlertar = stockActual <= stockMinimo;
        expect(evaluarAlerta(stockActual, stockMinimo)).toBe(debeAlertar);
      }
    ));
  });
});
```

## SK4 — Configuración Stryker

```json
// stryker.config.json
{
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  "testRunner": "jest",
  "coverageAnalysis": "perTest",
  "mutate": [
    "src/products/products.service.ts",
    "src/movements/movements.service.ts",
    "src/inventory/inventory.service.ts"
  ],
  "reporters": ["html", "clear-text", "progress"],
  "htmlReporter": { "fileName": "reports/mutation/index.html" },
  "thresholds": { "high": 80, "low": 70, "break": 60 },
  "timeoutMS": 10000
}
```

## SK5 — Pruebas E2E con Playwright

```typescript
// frontend/src/e2e/product-list.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Lista de Productos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('los productos se cargan y se muestran en pantalla', async ({ page }) => {
    await expect(page.getByRole('list')).toBeVisible();
    await expect(page.getByRole('listitem').first()).toBeVisible();
  });

  test('productos con stock bajo el mínimo muestran badge de alerta rojo', async ({ page }) => {
    const badge = page.getByText('Stock bajo').first();
    await expect(badge).toBeVisible();
  });
});

// frontend/src/e2e/movement-form.spec.ts
test.describe('Formulario de Movimiento', () => {
  test('registrar una entrada actualiza el stock del producto', async ({ page }) => {
    await page.goto('/movements/new');
    await page.getByLabel('Producto').selectOption({ index: 0 });
    await page.getByLabel('Tipo').selectOption('entrada');
    await page.getByLabel('Cantidad').fill('5');
    await page.getByLabel('Razón').selectOption('compra');
    await page.getByRole('button', { name: 'Registrar' }).click();
    await expect(page.getByText('Movimiento registrado correctamente')).toBeVisible();
  });

  test('salida que supera el stock muestra error y bloquea el submit', async ({ page }) => {
    await page.goto('/movements/new');
    await page.getByLabel('Producto').selectOption({ index: 0 });
    await page.getByLabel('Tipo').selectOption('salida');
    await page.getByLabel('Cantidad').fill('999999');
    await expect(page.getByText(/supera el stock disponible/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Registrar' })).toBeDisabled();
  });
});
```

## SK6 — Prompt para análisis de reporte Stryker

```
Dado este reporte de mutation testing de Stryker [PEGAR REPORTE]:

Para cada mutante superviviente:
1. Explica en lenguaje simple qué cambio introdujo el mutante.
2. Explica por qué mis pruebas actuales no lo detectaron.
3. Muestra exactamente qué prueba debo escribir para eliminarlo,
   incluyendo el valor exacto que debe verificar el expect.

Prioriza los mutantes que corrompen datos sin lanzar error (operaciones
aritméticas, comparaciones de igualdad, condiciones booleanas).
```
