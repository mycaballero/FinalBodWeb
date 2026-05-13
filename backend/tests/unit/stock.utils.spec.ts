import { MovementType } from '../../src/movements/entities/movement.entity';
import {
  calculateNextStock,
  canApplyMovement,
} from '../../src/movements/stock.utils';

describe('stock.utils', () => {
  describe('canApplyMovement', () => {
    it('shouldRejectMovementWhenQuantityIsZero', () => {
      expect(canApplyMovement(100, MovementType.IN, 0)).toBe(false);
      expect(canApplyMovement(100, MovementType.OUT, 0)).toBe(false);
    });

    it('shouldRejectMovementWhenQuantityIsNegative', () => {
      expect(canApplyMovement(100, MovementType.IN, -1)).toBe(false);
      expect(canApplyMovement(100, MovementType.OUT, -5)).toBe(false);
    });

    it('shouldAllowInboundMovementWhenQuantityIsPositive', () => {
      expect(canApplyMovement(0, MovementType.IN, 0.01)).toBe(true);
      expect(canApplyMovement(50, MovementType.IN, 100)).toBe(true);
    });

    it('shouldAllowOutboundMovementWhenQuantityIsLessThanOrEqualToStock', () => {
      expect(canApplyMovement(10, MovementType.OUT, 10)).toBe(true);
      expect(canApplyMovement(10, MovementType.OUT, 9.5)).toBe(true);
    });

    it('shouldRejectOutboundMovementWhenQuantityExceedsStock', () => {
      expect(canApplyMovement(5, MovementType.OUT, 6)).toBe(false);
    });
  });

  describe('calculateNextStock', () => {
    it('shouldIncreaseStockOnInbound', () => {
      expect(calculateNextStock(3, MovementType.IN, 2)).toBe(5);
    });

    it('shouldDecreaseStockOnOutbound', () => {
      expect(calculateNextStock(10, MovementType.OUT, 4)).toBe(6);
    });

    it('shouldYieldZeroStockWhenOutboundEqualsCurrent', () => {
      expect(calculateNextStock(7, MovementType.OUT, 7)).toBe(0);
    });
  });
});
