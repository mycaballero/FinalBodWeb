import fc from 'fast-check';
import { MovementType } from './entities/movement.entity';
import { calculateNextStock, canApplyMovement } from './stock.utils';

describe('Movements property-based tests', () => {
  it('nunca deja stock negativo para operaciones permitidas', () => {
    fc.assert(
      fc.property(
        fc.double({
          min: 0,
          max: 100000,
          noNaN: true,
          noDefaultInfinity: true,
        }),
        fc.double({
          min: 0.01,
          max: 100000,
          noNaN: true,
          noDefaultInfinity: true,
        }),
        fc.constantFrom(MovementType.IN, MovementType.OUT),
        (currentStock, quantity, type) => {
          if (!canApplyMovement(currentStock, type, quantity)) {
            return true;
          }
          return calculateNextStock(currentStock, type, quantity) >= 0;
        },
      ),
    );
  });
});
