/**
 * PBT — inventario / stock (dominio puro: stock.utils).
 *
 * Contraejemplos (fast-check): si `fc.assert` falla, Jest imprime `seed` y el
 * caso mínimo. Pasos de análisis:
 * 1) Anotar `seed` y el counterexample del mensaje de error.
 * 2) Comprobar si el fallo viola una regla de negocio (bug en `canApplyMovement`
 *    / `calculateNextStock`) o si el generador produjo valores fuera del dominio
 *    (p. ej. cantidades no enteras si se restringe a enteros).
 * 3) Corregir dominio o ajustar arbitraries; re-ejecutar con el mismo seed hasta pasar.
 *
 * Semilla fija opcional: FAST_CHECK_SEED=123 npm run test:pbt
 */
import fc from 'fast-check';
import { MovementType } from '../../src/movements/entities/movement.entity';
import {
  calculateNextStock,
  canApplyMovement,
} from '../../src/movements/stock.utils';

type Step = { kind: 'IN' | 'OUT'; qty: number };

const movementStepArb: fc.Arbitrary<Step> = fc.record({
  kind: fc.constantFrom<Step['kind']>('IN', 'OUT'),
  qty: fc.integer({ min: 1, max: 500 }),
});

const fcOptions = (): fc.Parameters => {
  const raw = process.env.FAST_CHECK_SEED;
  const seed =
    raw !== undefined && raw !== '' && !Number.isNaN(Number(raw))
      ? Number(raw)
      : 42;
  return { numRuns: 100, timeout: 10_000, seed };
};

describe('inventory stock property-based tests', () => {
  it('shouldKeepStockNonNegativeAfterEachAppliedStep', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 200 }),
        fc.array(movementStepArb, { minLength: 0, maxLength: 40 }),
        (initialStock, steps) => {
          let stock = initialStock;

          for (const step of steps) {
            const type =
              step.kind === 'IN' ? MovementType.IN : MovementType.OUT;
            if (!canApplyMovement(stock, type, step.qty)) {
              continue;
            }
            stock = calculateNextStock(stock, type, step.qty);
            expect(stock).toBeGreaterThanOrEqual(0);
          }
        },
      ),
      fcOptions(),
    );
  });

  it('shouldMatchFinalStockWithSumOfInsMinusSumOfAppliedOuts', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 200 }),
        fc.array(movementStepArb, { minLength: 0, maxLength: 50 }),
        (initialStock, steps) => {
          let stock = initialStock;
          let sumIn = 0;
          let sumOutApplied = 0;

          for (const step of steps) {
            const type =
              step.kind === 'IN' ? MovementType.IN : MovementType.OUT;
            if (!canApplyMovement(stock, type, step.qty)) {
              continue;
            }
            if (step.kind === 'IN') {
              sumIn += step.qty;
            } else {
              sumOutApplied += step.qty;
            }
            stock = calculateNextStock(stock, type, step.qty);
          }

          expect(stock).toBe(initialStock + sumIn - sumOutApplied);
        },
      ),
      fcOptions(),
    );
  });

  it('shouldNotChangeStockWhenOutboundIsRejected', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 200 }),
        fc.array(fc.integer({ min: -10, max: 250 }), { minLength: 1, maxLength: 35 }),
        (initialStock, quantities) => {
          let stock = initialStock;

          for (const qty of quantities) {
            const before = stock;
            if (!canApplyMovement(stock, MovementType.OUT, qty)) {
              expect(stock).toBe(before);
              continue;
            }
            stock = calculateNextStock(stock, MovementType.OUT, qty);
          }

          expect(stock).toBeGreaterThanOrEqual(0);
        },
      ),
      fcOptions(),
    );
  });
});
