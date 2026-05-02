import { MovementType } from './entities/movement.entity';

export function calculateNextStock(
  currentStock: number,
  type: MovementType,
  quantity: number,
): number {
  return type === MovementType.IN
    ? currentStock + quantity
    : currentStock - quantity;
}

export function canApplyMovement(
  currentStock: number,
  type: MovementType,
  quantity: number,
): boolean {
  if (quantity <= 0) {
    return false;
  }

  if (type === MovementType.OUT) {
    return quantity <= currentStock;
  }

  return true;
}
